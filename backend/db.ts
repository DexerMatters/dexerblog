import { Client } from "pg";
import util from "util";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { log } from "./utils.js";

const execAsync = util.promisify(exec);

const client = new Client({
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "dexerblog",
  user: process.env.DB_USER || "dexer",
  password: process.env.DB_PASSWORD || "root",
});

await client.connect();

export async function syncGithubRepo(
  url: string = "https://github.com/DexerMatters/dexerblog-docs.git"
) {
  // Check if the repository folder exists
  if (!fs.existsSync("./repo")) {
    log("Cloning GitHub repository...");
    await execAsync("git clone " + url + " ./repo");
    log("Repository cloned successfully.");
  }
  log("Pulling latest changes from GitHub repository...");
  await execAsync("git -C ./repo pull");
  log("Repository updated successfully.");
}

export async function updateCategories() {
  log("Updating categories from repository...");
  await clearDocuments();
  await clearCategories();
  let stack = readAllSubdirectories("./repo");
  let id_stack: (number | null)[] = stack.map(() => null);
  while (stack.length > 0) {
    const dir = stack.pop();
    const parent_id = id_stack.pop() || null;

    if (!dir) continue;
    const stat = fs.statSync(dir);
    if (stat.isDirectory()) {
      // Category case
      const description_path = path.join(dir, "description.md")
      let description = "";
      if (fs.existsSync(description_path)) {
        description = fs.readFileSync(description_path, "utf-8");
      }
      const subdirs = readAllSubdirectories(dir);
      const id = await insertCategory(parent_id, dir.split("/").pop() || "", description);
      stack.push(...subdirs);
      id_stack.push(...subdirs.map(() => id));
    }
    else {
      // Document case
      let title = dir.substring(dir.lastIndexOf("/") + 1);
      title = title.substring(0, title.lastIndexOf(".")) || "Untitled";
      await insertDocument(
        parent_id || 0,
        title || "Untitled",
        encodeURIComponent(dir.replace("repo", "content")),
        new Date(stat.birthtime),
        new Date(stat.mtime)
      );
    }
  }
  log("Categories updated successfully.");
}

export async function clearDocuments() {
  const result = await client.query('TRUNCATE TABLE documents RESTART IDENTITY CASCADE');
  return result.rows;
}

export async function selectTopCategories() {
  const result = await client.query('SELECT * FROM categories WHERE parent_id IS NULL');
  return result.rows;
}

export async function selectCategoryById(id: number) {
  const result = await client.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0];
}

export async function selectCategoryByTitle(title: string) {
  const result = await client.query('SELECT * FROM categories WHERE lower(title) = lower($1)', [decodeURIComponent(title)]);
  return result.rows[0];
}

export async function selectSubcategoriesByParentId(parent_id: number | null) {
  const result = await client.query('SELECT * FROM categories WHERE parent_id = $1', [parent_id]);
  return result.rows;
}

export async function selectSubcategoriesByTitle(title: string) {
  const text = `SELECT * FROM categories AS c
    WHERE EXISTS (
      SELECT 1 FROM categories AS p
      WHERE p.id = c.parent_id AND lower(p.title) = lower($1)
    )`;
  const result = await client.query(text, [decodeURIComponent(title)]);
  return result.rows;
}

export async function selectDocumentsById(id: number) {
  const result = await client.query('SELECT * FROM documents WHERE id = $1', [id]);
  return result.rows[0];
}

export async function queryDocuments(title: string | undefined, category_id: number | undefined) {
  let whereClause = '';
  let values: (string | number)[] = [];
  let paramIndex = 1;

  if (title) {
    whereClause += `title ILIKE $${paramIndex}`;
    values.push(`%${removeSuffix(decodeURIComponent(title), '.md')}%`);
    paramIndex++;
  }

  if (category_id) {
    if (whereClause) {
      whereClause += ' AND ';
    }
    whereClause += `category_id = $${paramIndex}`;
    values.push(category_id);
    paramIndex++;
  }

  if (!whereClause) {
    whereClause = '1=1'; // Return all documents if no filters
  }

  const text = `SELECT * FROM documents WHERE ${whereClause}`;
  const result = await client.query(text, values);
  return result.rows;
}

export async function selectDocumentsByCategoryId(category_id: number) {
  const result = await client.query('SELECT * FROM documents WHERE category_id = $1', [category_id]);
  return result.rows;
}

export async function selectDocumentsByCategoryTitle(title: string) {
  const text = `SELECT d.* FROM documents AS d
    JOIN categories AS c ON d.category_id = c.id
    WHERE lower(c.title) = lower($1)`;
  const result = await client.query(text, [decodeURIComponent(title)]);
  return result.rows;
}

async function clearCategories() {
  const result = await client.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
  return result.rows;
}

async function insertCategory(parent_id: number | null, title: string, description: string): Promise<number> {
  const text = 'INSERT INTO categories (parent_id, title, description) VALUES ($1, $2, $3) RETURNING id';
  const result = await client.query(text, [parent_id, decodeURIComponent(title), description]);
  return result.rows[0].id;
}

async function insertDocument(
  category_id: number,
  title: string,
  content_url: string,
  created_at: Date,
  modified_at: Date
): Promise<number> {
  const text = 'INSERT INTO documents (category_id, title, content_url, created_at, modified_at) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  const result = await client.query(text, [category_id, decodeURIComponent(title), content_url, created_at, modified_at]);
  return result.rows[0].id;
}

function readAllSubdirectories(baseDir: string): string[] {
  const subdirs = fs.readdirSync(baseDir)
    .filter((name) => !name.startsWith("."))
    .map((name) => path.join(baseDir, name))
  return subdirs;
}

function removeSuffix(str: string, suffix: string): string {
  if (str.endsWith(suffix)) {
    return str.slice(0, -suffix.length);
  }
  return str;
}

import postgres from "postgres";
import util from "util";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { log } from "./utils.js";

const execAsync = util.promisify(exec);

const sql = postgres({
  host: "0.0.0.0",
  port: 5432,
  database: "dexerblog",
  username: "dexer",
  password: "root",
})

async function selectAllCategories() {
  const categories = await sql`SELECT * FROM categories`;
  return categories;
}

async function syncGithubRepo(
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

async function syncDatabase() {
  log("Syncing database...");
  // Add your database sync logic here
  // This could involve running migrations or other setup tasks
  log("Database synced successfully.");
}

async function updateCategories() {
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
        encodeURI(dir.replace("repo", "content")),
        new Date(stat.birthtime),
        new Date(stat.mtime)
      );
    }
  }
  log("Categories updated successfully.");
}

async function clearDocuments() {
  return sql`
    TRUNCATE TABLE documents RESTART IDENTITY CASCADE
  `;
}

async function clearCategories() {
  return sql`
    TRUNCATE TABLE categories RESTART IDENTITY CASCADE
  `;
}

async function insertCategory(parent_id: number | null, title: string, description: string): Promise<number> {
  const result = await sql`
    INSERT INTO categories (parent_id, title, description)
    VALUES (${parent_id}, ${title}, ${description})
    RETURNING id
  `;
  return result[0].id;
}

async function insertDocument(
  category_id: number,
  title: string,
  content_url: string,
  created_at: Date,
  modified_at: Date
): Promise<number> {
  const result = await sql`
    INSERT INTO documents (category_id, title, content_url, created_at, modified_at)
    VALUES (${category_id}, ${title}, ${content_url}, ${created_at}, ${modified_at})
    RETURNING id
  `;
  return result[0].id;
}

function readAllSubdirectories(baseDir: string): string[] {
  const subdirs = fs.readdirSync(baseDir)
    .filter((name) => !name.startsWith("."))
    .map((name) => path.join(baseDir, name))
  return subdirs;
}

export { selectAllCategories, syncGithubRepo, syncDatabase, updateCategories };
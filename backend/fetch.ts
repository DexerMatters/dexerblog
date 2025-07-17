import { Octokit } from "octokit";

const octokit = new Octokit({});


export async function fetchContents(query: string = "") {

  const data = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "DexerMatters",
    repo: "dexerblog-docs",
    path: query
  });

  if (data.status !== 200) {
    throw new Error(`Failed to fetch data: ${data.status}`);
  }
  const contents = data.data ?? [];
  return contents
};

export async function fetchAllContents() {
  let allContents = [];

}

await fetchContents("");
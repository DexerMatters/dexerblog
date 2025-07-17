import { Octokit } from "octokit";
const octokit = new Octokit({});
async function fetchData(query = "") {
    const data = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "DexerMatters",
        repo: "dexerblog-docs",
        path: query
    });
    if (data.status !== 200) {
        throw new Error(`Failed to fetch data: ${data.status}`);
    }
    const contents = data.data ?? [];
    console.log(contents);
}
;
await fetchData("Home/index.md");

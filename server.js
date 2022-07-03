const http = require("http");
const fs = require("fs");
const data = fs.readFileSync("./config.json", "utf8");
const token = data["token"];
const { Octokit, App } = require("octokit");

const octokit = new Octokit({
    auth: token
});

// Example: http://localhost:8080/issues/pytorch/pytorch?sort=updated&direction=asc&creator=albanD
const requestListener = async function (req, res) {
    if (req.method === "GET" && req.url.startsWith("/issues/")) {
        let url = new URL(req.url, `http://${req.headers.host}`);
        let repo = req.url.slice(8).split('?')[0];
        if (repo && repo.indexOf('/') > 0 && repo.indexOf('/') < repo.length - 1) {
            try {
                let issues = await octokit.request(`GET /repos/{owner}/{repo}/issues${url.search}`, {
                    owner: repo.split('/')[0],
                    repo: repo.split('/')[1],
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(issues.data));
            } catch (e) {
                res.writeHead(501);
                res.end(`An error occurred while fetching issues: ${e.toString()}!`);
            }
        } else {
            res.writeHead(501);
            res.end("Repository name is incorrect!");
        }
    } else {
        res.writeHead(501);
        res.end("Method is not supported!");
    }
}

const server = http.createServer(requestListener);
server.listen(8080);
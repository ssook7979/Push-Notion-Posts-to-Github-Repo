const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const { Octokit } = require("octokit");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_ACCESS_TOKEN,
});

const getDatabaseId = async () => {
  const response = await notion.search({
    filter: {
      value: "database",
      property: "object",
    },
  });
  return response.results[0].id;
};
getDatabaseId().then(async (database_id) => {
  const pages = await notion.databases.query({
    database_id,
    filter: {
      property: "난이도",
      select: {
        equals: "⭐️⭐️⭐️",
      },
    },
  });
  const pageId = pages.results[0].id;
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdBase64 = btoa(n2m.toMarkdownString(mdblocks));

  /* writing to file
  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });*/

  // retreiving blocks
  /*
  if (!pageId) return;
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });
  */
  // TODO: use personal access token for prototype, will be replaced with OAuth2 authentication
  // https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#authenticating-with-a-personal-access-token
  // use Octokit for Github API request
  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  });

  // TODO: get username
  const username = await octokit
    .request("GET /user")
    .then((res) => res.data.login);
  // TODO: let user store designated github repository or search for github blog repo or ... more options..
  // TODO: store user settings(which repo to be updated etc..)
  // TODO: using github API find repository with name equals to [username].github.io
  // https://docs.github.com/ko/rest/search?apiVersion=2022-11-28#search-repositories
  const repoName = `${username}.github.io`;
  const repoId = await octokit
    .request(`GET /repos/${username}/${repoName}`)
    .then((res) => res.data.id);
  // TODO: create git repository on local directory
  // TODO: if files exist, push them to a designated remote repository
  // TODO: updating existing file
  // getting SHA blob: https://stackoverflow.com/questions/20207594/how-to-find-a-github-file-s-sha-blob
  const sha = await octokit
    .request(`GET /repos/${username}/${repoName}/${pageId}`)
    .then((res) => res.data.sha);
  octokit.request(`PUT /repos/${username}/${repoName}/${pageId}`, {
    message: "", // from notion property?
    content: mdBase64,
    sha,
  });
  // TODO: auto mode - cron job, manual mode - manually search updates and push to repository
  // TODO: ideas on this projects
  // - develope as a chrome extension?
  // - webhook?
});

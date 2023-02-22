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
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(mdString);

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
  octokit
    .request("GET /user", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((res) => console.log(`Logged in user is ${res.data.login}`));

  // TODO: using github API find repository with name equals to [username].github.io
  // https://docs.github.com/ko/rest/search?apiVersion=2022-11-28#search-repositories
  octokit
    .request("GET /repos/ssook7979/ssook7979.github.io", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((res) => console.log(`Blog repository id is ${res.data.id}`));
  // TODO: create git repository on local directory
  // TODO: if files exist, push them to a designated remote repository
});

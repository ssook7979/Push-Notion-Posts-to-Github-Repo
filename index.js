const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
require("dotenv").config();

const notion = new Client({
  auth: process.env.TOKEN,
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
  // TODO: using github API find repository with name equals to [username].github.io
  // TODO: create git repository on local directory
  // TODO: if files exist, push them to a designated remote repository
});

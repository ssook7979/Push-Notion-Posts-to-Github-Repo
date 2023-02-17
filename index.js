const { Client } = require("@notionhq/client");
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
  if (!pageId) return;
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });
  console.log(blocks);
});

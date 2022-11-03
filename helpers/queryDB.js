const { connectDB } = require("./connectDB");

module.exports.queryDB = queryDB;

async function queryDB(...query) {
  const { dbClient } = await connectDB();

  await dbClient.connect();

  const result = await dbClient.query(...query);

  await dbClient.end();

  return result;
}

const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { Client } = require("pg");

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD_PATH,
  DB_NAME,
  DB_QUERY_TIMEOUT,
  AWS_REGION,
} = process.env;

module.exports.connectDB = connectDB;

async function connectDB() {
  const ssm = new SSMClient({ region: AWS_REGION });
  const ssmCommand = new GetParameterCommand({
    Name: DB_PASSWORD_PATH,
    WithDecryption: true,
  });

  const ssmDbPassword = await ssm.send(ssmCommand);

  try {
    const dbClient = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: ssmDbPassword.Parameter.Value,
      database: DB_NAME,
      query_timeout: DB_QUERY_TIMEOUT,
    });

    return { dbClient };
  } catch (err) {
    console.error("connection error", err.stack);
  }
}

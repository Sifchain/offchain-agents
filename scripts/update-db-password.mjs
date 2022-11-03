import { config } from "dotenv-safer";

// throw error if .env values are not set
config();

import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

// AWS_REGION is set by aws-vault session
const { AWS_REGION, DB_PASSWORD_VALUE, OWNER } = process.env;

const ssm = new SSMClient({ region: AWS_REGION });

const params = {
  Name: "/offchain-agents/prod/db-password",
  Description: `Placed by offchain-agents - update-db-password.mjs as ${OWNER}`,
  Value: DB_PASSWORD_VALUE,
  Type: "SecureString",
  Overwrite: true,
};
const command = new PutParameterCommand(params);

console.log("\n⏳ Updating db password value...");

await ssm.send(command);

console.log(
  "\n⭐️ DB password updated! Lambda function will be using the new value now!\n"
);

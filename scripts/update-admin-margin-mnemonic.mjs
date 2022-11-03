import { config } from "dotenv-safer";

// throw error if .env values are not set
config();

import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

// AWS_REGION is set by aws-vault session
const { AWS_REGION, ADMIN_MARGIN_MNEMONIC_VALUE, OWNER } = process.env;

const ssm = new SSMClient({ region: AWS_REGION });

const params = {
  Name: "/offchain-agents/prod/admin-margin-mnemonic",
  Description: `Placed by offchain-agents - update-admin-margin-mnemonic.mjs as ${OWNER}`,
  Value: ADMIN_MARGIN_MNEMONIC_VALUE,
  Type: "SecureString",
  Overwrite: true,
};
const command = new PutParameterCommand(params);

console.log("\n⏳ Updating admin margin mnemonic value...");

await ssm.send(command);

console.log(
  "\n⭐️ Admin Margin mnemonic updated! Lambda function will be using the new value now!\n"
);

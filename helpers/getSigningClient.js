const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SifSigningStargateClient } = require("@sifchain/stargate");

const { RPC_PROTOCOL, RPC_HOSTNAME, RPC_PORT, AWS_REGION } = process.env;

module.exports.getSigningClient = async (mnemonicPath) => {
  const ssm = new SSMClient({ region: AWS_REGION });
  const ssmCommand = new GetParameterCommand({
    Name: mnemonicPath,
    WithDecryption: true,
  });

  const ssmMnemonic = await ssm.send(ssmCommand);

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    ssmMnemonic.Parameter.Value,
    {
      prefix: "sif",
    }
  );

  const [account] = await wallet.getAccounts();

  const node = `${RPC_PROTOCOL}://${RPC_HOSTNAME}:${RPC_PORT}`;

  const signingClient = await SifSigningStargateClient.connectWithSigner(
    node,
    wallet
  );

  const queryClient = signingClient.getQueryClient();

  return { wallet, account, signingClient, node, queryClient };
};

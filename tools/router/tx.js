// Args
const yargs = require('yargs');
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to use',
    type: 'string',
    default: 'testnet'
  })
  .option('router', {
    alias: 'r',
    description: 'The contract address for the UniswapV2Router02',
    type: 'string'
  })
  .option('tx', {
    alias: 't',
    description: 'The tx hash of a contract to inspect',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

const routerAddress = argv.router;
const txHash = argv.tx;

if (routerAddress == null || routerAddress == '') {
  console.log('You must supply a router address using --router CONTRACT_ADDRESS or -r CONTRACT_ADDRESS!');
  process.exit(0);
}

if (txHash == null || txHash == '') {
  console.log('You must supply a tx hash using --tx TX_HASH or -t TX_HASH!');
  process.exit(0);
}

// Libs
const { HmyEnv} = require("@swoop-exchange/utils");
const { decodeParameters, decodeInput } = require("../shared/contracts");

// Vars
const network = new HmyEnv(argv.network);
const factoryContract = network.loadContract('@swoop-exchange/periphery/build/contracts/UniswapV2Router02.json', routerAddress, 'deployer');

async function status() {
  const tx = await network.client.blockchain.getTransactionByHash({txnHash: txHash});
  const input = tx.result.input;

  for (let name in factoryContract.abiModel.getMethods()) {
    let method = factoryContract.abiModel.getMethod(name)

    method.decodeInputs = hexData => decodeParameters(factoryContract, method.inputs, hexData);
    method.decodeOutputs = hexData => decodeParameters(factoryContract, method.outputs, hexData);
  }

  var decoded = decodeInput(factoryContract, input);

  if (decoded && decoded.abiItem) {
    decoded = decoded.abiItem;
    console.log(`Method: ${decoded.name}`);
    console.log(`Method signature:`);
    console.log(decoded.inputs);
    console.log(`Method parameters:`);
    console.log(decoded.contractMethodParameters);
  }
}

status()
  .then(() => {
    process.exit(0);
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });

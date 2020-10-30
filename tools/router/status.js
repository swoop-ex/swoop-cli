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
  .help()
  .alias('help', 'h')
  .argv;

const routerAddress = argv.router;

if (routerAddress == null || routerAddress == '') {
  console.log('You must supply a router address using --router CONTRACT_ADDRESS or -r CONTRACT_ADDRESS!');
  process.exit(0);
}

// Libs
const { HmyEnv} = require("@swoop-exchange/utils");

// Vars
const network = new HmyEnv(argv.network);
const routerContract = network.loadContract('@swoop-exchange/periphery/build/contracts/UniswapV2Router02.json', routerAddress, 'deployer');
const routerInstance = routerContract.methods;

async function status() {
  console.log(`Router info for router ${routerAddress}:`);
  const factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`factory is set to: ${factoryAddress}`);
  
  const wethAddress = await routerInstance.WETH().call(network.gasOptions());
  console.log(`WETH/WONE is set to: ${wethAddress}\n`);
}

status()
  .then(() => {
    process.exit(0);
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });

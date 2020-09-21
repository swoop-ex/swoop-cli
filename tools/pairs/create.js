// Args
const yargs = require('yargs');
const argv = yargs
    .option('network', {
      alias: 'n',
      description: 'Which network to use',
      type: 'string',
      default: 'testnet'
    })
    .option('factory', {
      alias: 'f',
      description: 'The contract address for the UniswapV2Factory',
      type: 'string'
    })
    .option('tokena', {
      alias: 'a',
      description: 'The contract address for the first token of the pair',
      type: 'string'
    })
    .option('tokenb', {
      alias: 'b',
      description: 'The contract address for the second token of the pair',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

const factoryAddress = argv.factory;
const tokenAAddress = argv.tokena;
const tokenBAddress = argv.tokenb;

if (factoryAddress == null || factoryAddress == '') {
  console.log('You must supply a factory address using --factory CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!');
  process.exit(0);
}

if (tokenAAddress == null || tokenAAddress == '') {
  console.log('You must supply the token A/first token contract address using --tokena CONTRACT_ADDRESS or -a CONTRACT_ADDRESS!');
  process.exit(0);
}

if (tokenBAddress == null || tokenBAddress == '') {
  console.log('You must supply the token B/second token contract address using --tokenb CONTRACT_ADDRESS or -b CONTRACT_ADDRESS!');
  process.exit(0);
}

// Libs
const web3 = require('web3');
const { NetworkEnv } = require("@harmony-swoop/utils");
const { getAddress } = require("@harmony-js/crypto");

// Vars
const network = new NetworkEnv(argv.network);
const v2Factory = require('@harmony-swoop/core/build/contracts/UniswapV2Factory.json');

const factoryContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
const factoryInstance = factoryContract.methods;

/*const tokenAContract = network.loadContract('@harmony-swoop/core/build/contracts/HRC20.json', tokenAAddress, 'deployer');
const tokenAInstance = tokenContract.methods;

const tokenBContract = network.loadContract('@harmony-swoop/core/build/contracts/HRC20.json', tokenBAddress, 'deployer');
const tokenBInstance = tokenContract.methods;*/

const walletAddress = factoryContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  let length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`allPairsLength: ${length.toNumber()}`)

  /*result = await factoryInstance.feeToSetter().call(network.gasOptions());
  console.log("Result from feeToSetter")
  console.log(result)*/
}

async function createPair() {
  let result = await factoryInstance.createPair(tokenAAddress, tokenBAddress).send(network.gasOptions());
  console.log(`status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}`);

  /*result = await factoryInstance.setFeeToSetter(walletAddress).send(network.gasOptions());
  console.log(result.status)*/
}

status()
  .then(() => {
    createPair().then(() => {
      status().then(() => {
        process.exit(0);
      })
    })
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });

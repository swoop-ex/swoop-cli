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
const { HmyEnv} = require("@swoop-exchange/utils");
const { getAddress } = require("@harmony-js/crypto");

// Vars
const network = new HmyEnv(argv.network);

const factoryContract = network.loadContract('@swoop-exchange/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
const factoryInstance = factoryContract.methods;

/*const tokenAContract = network.loadContract('@swoop-exchange/core/build/contracts/HRC20.json', tokenAAddress, 'deployer');
const tokenAInstance = tokenContract.methods;

const tokenBContract = network.loadContract('@swoop-exchange/core/build/contracts/HRC20.json', tokenBAddress, 'deployer');
const tokenBInstance = tokenContract.methods;*/

const walletAddress = factoryContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  let feeToSetter = await factoryInstance.feeToSetter().call(network.gasOptions());
  console.log(`The current feeToSetter address is ${feeToSetter}`)

    /*result = await factoryInstance.setFeeToSetter(walletAddress).send(network.gasOptions());
  console.log(result.status)*/

  let feeTo = await factoryInstance.feeTo().call(network.gasOptions());
  console.log(`The current feeTo address is ${feeTo}\n`)
}

async function createPair() {
  let length = await pairsLength();

  console.log(`Creating a new pair using tokens ${tokenAAddress} / ${tokenBAddress} ...`);
  let result = await factoryInstance.createPair(tokenAAddress, tokenBAddress).send(network.gasOptions());
  console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);

  if (result.status == 'rejected' && length == 0) {
    console.log(`Failed to create a new pair using tokens ${tokenAAddress} / ${tokenBAddress}`);
    console.log(`You're most likely running this command against a smart contract deployed on a version of Harmony lacking the ChainId opcode in the EVM implementation.`)
    console.log(`Use the EVM PR to run a compatible version on localnet: git fetch origin refs/pull/3356/head && git checkout -b rlan35/update_evm FETCH_HEAD && ./test/debug.sh\n`)
  }

  length = await pairsLength();
  let index = length-1;

  console.log(`Fetching pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
  let pairAddress = await factoryInstance.getPair(tokenAAddress, tokenBAddress).call(network.gasOptions());
  console.log(`The pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);

  if (index >= 0) {
    console.log(`Fetching pair address for the token pair via index ${index} ...`);
    pairAddress = await factoryInstance.allPairs(index).call(network.gasOptions());
    console.log(`The pair address for the token pair at index ${index} is: ${pairAddress}\n`);
  }
}

async function pairsLength() {
  let length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`There is a total of ${length.toNumber()} pair(s) created by this factory\n`)
  return length
}

status()
  .then(() => {
    createPair().then(() => {
      process.exit(0);
    })
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });

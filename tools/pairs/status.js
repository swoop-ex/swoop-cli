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
    .option('pair', {
      alias: 'p',
      description: 'The pair to check the pool status for, e.g. ONE/1BTC',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

const factoryAddress = argv.factory;

if (factoryAddress == null || factoryAddress == '') {
  console.log('You must supply a factory address using --factory CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!');
  process.exit(0);
}

var pair = null;
if (argv.pair != null && argv.pair != '' && argv.pair.includes('/')) {
  pair = argv.pair.split('/');
}

// Libs
const web3 = require('web3');
const { HmyEnv} = require("@swoop-exchange/utils");
const { getAddress } = require("@harmony-js/crypto");
const { parseTokens } = require("../shared/tokens");
const { Pair, Token } = require ("@swoop-exchange/sdk")

// Vars
const network = new HmyEnv(argv.network);
const tokens = parseTokens(network, 'all');

const factoryContract = network.loadContract('@swoop-exchange/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
const factoryInstance = factoryContract.methods;

/*const tokenAContract = network.loadContract('@swoop-exchange/core/build/contracts/HRC20.json', tokenAAddress, 'deployer');
const tokenAInstance = tokenContract.methods;

const tokenBContract = network.loadContract('@swoop-exchange/core/build/contracts/HRC20.json', tokenBAddress, 'deployer');
const tokenBInstance = tokenContract.methods;*/

const walletAddress = factoryContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  const length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`There is a total of ${length} pairs created by the factory ${factoryAddress} \n`);

  if (pair != null && pair.length == 2) {
    const tokenASymbol = pair[0];
    const tokenBSymbol = pair[1];

    const tokenAAddress = findToken(tokens, tokenASymbol);
    const tokenBAddress = findToken(tokens, tokenBSymbol);
    const expectedAddress = generatedPairAddress(tokenAAddress, tokenBAddress);

    console.log(`Expected pair address for the token pair ${tokenAAddress} / ${tokenBAddress} by the SDK is: ${expectedAddress}`);

    console.log(`Fetching pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
    let pairAddress = await factoryInstance.getPair(tokenAAddress, tokenBAddress).call(network.gasOptions());
    console.log(`The pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);
  } else {
    if (length > 0) {
      for (index = 0; index < length; index++) { 
        console.log(`Fetching pair address for the token pair via index ${index} ...`);
        pairAddress = await factoryInstance.allPairs(index).call(network.gasOptions());
        console.log(`The pair address for the token pair at index ${index} is: ${pairAddress}\n`);
      }
    }
  }

}

function findToken(tokens, name) {
  let matches = tokens.filter(function(token) {
    return token.symbol.toLowerCase() == name.toLowerCase();
  });

  const address = (matches && matches.length == 1) ? matches[0].address : null;

  return address;
}

function generatedPairAddress(addressA, addressB) {
  const tokenA = new Token(network.chainId, addressA, 18);
  const tokenB = new Token(network.chainId, addressB, 18);

  const expectedAddress = Pair.getAddress(tokenA, tokenB);

  return expectedAddress;
}

status()
  .then(() => {
    process.exit(0);
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });

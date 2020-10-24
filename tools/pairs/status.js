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
    .help()
    .alias('help', 'h')
    .argv;

const factoryAddress = argv.factory;

if (factoryAddress == null || factoryAddress == '') {
  console.log('You must supply a factory address using --factory CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!');
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
  const length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`There is a total of ${length} pairs created by the factory ${factoryAddress} \n`)

  if (length > 0) {
    for (index = 0; index < length; index++) { 
      console.log(`Fetching pair address for the token pair via index ${index} ...`);
      pairAddress = await factoryInstance.allPairs(index).call(network.gasOptions());
      console.log(`The pair address for the token pair at index ${index} is: ${pairAddress}\n`);
    }
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

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
    .option('amounta', {
      alias: 'c',
      description: 'The amount of tokens for token A to add to the pool',
      type: 'string',
      default: '1'
    })
    .option('amountb', {
      alias: 'd',
      description: 'The amount of tokens for token B to add to the pool',
      type: 'string',
      default: '1'
    })
    .option('minamounta', {
      alias: 'e',
      description: 'The minimum amount of tokens for token A to add to the pool',
      type: 'string',
      default: '1'
    })
    .option('minamountb', {
      alias: 'f',
      description: 'The minimum amount of tokens for token B to add to the pool',
      type: 'string',
      default: '1'
    })
    .option('generate-onchain-address', {
      alias: 'g',
      description: 'Generate an address using on the onchain pairAddressFor function - requires a custom router contract.',
      type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;

var routerAddress = argv.router;
var tokenAAddress = argv.tokena;
var tokenBAddress = argv.tokenb;

if (routerAddress == null || routerAddress == '') {
  console.log('You must supply a router address using --router CONTRACT_ADDRESS or -r CONTRACT_ADDRESS!');
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
const { getAddress: hmyGetAddress } = require("@harmony-js/crypto");

const { Pair, Token } = require("@harmony-swoop/sdk");

const { getAddress: ethGetAddress } = require("@ethersproject/address");

// Vars
const network = new NetworkEnv(argv.network);

routerAddress = ethGetAddress(routerAddress);
tokenAAddress = ethGetAddress(tokenAAddress);
tokenBAddress = ethGetAddress(tokenBAddress);

const amountADesired = web3.utils.toWei(argv.amounta);
const amountBDesired = web3.utils.toWei(argv.amountb);
const amountAMinimum = web3.utils.toWei(argv.minamounta);
const amountBMinimum = web3.utils.toWei(argv.minamountb);

const deadline = 100000;
const dateNow = Math.ceil(Date.now() / 1000);
const deadlineFromNow = dateNow + deadline

const routerContract = network.loadContract('@harmony-swoop/periphery/build/contracts/UniswapV2Router02.json', routerAddress, 'deployer');
const routerInstance = routerContract.methods;

const walletAddress = routerContract.wallet.signer.address;
const walletAddressBech32 = hmyGetAddress(walletAddress).bech32;

async function status() {
  let factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)

  const factoryContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
  const factoryInstance = factoryContract.methods;

  let length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`There is a total of ${length.toNumber()} pair(s) created by this factory\n`)

  console.log(`Fetching pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
  let pairAddress = await factoryInstance.getPair(tokenAAddress, tokenBAddress).call(network.gasOptions());
  console.log(`The pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);
}

async function createPair() {
  let factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)

  const factoryContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
  const factoryInstance = factoryContract.methods;

  console.log(`Creating a new pair using tokens ${tokenAAddress} / ${tokenBAddress} ...`);
  let result = await factoryInstance.createPair(tokenAAddress, tokenBAddress).send(network.gasOptions());
  console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
}

async function approvals() {
  const approveFor = [tokenAAddress, tokenBAddress];
  const approvalAmount = '1000000000';
  const approvalAmountWei = web3.utils.toWei(approvalAmount);
  
  for (const address of approveFor) {
    const erc20Contract = network.loadContract('@harmony-swoop/periphery/build/contracts/IERC20.json', address, 'deployer');
    const erc20ContractInstance = erc20Contract.methods;

    let balance = await erc20ContractInstance.balanceOf(walletAddress).call(network.gasOptions());
    console.log(`Balance of token ${address} for address ${walletAddress} is: ${web3.utils.fromWei(balance)}\n`);
    
    console.log(`Attempting to approve ${routerAddress} to spend ${approvalAmount} tokens (${address}) for ${walletAddress} ...`);
    const result = await erc20ContractInstance.approve(routerAddress, approvalAmountWei).send(network.gasOptions());
    console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
  }
}

async function addLiquidity() {
  console.log(`Adding liquidity for tokens ${tokenAAddress} (amount: ${argv.amounta}) / ${tokenBAddress} (amount: ${argv.amountb}) to router ${routerAddress} ...`);
  let result = await routerInstance.addLiquidity(tokenAAddress, tokenBAddress, amountADesired, amountBDesired, amountAMinimum, amountBMinimum, walletAddress, deadlineFromNow).send(network.gasOptions());
  console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
}

async function generateAddress() {
  const tokenA = new Token(network.chainId, tokenAAddress, 18);
  const tokenB = new Token(network.chainId, tokenBAddress, 18);

  const pairAddress = Pair.getAddress(tokenA, tokenB);

  console.log(`Javascript/Swoop SDK: The generated pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);

  if (argv['generate-onchain-address']) {
    let factoryAddress = await routerInstance.factory().call(network.gasOptions());
    console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)
  
    console.log(`Fetching calculated pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
    let pairAddress = await routerInstance.pairAddressFor(factoryAddress, tokenAAddress, tokenBAddress).call(network.gasOptions());
    console.log(`Solidity/UniswapV2Router02->pairAddressFor: The generated pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);
  }
}

status().then(() => {
  approvals().then(() => {
    addLiquidity().then(() => {
      status().then(() => {
        generateAddress().then(() => {
          process.exit(0);
        })
      })
    })
  })
})
.catch(function(err){
  console.log(err);
  process.exit(0);
})

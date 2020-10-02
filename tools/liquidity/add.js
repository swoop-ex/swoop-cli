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
    .help()
    .alias('help', 'h')
    .argv;

const routerAddress = argv.router;
const tokenAAddress = argv.tokena;
const tokenBAddress = argv.tokenb;

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
const { getAddress } = require("@harmony-js/crypto");

const amountADesired = web3.utils.toWei(argv.amounta);
const amountBDesired = web3.utils.toWei(argv.amountb);
const amountAMinimum = web3.utils.toWei(argv.minamounta);
const amountBMinimum = web3.utils.toWei(argv.minamountb);

// Vars
const network = new NetworkEnv(argv.network);

const deadline = 100000;
const dateNow = Math.ceil(Date.now() / 1000);
const deadlineFromNow = dateNow + deadline

const routerContract = network.loadContract('@harmony-swoop/periphery/build/contracts/UniswapV2Router02.json', routerAddress, 'deployer');
const routerInstance = routerContract.methods;

const walletAddress = routerContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

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
  const approvalAmount = 1000000000;
  const approvalAmountWei = web3.utils.toWei(argv.amounta);
  
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

async function checkGeneratedAddress() {
  let factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)

  console.log(`Fetching calculated pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
  let pairAddress = await routerInstance.pairAddress(factoryAddress, tokenAAddress, tokenBAddress).call(network.gasOptions());
  console.log(`The calculated pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);
}

status().then(() => {
  approvals().then(() => {
    addLiquidity().then(() => {
      status().then(() => {
        process.exit(0);
      })
    })
  })
})
.catch(function(err){
  console.log(err);
  process.exit(0);
})

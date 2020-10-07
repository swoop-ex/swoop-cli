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
const { hexToNumber} = require('@harmony-js/utils');

const { Pair, Token, WONE } = require("@harmony-swoop/sdk");
const { getAddress: ethGetAddress } = require("@ethersproject/address");

// Vars
const network = new NetworkEnv(argv.network);
const woneAddress = ethGetAddress(WONE[network.chainId].address);

routerAddress = ethGetAddress(routerAddress);

const tokenAAddressIsONE = isONE(tokenAAddress);
tokenAAddress = tokenAAddressIsONE ? woneAddress : tokenAAddress;
tokenAAddress = ethGetAddress(tokenAAddress);

const tokenBAddressIsONE = isONE(tokenBAddress);
tokenBAddress = tokenBAddressIsONE ? woneAddress : tokenBAddress;
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

const woneContract = network.loadContract('@harmony-swoop/misc/build/contracts/WONE.json', woneAddress, 'deployer');
const woneInstance = woneContract.methods;

const walletAddress = routerContract.wallet.signer.address;
const walletAddressBech32 = hmyGetAddress(walletAddress).bech32;

function divider(linebreak) {
  repeat = 100;
  linebreak = typeof linebreak !== 'undefined' ? linebreak : false;
  console.log('-'.repeat(repeat));
  if (linebreak) {
    console.log('');
  }
}

async function status() {
  let factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)

  const factoryContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
  const factoryInstance = factoryContract.methods;

  let length = await factoryInstance.allPairsLength().call(network.gasOptions());
  console.log(`There is a total of ${length.toNumber()} pair(s) created by this factory\n`);

  console.log(`Fetching pair address for the token pair ${tokenAAddress} / ${tokenBAddress} ...`);
  let pairAddress = await factoryInstance.getPair(tokenAAddress, tokenBAddress).call(network.gasOptions());
  console.log(`The pair address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${pairAddress}\n`);

  if (pairAddress === '0x0000000000000000000000000000000000000000') {
    console.log(`The pair ${tokenAAddress} / ${tokenBAddress} doesn't exist yet!\n`);
  } else {
    let pairContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Pair.json', pairAddress, 'deployer');
    let pairInstance = pairContract.methods;

    let name = await pairInstance.name().call(network.gasOptions());
    console.log(`The name for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${name}\n`);

    let symbol = await pairInstance.symbol().call(network.gasOptions());
    console.log(`The symbol for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${symbol}\n`);

    let decimals = await pairInstance.decimals().call(network.gasOptions());
    console.log(`The decimals for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${decimals}\n`);

    let totalSupply = await pairInstance.totalSupply().call(network.gasOptions());
    console.log(`The total supply for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${web3.utils.fromWei(totalSupply)}\n`);

    let minimumLiquidity = await pairInstance.MINIMUM_LIQUIDITY().call(network.gasOptions());
    console.log(`The minimum liqudity for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${minimumLiquidity}\n`);

    let factory = await pairInstance.factory().call(network.gasOptions());
    console.log(`The factory address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${factory}\n`);

    let token0 = await pairInstance.token0().call(network.gasOptions());
    console.log(`The token0 address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${token0}\n`);

    let token1 = await pairInstance.token1().call(network.gasOptions());
    console.log(`The token1 address for the token pair ${tokenAAddress} / ${tokenBAddress} is: ${token1}\n`);

    let reserves = await pairInstance.getReserves().call(network.gasOptions());
    let timestamp = hexToNumber('0x'+reserves['_blockTimestampLast']);
    let dateTime = (timestamp > 0) ? stringDate(timestamp) : '';

    console.log(`The reserves for the token pair ${tokenAAddress} / ${tokenBAddress} is:`);
    console.log(`  Reserve 0: ${reserves['_reserve0']}`);
    console.log(`  Reserve 1: ${reserves['_reserve1']}`);
    console.log(`  BlockTimestampLast: ${dateTime} (${timestamp})\n`);
  }

  divider(true);
}

async function createPair() {
  let factoryAddress = await routerInstance.factory().call(network.gasOptions());
  console.log(`The factory address for the router ${routerAddress} is: ${factoryAddress}\n`)

  const factoryContract = network.loadContract('@harmony-swoop/core/build/contracts/UniswapV2Factory.json', factoryAddress, 'deployer');
  const factoryInstance = factoryContract.methods;

  console.log(`Creating a new pair using tokens ${tokenAAddress} / ${tokenBAddress} ...`);
  let result = await factoryInstance.createPair(tokenAAddress, tokenBAddress).send(network.gasOptions());
  console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
  
  divider(true);
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
    
    console.log(`Checking allowance for router ${routerAddress} to spend ${approvalAmount} tokens (${address}) for ${walletAddress} ...`);
    const allowance = await erc20ContractInstance.allowance(walletAddress, routerAddress).call(network.gasOptions());
    console.log(`Allowance for router ${routerAddress} to spend ${approvalAmount} tokens (${address}) for address ${walletAddress} is: ${web3.utils.fromWei(allowance)}\n`)

    if (allowance < approvalAmountWei) {
      console.log(`Attempting to approve router ${routerAddress} to spend ${approvalAmount} tokens (${address}) for ${walletAddress} ...`);
      const result = await erc20ContractInstance.approve(routerAddress, approvalAmountWei).send(network.gasOptions());
      console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
    }
  }
  
  divider(true);
}

async function addLiquidity() {
  let result = null;
  
  if (tokenAAddressIsONE || tokenBAddressIsONE) {
    let tokenAddress, amountTokenDesired, amountTokenMin, amountETHDesired, amountETHMin;

    if (tokenAAddressIsONE) {
      tokenAddress = tokenBAddress;
      amountTokenDesired = amountBDesired;
      amountTokenMin = amountBMinimum;
      amountETHDesired = amountADesired;
      amountETHMin = amountAMinimum;
    } else if (tokenBAddressIsONE) {
      tokenAddress = tokenAAddress;
      amountTokenDesired = amountADesired;
      amountTokenMin = amountAMinimum;
      amountETHDesired = amountBDesired;
      amountETHMin = amountBMinimum;
    }

    await woneStatus();

    console.log(`Adding liquidity for token ${tokenAddress} (amount: ${web3.utils.fromWei(amountTokenDesired)}) / ONE (amount: ${web3.utils.fromWei(amountETHMin)}) using router ${routerAddress} ...`);
    result = await routerInstance.addLiquidityETH(tokenAddress, amountTokenDesired, amountTokenMin, amountETHMin, walletAddress, deadlineFromNow).send({value: amountETHDesired, ...network.gasOptions()});

  } else {
    console.log(`Adding liquidity for tokens ${tokenAAddress} (amount: ${argv.amounta}) / ${tokenBAddress} (amount: ${argv.amountb}) using router ${routerAddress} ...`);
    result = await routerInstance.addLiquidity(tokenAAddress, tokenBAddress, amountADesired, amountBDesired, amountAMinimum, amountBMinimum, walletAddress, deadlineFromNow).send(network.gasOptions());
  }

  if (result) {
    console.log(`Status: ${result.status} - tx status: ${result.transaction.txStatus} - tx hash: ${result.transaction.receipt.transactionHash}\n`);
  }

  divider(true);
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

  divider(true);
}

function isONE(contractAddress) {
  switch (contractAddress.toLowerCase()) {
    case 'one':
    case 'wone':
      return true;

    default:
      return false;
  }
}

function stringDate(epoch) {
  var utcEta = new Date(0);
  utcEta.setUTCSeconds(epoch);
  
  return utcEta.toUTCString();
}

async function woneStatus() {
  console.log(`wONE contract address: ${woneAddress}\n`);

  let res = await network.client.blockchain.getBalance({address: walletAddress});
  let balance = hexToNumber(res.result);
  console.log(`ONE Balance for address ${walletAddress} (${walletAddressBech32}) is: ${web3.utils.fromWei(balance)} ONE\n`);

  let balanceOf = await woneInstance.balanceOf(walletAddress).call(network.gasOptions());
  console.log(`wONE Balance for address ${walletAddress} (${walletAddressBech32}) is: ${web3.utils.fromWei(balanceOf)} wONE\n`);

  divider(true);
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

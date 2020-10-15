// Args
const yargs = require('yargs');
const argv = yargs
    .option('network', {
      alias: 'n',
      description: 'Which network to use',
      type: 'string',
      default: 'testnet'
    })
    .option('token', {
      alias: 'c',
      description: 'What token to interact with',
      type: 'string'
    })
    .option('to', {
      alias: 't',
      description: 'Where to send tokens',
      type: 'array',
      coerce: array => {
        return array.flatMap(v => v.split(','))
      }
    })
    .option('amount', {
      alias: 'a',
      description: 'The amount of tokens to send',
      type: 'string',
      default: '1'
    })
    .option('one-amount', {
      alias: 'o',
      description: 'The amount of ONE to send (not required)',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

let tokenName = argv.token;
let to = argv.to;
let amountString = argv.amount;
let oneAmountString = argv['one-amount'];

if (tokenName == null || tokenName == '') {
  console.log('You must supply a token using --token TOKEN_NAME or -c TOKEN_NAME!');
  process.exit(0);
}

if (to == null || to.length == 0) {
  console.log('You must supply one or several addresses to send tokens to using --to ADDRESS1,ADDRESS2 or -t ADDRESS1,ADDRESS2!');
  process.exit(0);
}

if (amountString == null || amountString == '') {
  console.log('You must supply the amount to transfer using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei');
  process.exit(0);
}

// Libs
const web3 = require('web3');
const { HmyEnv} = require("@harmony-swoop/utils");
const { fromBech32, toBech32 } = require("@harmony-js/crypto");
const { isBech32Address } = require("@harmony-js/utils");
const { hexToNumber} = require('@harmony-js/utils');
const { Account } = require("@harmony-js/account");
const { TransactionFactory } = require('@harmony-js/transaction');
const { Unit } = require('@harmony-js/utils');

// Vars
tokenName = tokenName.replace(/^1/i, 'One')

const network = new HmyEnv(argv.network);
const amount = web3.utils.toWei(amountString);
const tokens = parseTokens(tokenName);
const factory = new TransactionFactory();

function parseTokens(name) {
  var tokens = [];
  name = name.toLowerCase();
  const tokenList = require('@harmony-swoop/default-token-list');
  
  const matchingTokens = tokenList.tokens.filter(function(token) {
    return token.chainId == network.chainId;
  });

  if (matchingTokens == null || matchingTokens.length == 0) {
    console.log(`Couldn't find any tokens matching the chainId ${network.chainId} using the default token list...`);
    process.exit(0);
  }

  if (name == 'all') {
    tokens = matchingTokens;
  } else {
    let matchingTokensByName = matchingTokens.filter(function(token) {
      return token.name.toLowerCase() == name.toLowerCase();
    });
  
    if (matchingTokensByName == null || matchingTokensByName.length == 0) {
      console.log(`Couldn't find any tokens matching the name ${tokenName} ...`);
      process.exit(0);
    }

    tokens = matchingTokensByName;
  }

  return tokens;
}

async function send() {

  for(let toAddress of to) {
    var oneToAddress;

    if (isBech32Address(toAddress)) {
      oneToAddress = toAddress
      toAddress = fromBech32(toAddress);
    } else {
      oneToAddress = toBech32(toAddress);
    }

    for(let token of tokens) {
      const tokenAddress = token.address;
      const oneTokenAddress = toBech32(tokenAddress);
  
      const tokenContract = network.loadContract(`@harmony-swoop/misc/build/contracts/${token.name}.json`, tokenAddress, 'deployer');
      const tokenInstance = tokenContract.methods;
      
      const walletAddress = tokenContract.wallet.signer.address;
      const oneWalletAddress = toBech32(walletAddress);
  
      let total = await tokenInstance.totalSupply().call(network.gasOptions());
      let formattedTotal = web3.utils.fromWei(total);
      console.log(`Current total supply for the token ${token.name} (address: ${oneTokenAddress} / ${tokenAddress}) is: ${formattedTotal}\n`);
    
      console.log(`Checking ONE balance for address: ${oneWalletAddress} (${walletAddress})`);
      let res = await network.client.blockchain.getBalance({address: oneWalletAddress});
      let balance = hexToNumber(res.result);
      console.log(`ONE Balance for address ${oneWalletAddress} (${walletAddress}) is: ${web3.utils.fromWei(balance)} ONE\n`);

      if (oneAmountString && oneAmountString !== '') {
        console.log(`Sending ${oneAmountString} ONE from ${oneWalletAddress} (${walletAddress}) to: ${oneToAddress} (${toAddress})`);
        await oneTransfer(oneToAddress)
      }

      await tokenBalance(tokenInstance, token, walletAddress, oneWalletAddress);
    
      console.log(`Attempting to send ${amountString} ${token.name} to ${oneToAddress} (${toAddress}) ...`);
      let result = await tokenInstance.transfer(toAddress, amount).send(network.gasOptions());
      let txHash = result.transaction.receipt.transactionHash;
      console.log(`Sent ${amountString} ${token.name} to ${oneToAddress}, tx hash: ${txHash}\n`);

      await tokenBalance(tokenInstance, token, toAddress, oneToAddress);
    }
  }
}

async function tokenBalance(contractInstance, token, address, oneAddress) {
  let senderBalanceOf = await contractInstance.balanceOf(address).call(network.gasOptions());
  console.log(`${token.name} Balance for address ${oneAddress} (${address}) is: ${web3.utils.fromWei(senderBalanceOf)} ${token.name}\n`);
}

async function oneTransfer(toAddress) {
  const account = new Account(
    network.accounts['deployer'].privateKey,
    network.client.messenger
  );

  const tx = factory.newTx({
    to: toAddress,
    value: new Unit(Number(oneAmountString)).asOne().toWei(),
    gasLimit: '21000',
    shardID: 0,
    toShardID: 0,
    gasPrice: new Unit('1').asGwei().toWei()
  });
  tx.setMessenger(network.client.messenger);

  let signedTx = await account.signTransaction(tx);
  const [txSent, hash] = await signedTx.sendTransaction();
  await txSent.confirm(hash);

  console.log(`Sent ${oneAmountString} ONE to ${toAddress}, tx hash: ${hash}\n`);
}

send().then(() => {
  process.exit(0);
})
.catch(function(err){
  console.log(err);
  process.exit(0);
});

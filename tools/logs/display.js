// Args
const yargs = require('yargs');
const argv = yargs
    .option('network', {
      alias: 'n',
      description: 'Which network to use',
      type: 'string',
      default: 'testnet'
    })
    .option('start-block', {
      alias: 's',
      description: 'Start block used to fetch logs',
      type: 'string'
    })
    .option('end-block', {
      alias: 'e',
      description: 'End block used to fetch logs',
      type: 'string',
      default: 'latest'
    })
    .help()
    .alias('help', 'h')
    .argv;

// Libs
const web3 = require('web3');
const { HmyEnv} = require("@swoop-exchange/utils");
const { toBech32 } = require("@harmony-js/crypto");

const { getAddress } = require("@harmony-js/crypto");

const { Harmony } = require('@harmony-js/core');
const { ChainID, ChainType } = require('@harmony-js/utils');

const { Messenger } = require('@harmony-js/network');
const { RPCMethod } = require('@harmony-js/network');

// Vars
const network = new HmyEnv(argv.network);

async function display() {
  console.log('kek')
  const blockNumber = await network.getBlockNumber()
  console.log(`Current block: ${blockNumber}`);

  console.log(RPCMethod.GetPastLogs)

  const hmy = new Harmony(
    'ws://api.s0.b.hmny.io/',
    {
      chainType: ChainType.Harmony,
      chainId: ChainID.HmyTestnet,
    },
  );

  const tmp = hmy.blockchain.logs({
    from: '0x12'
  });

  console.log(tmp)
}

display().then(() => {
  process.exit(0);
})
.catch(function(err){
  console.log(err);
  process.exit(0);
});

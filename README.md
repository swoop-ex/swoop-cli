# swoop-cli

## Tools

### Pairs

Create a new token pair using the `UniswapV2Factory` contract.

```
node tools/pairs/create.js --network NETWORK --factory UNISWAPV2FACTORY --tokena TOKEN_ADDRESS --tokenb TOKEN_ADDRESS 
```

### Liquidity

Add liquidity to a pool.

```
node tools/liquidity/add.js --network NETWORK --router ROUTER_ADDRESS --tokena TOKEN_ADDRESS --tokenb TOKEN_ADDRESS
```

### Tokens

#### Transfering tokens

This is useful for e.g. transfering testing funds to test accounts.

The token address and what contract is used is automatically identified using the `--token NAME` parameter in combination with Swoop's default token list.

You can send one specific token, e.g:
```
node tools/tokens/transfer.js --network NETWORK --to ADDRESS --amount AMOUNT --token 1BUSD
```

Or perform transfers for all tokens available in Swoop's default token list:
```
node tools/tokens/transfer.js --network NETWORK --to ADDRESS --amount AMOUNT --token all
```

#### Swapping, ONE -> wONE
tools/tokens/wone.js - swap ONE for WONE
```
node tools/tokens/wone.js --network $NETWORK --token $WONE --amount 1
```

## Deployed contracts

| Contract          | Testnet                                                                                 | Mainnet     |
| ----------------- | --------------------------------------------------------------------------------------- | ----------- |
| UniswapV2Factory  | 0xcde697ddd88e91c6eeda0952df09454999a12d5a (one1ehnf0hwc36gudmk6p9fd7z29fxv6zt26jesf3l) | 0x828ce51a57c58441d949d62c411961115dc60d4a (one1s2xw2xjhckzyrk2f6ckyzxtpz9wuvr228j4ypa) |
| UniswapV2Router02 | 0x8346a5cfc632c1ee32e6fc2ab0e8de87974c69e7 (one1sdr2tn7xxtq7uvhxls4tp6x7s7t5c608juhu64) | 0x8f8beff9a5999ca8aed7e2617f50dd412254e7a5 (one13797l7d9nxw23tkhufsh75xagy39fea9ss6jzl) |
| Multicall         | 0xd078799c53396616844e2fa97f0dd2b4c145a685 (one16pu8n8zn89npdpzw975h7rwjknq5tf59x7c5mj) | 0x34b415f4d3b332515e66f70595ace1dcf36254c5 (one1xj6ptaxnkve9zhnx7uzett8pmneky4x93z5f2g) |
| WONE              | 0x807b8da767a712ec2f3ba6817981ea49d5f76b9b (one1spacmfm85ufwctem56qhnq02f82lw6um560m9q) | 0x4ea97f5bd0fd85e41a7172112a0b722592f5f183 (one1f65h7k7slkz7gxn3wggj5zmjykf0tuvrstn5e9) |
| OneBUSD           | 0x4ca9b6c9b9136230ced960d86f20da0cb57de525 (one1fj5mdjdezd3rpnkevrvx7gx6pj6hmef9r9jwsz) | 0x19c65f26beee949c57d617dde51582e3f62ced67 (one1r8r97f47a62fc47kzlw729vzu0mzemt8hd9h06) |
| OneBTC            | 0xd1d61befb4d89a370992f00776444e4b5bba58f5 (one168tphma5mzdrwzvj7qrhv3zwfddm5k84ullerk) | 0xd4da8c97f0a9133d52e469548a3dbe75defb182d (one16ndge9ls4yfn65hyd92g50d7wh00kxpdk6ykpy) |
| OneETH            | 0x9740dfd28f028007eb3148cfe8427fde719f8496 (one1jaqdl550q2qq06e3fr87ssnlmecelpykrzqggu) | 0xec5806984d2a46124b2545250f5de4f2452e10b8 (one1a3vqdxzd9frpyje9g5js7h0y7fzjuy9cauv393) |
| OneChainlink      | 0x2c87f9d953e8f299488b3a22541b041b5ea8da6a (one19jrlnk2narefjjyt8g39gxcyrd023kn2e02cx0) | 0x29cf7ac26f5ed55b9a2821a29796a7cdc64a063d (one1988h4sn0tm24hx3gyx3f0948ehry5p3ahfppgm) |
| OneSeed           | 0x39328d607772e91a4beb889e88db2bda7c3159e4 (one18yeg6crhwt535jlt3z0g3ketmf7rzk0y8u69en) | 0xea0b36974872dbafd3766a38b40fa1e2d2881eff (one1ag9nd96gwtd6l5mkdgutgraputfgs8hlxx4ug7) |

# swoop-cli

## Requirements

Install package requirements: `yarn install`

### Private keys

If you intend to use functionality that modifies contract state, make sure to copy .env-example to .env and update private keys accordingly.

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

| Contract     | Testnet                                                                                 | Mainnet     |
| -----------  | --------------------------------------------------------------------------------------- | ----------- |
| FACTORY      | 0x3A3289aF62600bd7FF0811B546964F8C6a63dC72 (one18gegntmzvq9a0lcgzx65d9j0334x8hrjcs4ddr) | 0x8F7F3708CF68759E2FEC78746545882039B1F31f (one13alnwzx0dp6eutlv0p6x23vgyqumrucll8mwg7) |
| ROUTER02     | 0x78CE7F8691A3f9be2E953c7AE5ba48B8E36B5bb5 (one10r88lp5350umut5483awtwjghr3kkka4kfjj5u) | 0x0a91275aC54680E4ffAdB942d4E450AfECBA129f (one1p2gjwkk9g6qwfladh9pdfezs4lkt5y5lnpzw9w) |
| Multicall    | 0x4BAC6E1dAA31b877147e9465d73DCf823A54828C (one1fwkxu8d2xxu8w9r7j3jaw0w0sga9fq5v8gaecz) | 0xfaA0Aca7e9b9564fB33170946D3F48d4B7Db738D (one1l2s2eflfh9tylve3wz2x606g6jmakuud3fhcf2) |
| WONE         | 0x7466d7d0C21Fa05F32F5a0Fa27e12bdC06348Ce2 (one1w3nd05xzr7s97vh45raz0cftmsrrfr8zg26pdl) | 0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a (one1eanyppa9hvpr0g966e6zs5hvdjxkngn6jtulua) |
| OneBUSD      | 0x0E80905676226159cC3FF62B1876C907C91F7395 (one1p6qfq4nkyfs4nnpl7c43sakfqly37uu40nn5yj) | 0xE176EBE47d621b984a73036B9DA5d834411ef734 (one1u9mwheravgdesjnnqd4emfwcx3q3aae5hw36l2) |
| OneBTC       | 0xcA65E483e885BbECF8FBc3856593E66577e06bC2 (one1efj7fqlgska7e78mcwzktylxv4m7q67zwcvr6k) | 0x3095c7557bCb296ccc6e363DE01b760bA031F2d9 (one1xz2uw4tmev5kenrwxc77qxmkpwsrrukel9ucc5) |
| OneETH       | 0x1E120B3b4aF96e7F394ECAF84375b1C661830013 (one1rcfqkw62l9h87w2wetuyxad3cescxqqnkrnfcc) | 0xF720b7910C6b2FF5bd167171aDa211E226740bfe (one17ust0ygvdvhlt0gkw9c6mgs3ugn8gzl7xj9zr8) |
| OneLINK      | 0x2C6e26B2faD89bc52d043e78E3D980A08af0Ce88 (one193hzdvh6mzdu2tgy8euw8kvq5z90pn5g7j0kqd) | 0x218532a12a389a4a92fC0C5Fb22901D1c19198aA (one1yxzn9gf28zdy4yhup30my2gp68qerx929rv2ns) |
| OneSEED      | 0x6689F57AD16c374783585ba2C77F5316789886F2 (one1v6yl27k3dsm50q6ctw3vwl6nzeuf3phj072j9r) | -  |
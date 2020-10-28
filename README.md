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
| UniswapV2Factory  | 0x3Da4cACC882c7c356b979327625fe57f7dA31c8F (one18kjv4nyg937r26uhjvnkyhl90a76x8y07mt2gl) | 0x3A3289aF62600bd7FF0811B546964F8C6a63dC72 (one18gegntmzvq9a0lcgzx65d9j0334x8hrjcs4ddr) |
| UniswapV2Router02 | 0x15809f9a68b4e8350FAC0D5ae2F187A843252f60 (one1zkqflxngkn5r2ravp4dw9uv84ppj2tmqscfju7) | 0x5D7C4AcA7ae70F98e264ad4c040743bAe51cd27B (one1t47y4jn6uu8e3cny44xqgp6rhtj3e5nm30esz0) |
| Multicall    | 0x4BAC6E1dAA31b877147e9465d73DCf823A54828C (one1fwkxu8d2xxu8w9r7j3jaw0w0sga9fq5v8gaecz) | 0xfaA0Aca7e9b9564fB33170946D3F48d4B7Db738D (one1l2s2eflfh9tylve3wz2x606g6jmakuud3fhcf2) |
| WONE         | 0xF561b31d0c6f9c8b96a0Ee5DFADDaC9787Eaa70c (one174smx8gvd7wgh94qaewl4hdvj7r74fcvx8ry3p) | 0xF0e3E0218fD1C9C99f260E589935361fa07d7957 (one17r37qgv068yun8expevfjdfkr7s8672hn577vf) |
| OneBUSD      | 0xe9994435727Ed3843aab293F330f64344da3CFa4 (one1axv5gdtj0mfcgw4t9ylnxrmyx3x68naysvpa9l) | 0x0D0207A709f5fd0e941595c8e2FcE85B9E9692Eb (one1p5pq0fcf7h7sa9q4jhyw9l8gtw0fdyht4yyrly) |
| OneBTC       | 0xBD0Ac0197EA36F168891233356A420A9EdD98edB (one1h59vqxt75dh3dzy3yve4dfpq48kanrkmh98806) | 0xb66c57F215826FB072D465739E86C6B281D33Df1 (one1kek90us4sfhmquk5v4eeapkxk2qax003g3uzgj) |
| OneETH       | 0x2dA47D9015ae48bC6A930FCF1EF59FAd556C2994 (one19kj8myq44eytc65npl83aavl442kc2v570dp88) | 0x341aE51C07Af9E418096aCB7EE513D7eCd1Ae5AA (one1xsdw28q8470yrqyk4jm7u5fa0mx34ed2ku5hr6) |
| OneChainlink | 0xafc2FD683F3fbb3e4130a35019F3a5c1F2368E76 (one14lp066pl87anusfs5dgpnua9c8erdrnkt76hyk) | 0x99e23c2267CB5B736a3c2DB20Bc4F0C7354d7EB7 (one1n83rcgn8eddhx63u9keqh38scu656l4hdmztud) |
| OneSeed      | 0x497a5Af3e37b19736C67A8CFeB1d2b9C3eb3E711 (one1f9a94ulr0vvhxmr84r87k8ftnslt8ec3uvw0ra) | 0x3d0412913036ed5D1da7D6B0895113e5c719aC10 (one185zp9yfsxmk468d866cgj5gnuhr3ntqs9vkhqy) |

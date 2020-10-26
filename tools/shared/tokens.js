exports.parseTokens = (network, name) => {
  var tokens = [];
  name = name.toLowerCase();
  const tokenList = require('@swoop-exchange/default-token-list');
  
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

  const filteredTokens = tokens.filter(function(token) {
    return token.symbol !== 'WONE';
  });

  return filteredTokens;
}

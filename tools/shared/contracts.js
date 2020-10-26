exports.decodeParameters = (contract, abi, hexData) => {
  if (0 == abi.length) return []
  let params = contract.abiCoder.decodeParameters(abi, hexData)
  params.length = abi.length
  //for (let i = 0; i < abi.length; i++) {
  //  if (abi[i].type.startsWith('address'))
  //    params[i] = hmySDK.crypto.toBech32(params[i]);
  //}
  return Array.from(params)
}

exports.decodeInput = (contract, hexData) => {
  let no0x = hexData.startsWith('0x') ? hexData.slice(2) : hexData
  let sig = no0x.slice(0, 8).toLowerCase()
  let method = contract.abiModel.getMethod('0x' + sig)
  if (!method) return false
  let argv = method.decodeInputs('0x' + no0x.slice(8))
  let obj = contract.methods['0x' + sig](...argv)

  for (let i = 0; i < obj.params.length; i++) {
    if (obj.abiItem.inputs[i].type == 'address')
      obj.params[i] = obj.params[i]
  }
  obj.toString = () => {
    let str = obj.abiItem.name + '('
    for (let i = 0; i < obj.params.length; i++) {
      if (i > 0) str += ', '
      str += obj.params[i]
    }
    str += ')'
    return str
  }
  return obj
}
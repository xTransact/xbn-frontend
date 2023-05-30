import BigNumber from 'bignumber.js'
import Web3 from 'web3/dist/web3.min.js'

const wei2Eth = (wei: BigNumber | number | string) => {
  try {
    let weiStr = wei
    if (!weiStr) return '--'
    if (BigNumber.isBigNumber(weiStr)) {
      weiStr = weiStr.integerValue().toFormat().replaceAll(',', '')
    } else if (typeof weiStr === 'number') {
      weiStr = wei.toString()
    }

    return Web3.utils.fromWei(weiStr, 'ether')
  } catch (error) {
    console.log('🚀 ~ file: unit-conversion.ts:16 ~ wei2Eth ~ error:', error)
    return '--'
  }
}
const eth2Wei = (eth: number | string) => {
  try {
    const ethStr = eth.toString()

    return Web3.utils.toWei(ethStr, 'ether')
  } catch (error) {
    console.log('🚀 ~ file: unit-conversion.ts:26 ~ eth2Wei ~ error:', error)
    return '--'
  }
}

const strToHex = (str: string) => {
  try {
    return Web3.utils.toHex(str)
  } catch (error) {
    return
  }
}
export { wei2Eth, eth2Wei, strToHex }

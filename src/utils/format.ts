import BigNumber from 'bignumber.js'

import { FORMAT_NUMBER } from '@/constants'

import { eth2Wei, wei2Eth } from './unit-conversion'

// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
const formatAddress = (address: string) => {
  const match = address.match(truncateRegex)
  if (!match) return address
  return `${match[1]}…${match[2]}`
}
const getFullNum = (num: number) => {
  //处理非数字
  if (isNaN(num)) {
    return num
  }

  //处理不需要转换的数字
  const str = '' + num
  if (!/e/i.test(str)) {
    return num
  }

  return num.toFixed(18).replace(/\.?0+$/, '')
}
const formatFloat = (x?: number | string | BigNumber, y?: number) => {
  if (x === undefined) return '--'
  if (x === 0) return '0'
  const xx = BigNumber.isBigNumber(x)
    ? x.toNumber()
    : typeof x === 'string'
    ? Number(x)
    : x
  if (xx < 0) return '0'
  const yy = y || FORMAT_NUMBER

  const f = Number(BigNumber(xx).toFixed(yy, BigNumber.ROUND_UP))
  // const f = Math.round(xx * 10 ** yy) / 10 ** yy
  const s = getFullNum(f).toString()
  return s
}

const formatWei = (x?: BigNumber, y?: number) => {
  if (x === undefined) return 0
  return eth2Wei(formatFloat(wei2Eth(x), y || FORMAT_NUMBER))
}

export { formatAddress, formatFloat, formatWei, getFullNum }

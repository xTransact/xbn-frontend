import BigNumber from 'bignumber.js'

import { FORMAT_NUMBER } from '@/constants'

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

// const formatAddress = (address: string) => {
//   if (!address) return ''
//   if (address?.length <= 9) return address
//   return `${address.substring(0, 5)}...${address
//     .toString()
//     .substring(address.length - 4, address.length)}`
// }

const formatFloat = (x: number | string | BigNumber, y?: number) => {
  const xx = BigNumber.isBigNumber(x)
    ? x.toNumber()
    : typeof x === 'string'
    ? Number(x)
    : x
  const yy = y || FORMAT_NUMBER
  const f = Math.round(xx * 10 ** yy) / 10 ** yy
  const s = f.toString()
  return s
}

export { formatAddress, formatFloat }

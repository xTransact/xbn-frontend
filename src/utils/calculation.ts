import BigNumber from 'bignumber.js'

import type { LOAN_DAYS_ENUM } from '@/pages/buy-nfts/NftAssetDetail'
/**
 *
 * @param p 贷款本金
 * @param i 每月利率 （年利率 除以 12）
 * @param n 每月利率
 * @returns 每月还款金额
 */
const amortizationCal = (p: number, i: number, n: number) => {
  return (p * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1)
}

/**
 *
 * @param principal 贷款本金
 * @param interest_rate 年利率
 * @param loan_period_days 贷款期数（以天为单位） 7 | 14 | 30 | 60 | 90
 * @param x 分 x 期 1 | 2 | 3
 * @returns 每 n 天还款金额
 */
const amortizationCalByDays = (
  principal: number,
  interest_rate: number,
  loan_period_days: LOAN_DAYS_ENUM,
  x: 1 | 2 | 3,
) => {
  if (
    Number.isNaN(principal) ||
    Number.isNaN(interest_rate) ||
    Number.isNaN(loan_period_days) ||
    Number.isNaN(x)
  ) {
    return BigNumber(0)
  }
  // installment = loan_period_days / x 表示：每 installment 天还款
  const installment = BigNumber(loan_period_days).dividedBy(x)
  // i = interest_rate / 365 / installment
  const i = BigNumber(interest_rate).dividedBy(365).multipliedBy(installment)
  // n =  loan_period_days / installment
  const n = BigNumber(loan_period_days).dividedBy(installment).integerValue()
  /**
   * return
   * principal * ( i * (1+i)**n ) / ((1+i)**n - 1)
   */
  const iPlus1powN = i.plus(1).pow(n)
  return iPlus1powN
    .multipliedBy(i)
    .dividedBy(iPlus1powN.minus(1))
    .multipliedBy(principal)
}

export { amortizationCal, amortizationCalByDays }

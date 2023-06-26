import BigNumber from 'bignumber.js'
import find from 'lodash-es/find'
import findLastIndex from 'lodash-es/findLastIndex'

import {
  BASE_RATE,
  COLLATERAL_MAP,
  RATE_POWER_VALUES,
  TENOR_MAP,
} from '@/constants/interest'
import type { LOAN_DAYS_ENUM } from '@/pages/buy-nfts/NftAssetDetail'

import { getKeyByValue } from './utils'
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
  if (interest_rate === 0) {
    return BigNumber(principal).dividedBy(x)
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

const computePoolPoint = (score?: BigNumber, pointsData?: number[]) => {
  if (!pointsData) return
  // const calculateScore = BigNumber(600)
  if (!score) return
  // const percent = [
  //   500, 500, 500, 1000, 1000, 1000, 1000, 1000, 1500, 1500, 1500,
  // ]
  // const percent = [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500]
  // const percent = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  // const percent = [500, 500, 500, 500, 500, 500, 500, 500, 1007, 1009, 1010]

  const index = findLastIndex(pointsData, (i) => score.gte(i))
  if (index === pointsData.length - 1) return 100
  if (index === -1) return 0
  // 1000
  const nextScore = BigNumber(pointsData[index + 1])
  const prevScore = BigNumber(pointsData[index])
  const diff = score.minus(prevScore)
  const rangeDiff = nextScore.minus(prevScore)
  const subPercent = diff.dividedBy(rangeDiff)
  return Number(
    subPercent
      .multipliedBy(10)
      .plus(index * 10)
      .toFixed(2),
  )
}

const getMaxSingleLoanScore = (amount: number, config: Map<number, number>) => {
  const arr = [...config.keys()]
  for (let i = 0; i < arr.length; i++) {
    if (amount >= arr[i]) {
      return config.get(arr[i])
    }
  }
}
//
const computePoolScore = (
  poolData?: PoolsListItemType,
  configData?: ConfigDataType,
  floorPrice?: number,
) => {
  if (!floorPrice) return
  if (!poolData) return
  if (!configData) return
  const {
    weight: { x, y, z, w, u, v },
    loan_ratio,
    loan_term,
    // 贷款期限微调 bottom
    loan_term_adjustment_factor,
    // 贷款比例微调 right
    loan_ratio_adjustment_factor,
    max_loan_interest_rate,
    max_loan_amount,
  } = configData

  const {
    pool_maximum_percentage,
    maximum_loan_amount,
    pool_maximum_days,
    pool_maximum_interest_rate,
    loan_ratio_preferential_flexibility,
    loan_time_concession_flexibility,
  } = poolData

  const collateralKey =
    getKeyByValue(COLLATERAL_MAP, pool_maximum_percentage) ?? 4
  const tenorKey = getKeyByValue(TENOR_MAP, pool_maximum_days) ?? 5

  const cKey = `${tenorKey}-${collateralKey}`
  const defaultRate = BigNumber(BASE_RATE.get(cKey) as number)
  const interestRank = find(
    RATE_POWER_VALUES,
    (element) =>
      defaultRate.multipliedBy(element).toFormat(2, BigNumber.ROUND_UP) ===
      pool_maximum_interest_rate.toString(),
  )
  console.log('🚀 ~ file: calculation.ts:133 ~ interestRank:', interestRank)

  const maxLoanAmountMap: Map<number, number> = new Map()
  max_loan_amount.forEach(({ key, value }) => {
    const [start] = key.split('-')
    maxLoanAmountMap.set(Number(start) / 10000, value)
  })

  // 贷款比例分数
  const collateralScore = BigNumber(
    loan_ratio.find((i) => i.key === pool_maximum_percentage.toString())
      ?.value || 0,
  ).multipliedBy(x)

  // 单笔最大贷款金额分数
  const maxLoanAmountScore = BigNumber(
    getMaxSingleLoanScore(
      BigNumber(maximum_loan_amount).dividedBy(floorPrice).toNumber(),
      maxLoanAmountMap,
    ) || 0,
  ).multipliedBy(y)

  // 贷款期限分数
  const tenorScore = BigNumber(
    loan_term.find((i) => i.key == pool_maximum_days.toString())?.value || 0,
  ).multipliedBy(z)

  // 最大贷款利率分数
  const maxInterestScore = BigNumber(
    max_loan_interest_rate.find((i) => i.key === interestRank?.toString())
      ?.value || 0,
  ).multipliedBy(w)

  // 按贷款比例微调分数
  const ratioScore = BigNumber(
    loan_ratio_adjustment_factor.find(
      (i) => i.key === loan_ratio_preferential_flexibility.toString(),
    )?.value || 0,
  ).multipliedBy(u)

  // 按贷款期限微调分数
  const termScore = BigNumber(
    loan_term_adjustment_factor.find(
      (i) => i.key === loan_time_concession_flexibility.toString(),
    )?.value || 0,
  ).multipliedBy(v)

  return collateralScore
    .plus(maxLoanAmountScore)
    .plus(tenorScore)
    .plus(maxInterestScore)
    .plus(ratioScore)
    .plus(termScore)
}

export {
  amortizationCal,
  amortizationCalByDays,
  computePoolPoint,
  getMaxSingleLoanScore,
  computePoolScore,
}

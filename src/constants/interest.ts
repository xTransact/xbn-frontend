// 贷款天数
export const TENOR_MAP = new Map([
  [0, 1],
  [1, 3],
  [2, 7],
  [3, 14],
  [4, 30],
  [5, 60],
  [6, 90],
])

export const TENOR_KEYS: number[] = [...TENOR_MAP.keys()]
export const TENOR_VALUES: number[] = [...TENOR_MAP.values()]

// 贷款比例
export const COLLATERAL_MAP = new Map([
  [0, 1000],
  [1, 2000],
  [2, 3000],
  [3, 4000],
  [4, 5000],
  [5, 6000],
  [6, 7000],
  [7, 8000],
  [8, 9000],
  [9, 10000],
])

export const COLLATERAL_KEYS = [...COLLATERAL_MAP.keys()]
export const COLLATERAL_VALUES = [...COLLATERAL_MAP.values()]

// 调节系数 * %
export const RATE_POWER_MAP = new Map([
  [0, 0],
  [1, 0.2],
  [2, 0.4],
  [3, 0.6],
  [4, 0.8],
  [5, 1],
  [6, 1.2],
  [7, 1.5],
  [8, 2],
  [9, 5],
  [10, 10],
])

export const RATE_POWER_KEYS = [...RATE_POWER_MAP.keys()]
export const RATE_POWER_VALUES = [...RATE_POWER_MAP.values()]

// 微调bottom系数
export const TERM_POWER_MAP = new Map([
  [0, 0.9],
  [1, 0.95],
  [2, 0.98],
  [3, 0.99],
  [4, 1],
])
export const TERM_POWER_KEYS = [...TERM_POWER_MAP.keys()]
export const TERM_POWER_VALUES = [...TERM_POWER_MAP.values()]

export const RATIO_POWER_MAP = new Map([
  [0, 1],
  [1, 0.99],
  [2, 0.98],
  [3, 0.95],
  [4, 0.9],
])
export const RATIO_POWER_KEYS = [...RATIO_POWER_MAP.keys()]
export const RATIO_POWER_VALUES = [...RATIO_POWER_MAP.values()]

// 0-0 means 贷款 1 天 & 贷款 10%
export const BASE_RATE = new Map([
  // 1 天
  ['0-0', 371],
  ['0-1', 412],
  ['0-2', 448],
  ['0-3', 508],
  ['0-4', 565],
  ['0-5', 628],
  ['0-6', 697],
  ['0-7', 775],
  ['0-8', 861],
  ['0-9', 957],

  // 3 天
  ['1-0', 412],
  ['1-1', 458],
  ['1-2', 508],
  ['1-3', 565],
  ['1-4', 628],
  ['1-5', 697],
  ['1-6', 775],
  ['1-7', 861],
  ['1-8', 957],
  ['1-9', 1063],

  // 7 天
  ['2-0', 458],
  ['2-1', 508],
  ['2-2', 565],
  ['2-3', 628],
  ['2-4', 697],
  ['2-5', 775],
  ['2-6', 861],
  ['2-7', 957],
  ['2-8', 1063],
  ['2-9', 1181],

  // 14 天
  ['3-0', 508],
  ['3-1', 565],
  ['3-2', 628],
  ['3-3', 697],
  ['3-4', 775],
  ['3-5', 861],
  ['3-6', 957],
  ['3-7', 1063],
  ['3-8', 1181],
  ['3-9', 1312],

  // 30 天
  ['4-0', 565],
  ['4-1', 628],
  ['4-2', 697],
  ['4-3', 775],
  ['4-4', 861],
  ['4-5', 957],
  ['4-6', 1063],
  ['4-7', 1181],
  ['4-8', 1312],
  ['4-9', 1458],

  // 60 天
  ['5-0', 628],
  ['5-1', 697],
  ['5-2', 775],
  ['5-3', 861],
  ['5-4', 957],
  ['5-5', 1063],
  ['5-6', 1181],
  ['5-7', 1312],
  ['5-8', 1458],
  ['5-9', 1620],

  // 90 天
  ['6-0', 697],
  ['6-1', 775],
  ['6-2', 861],
  ['6-3', 957],
  ['6-4', 1063],
  ['6-5', 1181],
  ['6-6', 1312],
  ['6-7', 1458],
  ['6-8', 1620],
  ['6-9', 1800],
])

export const getMaxSingleLoanScore = (
  amount: number,
  config: Map<number, number>,
) => {
  const arr = [...config.keys()]
  for (let i = 0; i < arr.length; i++) {
    if (amount >= arr[i]) {
      return config.get(arr[i])
    }
  }
}

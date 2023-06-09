import type { UseToastOptions } from '@chakra-ui/react'

export { XBANK_CONTRACT_ABI, WETH_CONTRACT_ABI } from './contractABI'

export const XBANK_CONTRACT_ADDRESS = import.meta.env
  .VITE_XBANK_CONTRACT_ADDRESS
export const WETH_CONTRACT_ADDRESS = import.meta.env.VITE_WETH_CONTRACT_ADDRESS

export const RESPONSIVE_MAX_W = {
  xl: 1208,
  lg: 968,
  md: 768,
  sm: 390,
  xs: 320,
}

export const UNIT = 'ETH'
export const FORMAT_NUMBER = 8

export const LP_BASE_RATE: Record<string, number> = {
  '7-1000': 1100,
  '7-2000': 1200,
  '7-3000': 1800,
  '7-4000': 2000,
  '7-5000': 3000,
  '7-6000': 4000,
  '7-7000': 5000,
  '7-8000': 6000,
  '7-9000': 7000,
  '14-1000': 1200,
  '14-2000': 1400,
  '14-3000': 2100,
  '14-4000': 2500,
  '14-5000': 3500,
  '14-6000': 4500,
  '14-7000': 5500,
  '14-8000': 6500,
  '14-9000': 7500,
  '30-1000': 1300,
  '30-2000': 1600,
  '30-3000': 2400,
  '30-4000': 3000,
  '30-5000': 4000,
  '30-6000': 5000,
  '30-7000': 6000,
  '30-8000': 7000,
  '30-9000': 8000,
  '60-1000': 1400,
  '60-2000': 1800,
  '60-3000': 2700,
  '60-4000': 3500,
  '60-5000': 4500,
  '60-6000': 5500,
  '60-7000': 6500,
  '60-8000': 7500,
  '60-9000': 8500,
  '90-1000': 1500,
  '90-2000': 2000,
  '90-3000': 3000,
  '90-4000': 4000,
  '90-5000': 5000,
  '90-6000': 6000,
  '90-7000': 7000,
  '90-8000': 8000,
  '90-9000': 9000,
}

export const TENORS = [7, 14, 30, 60, 90]
export const LIST_DURATION = [1, 3, 7, 30, 60, 90]
export const COLLATERALS = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
]
export const INITIAL_TENOR = TENORS[3]
export const INITIAL_COLLATERAL = COLLATERALS[4]

export const STEPS_DESCRIPTIONS = [
  {
    title: 'Select collection',
    text: 'Choose the NFT collection you wish to use as collateral for a loan.',
  },
  {
    title: 'Risk Control',
    text: 'These two conditions can limit the amount of a loan, Your collection pool will use the smaller amount of these two conditions for lending.',
  },
  {
    title: 'Set Maximum loan tenor',
    text: 'It will determine the maximum duration of a single loan. As long as borrowers repay their loan at the end of the tenor, lenders cannot liquidate the loan positions.',
  },
  {
    title: 'Set maximum interest rate',
    text: 'Please choose an interest rate you want under the conditions of the maximum loan duration and maximum loan amount, and we will automatically generate a Lending Offer Table for you. If you are not satisfied with the parameters in the table, you can fine-tune them.\nLower interest rate lending offers will lend out faster.',
  },
]

export const TOAST_OPTION_CONFIG: UseToastOptions = {
  position: 'top',
  id: 'toast',
  containerStyle: {
    mt: 20,
  },
}

export const TWITTER_URL = 'https://twitter.com/xBank_Official'

export const LINKEDIN_URL = 'https://www.linkedin.com/company/xbank-global'

export const DISCORD_URL = 'https://discord.gg/PGBVwcaeQE'

export const MEDIUM_URL = 'https://medium.com/@xBankCrypto'
export const CHAIN_BASE_URL: Record<string, string> = {
  '0x1': 'https://etherscan.io/address/',
  '0x5': 'https://goerli.etherscan.io/address/',
}

export enum LISTING_TYPE {
  LISTING = 1,
  CANCEL = 2,
}

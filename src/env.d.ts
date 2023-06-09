/// <reference types="vite/client" />
interface Window {
  // ethereum?: any
  ethereum: any
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly CURRENT_ENV: string
  readonly VITE_XBANK_CONTRACT_ADDRESS: string
  readonly VITE_WETH_CONTRACT_ADDRESS: string
  readonly VITE_BASE_URL: string
  readonly VITE_TARGET_CHAIN_ID: string
  readonly VITE_TARGET_CHAIN_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'web3/dist/web3.min.js'

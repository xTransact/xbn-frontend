interface PoolsListItemType {
  id: number
  pool_id: number
  created_at: string
  owner_address: string
  allow_collateral_contract: string
  support_erc20_denomination: string
  pool_amount: number
  pool_used_amount: number
  loan_count: number
  pool_maximum_percentage: number
  pool_maximum_days: number
  pool_maximum_interest_rate: number
  loan_time_concession_flexibility: number
  loan_ratio_preferential_flexibility: number
  activity: boolean
  maximum_loan_amount: number
}

interface CollectionListItemType {
  id: string
  name: string
  image_url: string
  contract_addr: string
  safelist_request_status?: 'not_requested' | 'verified'
  description?: string
  // 暂定
  priority: number
  tags: string[]
}

interface AssetListItemType {
  id: number
  asset_contract_address: string
  token_id: string
  image_url: string
  image_preview_url: string
  image_thumbnail_url: string
  image_original_url: string
  animation_url: string
  animation_original_url: string
  background_color: string
  name: string
  description: string
  external_link: string
  likes: number
  order_chain: string
  order_coin: string
  order_price: string
  created_at: string
  updated_at: string
}

enum MARKET_TYPE_ENUM {
  OPENSEA = 'opensea',
  BLUR = 'blur',
}
interface LoanOrderDataType {
  // pool id
  pool_id: string
  // 买家地址
  borrower_address: string
  // nft 价格
  commodity_price: string
  // 地板价 传 commodity_price
  oracle_floor_price: string
  // 首付价格
  down_payment: string
  // 贷款金额
  loan_amount: string
  // 利率
  loan_interest_rate: number
  //
  loan_duration: number
  // n 期
  number_of_installments: number
  // token ID
  nft_collateral_id: string
  // platform
  platform: MARKET_TYPE_ENUM
}

enum LOAN_ORDER_STATUS {
  // 新建
  New = 1,
  // 收到首付
  DownPaymentConfirmed = 2,
  // 开始购买NFT时首先置的状态，防止重复处理
  PendingPurchase = 4,
  // 购买nft交易已广播
  PurchaseSubmitted = 8,
  // 购买交易已被打包，购买nft完成。购买NFT的最后一个状态
  PurchaseConfirmed = 16,
  // 开始调用合约beginLoan时首先置的状态，防止重复处理
  PendingLoan = 32,
  // 生成loan的交易已广播
  LoanSubmitted = 64,
  // final    未通过我们的校验，拒绝掉
  Rejected = 128,
  // final    marketplace拒绝了，比如no matching order
  MarketRejected = 256,
  // final
  Cancelled = 512,
  // final    给用户和LP退款
  Refunded = 1024,
  // 后端自用，用于不确定失败原因，找到原因后进行重试
  Failed = 2048,
  // final    loan 生成成功
  Completed = 4096,
}
interface LoanOrderItemType {
  borrower_address: string
  commodity_price: string
  created_at: string
  down_payment: string
  gas_used: number
  id: number
  loan_amount: string
  loan_duration: number
  loan_interest_rate: number
  nft_collateral_id: string
  number_of_installments: number
  oracle_floor_price: string
  platform: string
  pool_id: number
  status: LOAN_ORDER_STATUS
  status_history: number
  tx_id: string
  updated_at: string
  allow_collateral_contract: string
}

interface LoanListItemType {
  id: number
  loan_id: number
  pool_id: number
  pool_maximum_percentage: number
  pool_maximum_days: number
  pool_interest_rate: number
  loan_time_concession_flexibility: number
  loan_ratio_preferential_flexibility: number
  lender_address: string
  borrower_address: string
  down_payment: string
  loan_amount: string
  repaid_principal: string
  repaid_interest: string
  loan_status: 1 | 2 | 3
  installment: string
  lp_scheduled_received: string
  protocol_ir_multiplier: string
  loan_interest_rate: number
  loan_start_time: number
  loan_duration: number
  number_of_installments: number
  commodity_price: string
  oracle_floor_price: string
  nft_collateral_contract: string
  nft_collateral_id: string
  loan_erc20_denomination: string
  activity: boolean
}

interface MyAssetListItemType {
  asset_contract_address: string
  token_id: string
  qty: string
  mortgaged: boolean
  listed_with_mortgage: boolean
  list_price: string
}

enum LISTING_TYPE {
  LISTING = 1,
  CANCEL = 2,
}

enum LISTING_ORDER_STATUS {
  // 新建
  New = 1,
  // 开始处理时首先置的状态，防止重复处理
  PendingProgress = 2,
  // 需要进行 approve 时
  PendingApproval = 3,
  // 该资产已经进行过 approve/cancel交易已广播
  Approved = 8,
  // 已挂单
  Listed = 16,
  //
  CoinTransferred = 32,
  // final
  Rejected = 64,
  // final
  InstRejected = 128,
  // final 已取消
  Cancelled = 256,
  // final
  Expired = 512,
  // final
  Refunded = 1024,
  //
  Failed = 2048,
  // final 挂单被卖出
  Completed = 4096,
}
interface ListingDataType {
  type: LISTING_TYPE
  platform: string
  contract_address: string
  token_id: string
  network: string
  currency: string
  qty: number
  price?: string
  expiration_time?: number
  borrower_address: string
}

interface AssetPriceType {
  data: {
    marketplace: string
    blur_price?: {
      amount: number
      unit: string
    }
    opensea_price?: {
      amount: number
      unit: string
      hash: string
      chain: string
      protocol_address: string
    }
  }[]
}

interface ListingsItemType {
  act_gas_limit: number
  act_gas_price: string
  borrower_address: string
  contract_address: string
  created_at: string
  currency: string
  expiration_time: number
  gas_limit: number
  gas_price: string
  gas_used: number
  id: number
  network: string
  platform: string
  platform_ord_id: string
  price: string
  qty: number
  status: LISTING_ORDER_STATUS
  status_history: number
  sub_status: number
  token_id: string
  tx_id: string
  type: number
  updated_at: string
}

interface ConfigDataType {
  weight: {
    x: number
    y: number
    z: number
    w: number
    u: number
    v: number
  }
  loan_ratio: [
    {
      key:
        | '1000'
        | '2000'
        | '3000'
        | '4000'
        | '5000'
        | '6000'
        | '7000'
        | '8000'
        | '9000'
        | '10000'
      value: number
    },
  ]
  max_loan_amount: [
    {
      key: string
      value: number
    },
  ]
  loan_term: [
    {
      key: '1' | '3' | '7' | '14' | '30' | '60' | '90'
      value: number
    },
  ]
  max_loan_interest_rate: [
    {
      key: string
      value: number
    },
  ]
  loan_ratio_adjustment_factor: [
    {
      key: '10000' | '9900' | '9800' | '9500' | '9000'
      value: number
    },
  ]
  loan_term_adjustment_factor: [
    {
      key: '10000' | '9900' | '9800' | '9500' | '9000'
      value: number
    },
  ]
}

interface RankItemType {
  address: string
  rank?: number
  box_bronze_num?: number
  box_silver_num?: number
  box_gold_num?: number
  box_platinum_num?: number
}

interface RankDataType {
  info: RankItemType | null
  ranking_infos: RankItemType[]
  count: number
}

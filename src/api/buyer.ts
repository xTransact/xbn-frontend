import type { NftCollectionsByContractAddressesQuery } from '@/hooks'
import { getUserToken } from '@/utils/auth'
import request from '@/utils/request'

export const apiGetAssetsByCollection: (query: {
  asset_contract_address?: string
}) => Promise<AssetListItemType[]> = async (params) => {
  return await request.get(`/lending/api/v1/nft/assets`, {
    params,
  })
}

export const apiGetAssetDetail: (query: {
  asset_contract_address?: string
}) => Promise<any> = async (params) => {
  return await request.get(`/lending/api/v1/nft/assets`, {
    params,
  })
}

export const apiPostLoanOrder: (
  data: LoanOrderDataType,
) => Promise<any> = async (data) => {
  return await request.post(`/lending/api/v1/loan-order`, data)
}

export const apiGetMyAssets: (query: {
  wallet_address?: string
}) => Promise<MyAssetListItemType[]> = async (params) => {
  return await request.get(`/lending/api/v1/assets/nfts`, {
    params,
    headers: {
      Authorization: getUserToken()
        ? `Bearer ${getUserToken()?.token}`
        : undefined,
    },
  })
}

export const apiGetNftDetail: (variables: {
  assetContractAddress: string
  assetTokenId: string
}) => Promise<any> = async (variables) => {
  return await request.post(`/lending/query`, {
    operationName: 'AssetWithoutId',
    variables,
    query:
      'query AssetWithoutId($assetContractAddress: String, $assetTokenId: String) {\n  asset(assetContractAddress: $assetContractAddress, assetTokenID: $assetTokenId) {\n    id\n    createdAt\n    updatedAt\n    assetContractAddress\n    tokenID\n    imageUrl\n    imagePreviewUrl\n    imageThumbnailUrl\n    imageOriginalUrl\n    animationUrl\n    animationOriginalUrl\n    backgroundColor\n    name\n    description\n    externalLink\n    creator\n    owner\n    transferFee\n    transferFeePaymentToken\n    orderChain\n    orderCoin\n    orderPrice\n    rarity\n    rarityRank\n    rarityLevel\n    chain\n    nftAssetContract {\n      id\n      createdAt\n      updatedAt\n      address\n      assetContractType\n      createdDate\n      name\n      nftVersion\n      openseaVersion\n      schemaName\n      symbol\n      totalSupply\n      description\n      externalLink\n      imageUrl\n      openseaBuyerFeeBasisPoints\n      openseaSellerFeeBasisPoints\n      buyerFeeBasisPoints\n      sellerFeeBasisPoints\n      payoutAddress\n      __typename\n    }\n    nftAssetMetaData {\n      like\n      likeCount\n      __typename\n    }\n    __typename\n  }\n}',
  })
}
export const apiGetCollectionDetail: (variables: {
  assetContractAddresses: string[]
}) => Promise<{
  data: NftCollectionsByContractAddressesQuery
}> = async (variables) => {
  return await request.post(`/lending/query`, {
    operationName: 'NftCollectionsByContractAddresses',
    variables,
    query: `query NftCollectionsByContractAddresses($assetContractAddresses: [String!]!) {\n  nftCollectionsByContractAddresses(\n    assetContractAddresses: $assetContractAddresses\n  ) {\n    contractAddress\n    nftCollection {\n      assetsCount\n      bannerImageUrl\n      chatUrl\n      createdAt\n      createdDate\n      description\n      discordUrl\n      externalUrl\n      featuredImageUrl\n      fees {\n        address\n        name\n        value\n        __typename\n      }\n      id\n      imagePreviewUrl\n      imageThumbnailUrl\n      imageUrl\n      instagramUsername\n      largeImageUrl\n      mediumUsername\n      name\n      nftCollectionStat {\n        averagePrice\n        count\n        createdAt\n        floorPrice\n        floorPriceRate\n        id\n        marketCap\n        numOwners\n        numReports\n        oneDayAveragePrice\n        oneDayChange\n        oneDaySales\n        oneDayVolume\n        sevenDayAveragePrice\n        sevenDayChange\n        sevenDaySales\n        sevenDayVolume\n        thirtyDayAveragePrice\n        thirtyDayChange\n        thirtyDaySales\n        thirtyDayVolume\n        totalSales\n        totalSupply\n        totalVolume\n        updatedAt\n        __typename\n      }\n      onlyProxiedTransfers\n      openseaBuyerFeeBasisPoints\n      openseaSellerFeeBasisPoints\n      payoutAddress\n      safelistRequestStatus\n      shortDescription\n      slug\n      subscriberCount\n      telegramUrl\n      twitterUsername\n      updatedAt\n      wikiUrl\n      nftCollectionMetaData {\n        subscribe\n        subscribeCount\n        __typename\n      }\n      isCreatorFeesEnforced\n      __typename\n    }\n    __typename\n  }\n}`,
  })
}

export const apiTest: (id: string) => Promise<any> = async (variables) => {
  return await request.post(
    `https://www.fastmock.site/mock/9b1763038152f49675038983b826d34e/api/asset/${variables}`,
  )
}

export const apiGetXCurrency: () => Promise<{
  resources: {
    resource: {
      fields: {
        name: string
        price: number
      }
    }
  }[]
}> = async () => {
  return await request.get('/api/ver2/exchange/xcurrency/latest', {
    headers: {
      appkey: 'FAceBe8acE1A11e990a19F43a0Dae3f5',
    },
  })
}

export const apiPostListing: (data: ListingDataType) => Promise<any> = async (
  data,
) => {
  return await request.post(`/lending/api/v1/listings`, data)
}

export const apiGetLoan: (query: {
  contract_address: string
  token_id: string
}) => Promise<MyAssetListItemType[]> = async (params) => {
  return await request.get(`/lending/api/v1/assets/nfts`, {
    params,
  })
}

export const apiGetListings: (query: {
  borrower_address: string
  contract_address?: string
  token_id?: string
  type?: 1 | 2
  status?: 1 | 4096
}) => Promise<ListingsItemType[]> = async (params) => {
  return await request.get(`/lending/api/v1/listings`, {
    params: {
      ...params,
    },
  })
}

export const apiGetAssetPrice: (query: {
  contract_address: string
  token_id: string
}) => Promise<AssetPriceType> = async (params) => {
  return await request.get('/api/v1/nft/price', {
    params: {
      ...params,
      mode:
        import.meta.env.VITE_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

export const apiGetConfig: () => Promise<{
  config: ConfigDataType
}> = async () => {
  return await request.get(`/api/v1/xbn/config`)
}

export const apiGetEtherscanLogs: (
  params: Record<string, string>,
) => Promise<any> = async (params) => {
  return await request.get(`/api`, {
    params: {
      module: 'account',
      action: 'txlist',
      tag: 'latest',
      startblock: 9177401,
      page: 1,
      // apikey:'ZWXI6MVM78F9P4PSZUT3NPH81ZBKMI5FXN',
      ...params,
    },
  })
}

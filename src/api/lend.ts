import request from '@/utils/request'

export const apiGetActiveCollection: () => Promise<
  CollectionListItemType[]
> = async (params?: any) => {
  return await request.get('/lending/api/v1/nft/collections ', {
    params,
  })
}

export const apiGetPools: (query: {
  allow_collateral_contract?: string
  owner_address?: string
}) => Promise<PoolsListItemType[]> = async (query) => {
  return await request.get(`/lending/api/v1/nft/pools`, {
    params: query,
  })
}

export const apiGetLoans: (query: {
  pool_id?: number
  lender_address?: string
  borrower_address?: string
  nft_collateral_contract?: string
  nft_collateral_id?: string
}) => Promise<LoanListItemType[]> = async (params) => {
  return await request.get('/lending/api/v1/loans', {
    params,
  })
}

export const apiGetFloorPrice: (query: {
  slug: string
}) => Promise<{ floor_price: number }> = async (params) => {
  return await request.get('/api/v1/xbn/marketFloorPrice', {
    params: {
      ...params,
      mode:
        import.meta.env.VITE_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

export const apiGetPoolPoints: (params: {
  contract_address: string
}) => Promise<{
  percent: number[]
}> = async (params) => {
  return await request.get(`/api/v1/xbn/poolPoints`, {
    params: {
      ...params,
      mode:
        import.meta.env.VITE_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

import request from '@/utils/request'

export const apiGetActiveCollection: () => Promise<
  CollectionListItemType[]
> = async (params?: any) => {
  return await request.get('/lending/api/v1/nft/collections ', {
    params,
  })
}

export const apiGetPools: (
  query: Record<string, string>,
) => Promise<PoolsListItemType[]> = async (query) => {
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

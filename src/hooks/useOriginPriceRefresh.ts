import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import get from 'lodash-es/get'
import head from 'lodash-es/head'
import map from 'lodash-es/map'
import min from 'lodash-es/min'
import { useCallback, useEffect, useState } from 'react'

import { useAssetOrdersPriceLazyQuery } from './graphql'

import type { AssetOrdersPriceQuery, NftOrder } from './graphql'

const useOriginPriceRefresh = ({
  assetTokenId,
  assetContractAddress,
}: {
  assetTokenId: string
  assetContractAddress: string
}) => {
  const [commodityWeiPrice, setCommodityWeiPrice] = useState(BigNumber(0))

  const [openSeaOrders, setOpenSeaOrders] = useState<{ node: NftOrder }[]>()
  /* 查询 NFT 在 OpenSea 上的 Orders */
  const [
    queryOpenSeaAssetOrders,
    {
      loading: ordersPriceFetchLoading,
      startPolling: startPollingOpenSeaAssetOrders,
      stopPolling: stopPollingOpenSeaAssetOrders,
    },
  ] = useAssetOrdersPriceLazyQuery({
    fetchPolicy: 'network-only',
    onCompleted: (data: AssetOrdersPriceQuery) => {
      const _openSeaOrders = get(data, 'assetOrders.edges', []) as {
        node: NftOrder
      }[]
      setOpenSeaOrders(_openSeaOrders)
    },
  })
  const refreshOrderPrice = useCallback(() => {
    if (!assetContractAddress || !assetTokenId) return
    queryOpenSeaAssetOrders({
      variables: {
        assetTokenId,
        assetContractAddress,
        withUpdate: true,
      },
    })
  }, [assetContractAddress, assetTokenId, queryOpenSeaAssetOrders])
  useEffect(() => {
    if (!refreshOrderPrice) return
    refreshOrderPrice()
  }, [refreshOrderPrice])

  useEffect(() => {
    const updatedAt = get(head(openSeaOrders), 'node.updatedAt', '')
    if (updatedAt) {
      const updatedAtObj = dayjs(updatedAt)
      if (updatedAtObj.isValid()) {
        const msTime = dayjs(Date.now()).diff(updatedAtObj, 'minute')
        if (msTime > 1) {
          // 如果更新时间距离现在大于一分钟，则需要重新请求 OpenSea Orders 数据
          // 在一分钟之内 每隔 5s 请求一次数据，如果数据 updatedAt 距离当前时间小于一分钟，则停止请求
          stopPollingOpenSeaAssetOrders()
          startPollingOpenSeaAssetOrders(5000)
          setTimeout(() => {
            stopPollingOpenSeaAssetOrders()
          }, 1000 * 60)
        } else {
          stopPollingOpenSeaAssetOrders()
        }
      }
    }
  }, [
    openSeaOrders,
    stopPollingOpenSeaAssetOrders,
    startPollingOpenSeaAssetOrders,
    queryOpenSeaAssetOrders,
  ])

  useEffect(() => {
    const priceArr = map(openSeaOrders, (row) => {
      const x = get(row, 'node')
      const decimals = get(x, 'nftPaymentToken.decimals', 0)
      const weiDiffDecimals = 18 - Number(decimals)
      const price = get(x, 'price')
      const _price = new BigNumber(price).dividedBy(
        new BigNumber(10).pow(weiDiffDecimals),
      )
      return _price.toNumber()
    })
    const minPrice = min(priceArr) || 0
    setCommodityWeiPrice(BigNumber(minPrice))
  }, [openSeaOrders])
  return {
    refreshOrderPrice,
    commodityWeiPrice,
    ordersPriceFetchLoading,
    stopPollingOpenSeaAssetOrders,
    startPollingOpenSeaAssetOrders,
  }
}

export default useOriginPriceRefresh

import { useRequest } from 'ahooks'
import isEmpty from 'lodash-es/isEmpty'
import pLimit from 'p-limit'
import { useCallback } from 'react'

import { createWethContract } from '@/utils/createContract'

const limit = pLimit(10)
/**
 * 获取每个 pool 的 owner_address 的最新 weth 资产
 *
 * @param addressArr address 数组
 * @returns
 */
const useBatchWethBalance = (addressArr?: string[]) => {
  const batchFetchOwenAddressLatestBalance = useCallback(async () => {
    const balanceMap = new Map()

    if (!addressArr || isEmpty(addressArr)) return balanceMap
    const uniqAddress = [...new Set([...addressArr])]

    const wethContract = createWethContract()

    const input = uniqAddress?.map((item) => {
      return limit(() =>
        wethContract.methods
          .balanceOf(item)
          .call()
          .then((res: string) => {
            balanceMap.set(item, res)
          })
          .catch(() => console.log),
      )
    })

    if (!input) return balanceMap
    // Only one promise is run at once
    await Promise.all(input)

    return balanceMap
  }, [addressArr])
  return useRequest(batchFetchOwenAddressLatestBalance, {
    debounceWait: 100,
    retryCount: 5,
    ready: !!addressArr && !isEmpty(addressArr),
  })
}

export default useBatchWethBalance

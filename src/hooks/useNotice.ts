import useRequest from 'ahooks/lib/useRequest'
import compact from 'lodash-es/compact'
import { useMemo } from 'react'

import { apiGetNotice } from '@/api'
import type { NoticeItemType } from '@/components/notice-slider/NoticeSlider'

import type { DependencyList } from 'react'

type OptionType = {
  ready?: boolean
  refreshDeps?: DependencyList
  manual?: boolean
}
const useNotice = ({
  ready = true,
  refreshDeps,
  manual = false,
}: OptionType) => {
  const { data, loading, ...rest } = useRequest(apiGetNotice, {
    ready,
    refreshDeps,
    manual,
  })
  const formatData: NoticeItemType[] | undefined = useMemo(() => {
    if (!data) return
    return compact(
      data?.map(({ type }) => {
        switch (type) {
          case 1:
            return {
              title:
                'You have {} loan that is due in {} days, remember to repay',
              button: 'See Now',
            }
          case 2:
            return {
              title: 'You have {} loans in the process of being generated',
              button: 'View details',
            }

          default:
            return
        }
      }),
    )
  }, [data])
  return {
    data: formatData,
    loading,
    ...rest,
  }
}

export default useNotice

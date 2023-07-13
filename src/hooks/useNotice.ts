import useRequest from 'ahooks/lib/useRequest'
import bigNumber from 'bignumber.js'
import compact from 'lodash-es/compact'
import { useMemo, type DependencyList } from 'react'

import { apiGetNotice } from '@/api'
import type { NoticeItemType } from '@/components/notice-slider/NoticeSlider'
import { NotificationType } from '@/constants'

type OptionType = {
  ready?: boolean
  refreshDeps?: DependencyList
  manual?: boolean
}
const useNotice = (
  address: string,
  { ready = true, refreshDeps, manual = false }: OptionType,
) => {
  // const navigate = useNavigate()
  const { data, loading, ...rest } = useRequest(
    () =>
      apiGetNotice({
        wallet_address: address,
      }),
    {
      ready,
      refreshDeps,
      manual,
    },
  )
  const formatData: NoticeItemType[] | undefined = useMemo(() => {
    if (!data) return
    return compact(
      data?.map(({ type, left_time, sum }) => {
        switch (type) {
          case NotificationType.loan_repayment:
            let formatTime = ''
            if (left_time && left_time > 24) {
              formatTime = `${bigNumber(left_time)
                .dividedBy(24)
                .toFormat(bigNumber.ROUND_UP)} days`
            } else {
              formatTime = `${left_time} hours`
            }
            return {
              title: `You have ${sum} loan that is due in ${formatTime}, remember to repay`,
              button: 'See Now',
              link: '/loans',
            }
          case NotificationType.loan_in_generating:
            return {
              title: `You have ${sum} loans in the process of being generated`,
              button: 'View details',
              link: '/history',
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

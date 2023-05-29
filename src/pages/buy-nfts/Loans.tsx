import { Box, Heading, Flex, Text, Highlight, Spinner } from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import { unix } from 'dayjs'
import groupBy from 'lodash-es/groupBy'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { apiGetLoans } from '@/api'
import {
  ConnectWalletModal,
  ImageWithFallback,
  TableList,
  type ColumnProps,
} from '@/components'
import { FORMAT_NUMBER, UNIT } from '@/constants'
import { useBatchAsset, useWallet, useCatchContractError } from '@/hooks'
import { amortizationCalByDays } from '@/utils/calculation'
import { createWeb3Provider, createXBankContract } from '@/utils/createContract'
import { formatAddress } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

const Loans = () => {
  // const navigate = useNavigate()
  const { isOpen, onClose, interceptFn, currentAccount } = useWallet()
  const { toastError, toast } = useCatchContractError()
  const [repayLoadingMap, setRepayLoadingMap] =
    useState<Record<string, boolean>>()

  useEffect(() => {
    interceptFn()
  }, [interceptFn])

  const { loading, data, refresh } = useRequest(apiGetLoans, {
    ready: !!currentAccount,
    debounceWait: 100,
    defaultParams: [
      {
        borrower_address: currentAccount,
      },
    ],
  })

  // const currentCollectionLoans = useMemo(() => {
  //   return data?.data?.filter(
  //     (item: any) =>
  //       item.collectionId === selectCollection || !selectCollection,
  //   )
  // }, [data, selectCollection])

  const statuedLoans = useMemo(
    () =>
      groupBy(
        // currentCollectionLoans,
        data,
        'loan_status',
      ),
    [data],
  )

  const batchAssetParams = useMemo(() => {
    if (!data) return []
    return data?.map((i) => ({
      assetContractAddress: i.nft_collateral_contract,
      assetTokenId: i.nft_collateral_id,
    }))
  }, [data])
  const { data: bactNftListInfo } = useBatchAsset(batchAssetParams)

  const handleClickRepay = useCallback(
    (loan_id: string) => {
      interceptFn(async () => {
        try {
          const xBankContract = createXBankContract()
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: true,
          }))
          // 1. 查看需要偿还的金额
          const repaymentAmount = await xBankContract.methods
            .getNextRepaymentAmount(loan_id)
            .call()
          const provider = createWeb3Provider()

          const currentBalance = await provider.eth.getBalance(currentAccount)
          if (BigNumber(currentBalance).lt(Number(repaymentAmount))) {
            toast({
              title: 'Insufficient balance',
              status: 'warning',
            })
            setRepayLoadingMap((prev) => ({
              ...prev,
              [loan_id]: false,
            }))
            return
          }
          console.log(
            currentBalance,
            repaymentAmount,
            BigNumber(currentBalance).lt(Number(repaymentAmount)),
          )

          // 2. 调用 xbank.repayLoan
          const repayHash = await xBankContract.methods
            .repayLoan(loan_id)
            .send({
              from: currentAccount,
              gas: 300000,
              value: repaymentAmount,
            })
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: false,
          }))
          console.log(repayHash, 'qqqqqqq')
          toast({
            status: 'success',
            title: 'successful repayment',
          })
          refresh()
        } catch (error: any) {
          toastError(error)
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: false,
          }))
        }
      })
    },
    [interceptFn, currentAccount, refresh, toastError, toast],
  )

  const loansForBuyerColumns: ColumnProps[] = [
    {
      title: 'Asset',
      dataIndex: 'nft_asset_info',
      key: 'nft_asset_info',
      align: 'left',
      width: 180,
      render: (_: any, info: any) => {
        const currentInfo = bactNftListInfo?.find(
          (i) =>
            i?.tokenID === info.nft_collateral_id &&
            i?.assetContractAddress.toLowerCase() ===
              info.nft_collateral_contract.toLowerCase(),
        )
        // const currentInfo = bactNftListInfo?.get(
        //   JSON.stringify({
        //     address: info.nft_collateral_contract.toLowerCase(),
        //     tokenId: info.nft_collateral_id,
        //   }),
        // )
        return (
          <Flex alignItems={'center'} gap={'8px'}>
            <ImageWithFallback
              src={currentInfo?.imagePreviewUrl as string}
              w='40px'
              h='40px'
              borderRadius={4}
            />
            <Text
              w={'60%'}
              display='inline-block'
              overflow='hidden'
              whiteSpace='nowrap'
              textOverflow='ellipsis'
            >
              {currentInfo
                ? currentInfo?.name || `#${currentInfo?.tokenID}`
                : '--'}
            </Text>
          </Flex>
        )
      },
    },
    {
      title: 'Lender',
      dataIndex: 'lender_address',
      key: 'lender_address',
      render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
    },
    {
      title: 'Borrower',
      dataIndex: 'borrower_address',
      key: 'borrower_address',
      render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
    },
    {
      title: 'Start time',
      dataIndex: 'loan_start_time',
      key: 'loan_start_time',
      render: (value: any) => <Text>{unix(value).format('YYYY/MM/DD')}</Text>,
    },
    {
      title: 'Loan value',
      dataIndex: 'total_repayment',
      key: 'total_repayment',
      render: (value: any) => (
        <Text>
          {wei2Eth(value)} {UNIT}
        </Text>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'loan_duration',
      key: 'loan_duration',
      render: (value: any) => <Text>{value / 24 / 60 / 60} days</Text>,
    },
    {
      title: 'Interest',
      dataIndex: 'loan_interest_rate',
      key: 'loan_interest_rate',
      render: (_: any, item: Record<string, any>) => {
        return (
          <Text>
            {BigNumber(
              wei2Eth(
                amortizationCalByDays(
                  item?.total_repayment,
                  item?.loan_interest_rate / 10000,
                  (item?.loan_duration / 24 / 60 / 60) as 7 | 14 | 30 | 60 | 90,
                  item?.repay_times,
                )
                  .multipliedBy(item?.repay_times)
                  .minus(item.total_repayment),
              ),
            ).toFormat(FORMAT_NUMBER)}
            {UNIT}
          </Text>
        )
      },
    },
  ]

  return (
    <Box mt='60px'>
      <Heading size={'2xl'} mb='60px'>
        Loans
      </Heading>

      <Flex justify={'space-between'} mt='16px'>
        <Box w='100%'>
          <TableList
            tables={[
              {
                tableTitle: () => (
                  <Heading fontSize={'20px'}>Current Loans as Borrower</Heading>
                ),
                styleConfig: {
                  thTextProps: {
                    fontSize: '12px',
                    fontWeight: '500',
                  },
                  tdTextProps: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                },
                columns: [
                  ...loansForBuyerColumns,
                  // {
                  //   title: 'next payment date',
                  //   dataIndex: 'col10',
                  //   key: 'col10',
                  // },
                  {
                    title: 'Next payment amount',
                    dataIndex: 'col9',
                    key: 'col9',
                    render: (_: any, item: Record<string, any>) => (
                      <Text>
                        {BigNumber(
                          wei2Eth(
                            amortizationCalByDays(
                              item.total_repayment,
                              item.loan_interest_rate / 10000,
                              (item.loan_duration / 24 / 60 / 60) as
                                | 7
                                | 14
                                | 30
                                | 60
                                | 90,
                              item.repay_times,
                            ),
                          ),
                        ).toFormat(8)}
                        &nbsp;
                        {UNIT}
                      </Text>
                    ),
                  },
                  {
                    title: '',
                    dataIndex: 'loan_id',
                    key: 'loan_id',
                    fixedRight: true,
                    render: (value: any) => (
                      <Box
                        px='12px'
                        bg='white'
                        borderRadius={8}
                        cursor='pointer'
                        onClick={() => {
                          if (repayLoadingMap && repayLoadingMap[value]) {
                            return
                          }
                          handleClickRepay(value)
                        }}
                        w='68px'
                        textAlign={'center'}
                      >
                        {repayLoadingMap && repayLoadingMap[value] ? (
                          <Spinner color='blue.1' size={'sm'} />
                        ) : (
                          <Text
                            color='blue.1'
                            fontSize='14px'
                            fontWeight={'700'}
                          >
                            Repay
                          </Text>
                        )}
                      </Box>
                    ),
                  },
                ],

                loading: loading,
                data: statuedLoans[0],
                key: '1',
              },
              {
                styleConfig: {
                  thTextProps: {
                    fontSize: '12px',
                    fontWeight: '500',
                  },
                  tdTextProps: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                },
                tableTitle: () => (
                  <Heading fontSize={'20px'} mt={'40px'}>
                    <Highlight
                      styles={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: `gray.3`,
                      }}
                      query='(Paid Off)'
                    >
                      Previous Loans as Borrower(Paid Off)
                    </Highlight>
                  </Heading>
                ),

                columns: loansForBuyerColumns,
                loading: loading,
                data: statuedLoans[1],
                key: '2',
              },
              {
                styleConfig: {
                  thTextProps: {
                    fontSize: '12px',
                    fontWeight: '500',
                  },
                  tdTextProps: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                },
                tableTitle: () => (
                  <Heading fontSize={'20px'} mt={'40px'}>
                    <Highlight
                      styles={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: `gray.3`,
                      }}
                      query='(Overdue)'
                    >
                      Previous Loans as Borrower(Overdue)
                    </Highlight>
                  </Heading>
                ),
                columns: loansForBuyerColumns,
                loading: loading,
                data: statuedLoans[2],
                key: '3',
              },
            ]}
          />
        </Box>
      </Flex>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </Box>
  )
}

export default Loans

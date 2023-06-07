import {
  Box,
  Heading,
  Flex,
  Text,
  Highlight,
  Spinner,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  Modal,
  ModalBody,
  Button,
  Divider,
  Image,
  type ModalHeaderProps,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs, { unix } from 'dayjs'
import groupBy from 'lodash-es/groupBy'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { apiGetCollectionDetail, apiGetLoans } from '@/api'
import {
  ConnectWalletModal,
  ImageWithFallback,
  TableList,
  type ColumnProps,
  SvgComponent,
  LoadingComponent,
} from '@/components'
import { FORMAT_NUMBER, UNIT } from '@/constants'
import { useBatchAsset, useWallet, useCatchContractError } from '@/hooks'
import { createWeb3Provider, createXBankContract } from '@/utils/createContract'
import { formatAddress, formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

const xBankContract = createXBankContract()
const provider = createWeb3Provider()

const MODEL_HEADER_PROPS: ModalHeaderProps = {
  pt: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  fontSize: {
    md: '28px',
    sm: '22px',
    xs: '22px',
  },
  fontWeight: '700',
  position: 'sticky',
  top: 0,
  bg: 'white',
  zIndex: 2,
  display: 'flex',
  justifyContent: 'space-between',
  px: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  borderRadius: 16,
}

const Loans = () => {
  // const navigate = useNavigate()
  const { isOpen, onClose, interceptFn, currentAccount } = useWallet()
  const { toastError, toast } = useCatchContractError()
  const [repayLoadingMap, setRepayLoadingMap] =
    useState<Record<string, boolean>>()

  const [prepayLoadingMap, setPrepayLoadingMap] =
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
  const { data: bactNftListInfo, loading: nftLoading } =
    useBatchAsset(batchAssetParams)

  // 点击 repay
  const handleClickRepay = useCallback(
    (loan_id: string) => {
      interceptFn(async () => {
        try {
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: true,
          }))
          // 1. 查看需要偿还的金额
          const repaymentAmount = await xBankContract.methods
            .getNextRepaymentAmount(loan_id)
            .call()

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
          // 2. 调用 xbank.repayLoan
          await xBankContract.methods.repayLoan(loan_id).send({
            from: currentAccount,
            gas: 300000,
            value: repaymentAmount,
          })
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: false,
          }))
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
      title: 'Lender',
      dataIndex: 'lender_address',
      key: 'lender_address',
      render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
    },
    {
      title: 'Start time',
      dataIndex: 'loan_start_time',
      key: 'loan_start_time',
      render: (value: any) => (
        <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
      ),
    },
    {
      title: 'Loan value',
      dataIndex: 'loan_amount',
      key: 'loan_amount',
      render: (value: any) => (
        <Text>
          {formatFloat(wei2Eth(value))} {UNIT}
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
      dataIndex: 'pool_interest_rate',
      key: 'pool_interest_rate',
      render: (_: any, item: Record<string, any>) => {
        return (
          <Text>
            {BigNumber(
              wei2Eth(
                BigNumber(item.installment)
                  .multipliedBy(item?.number_of_installments)
                  .minus(item.loan_amount),
              ) || 0,
            ).toFormat(FORMAT_NUMBER, BigNumber.ROUND_UP)}
            {UNIT}
          </Text>
        )
      },
    },
  ]

  const [prepayData, setPrepayData] = useState<
    {
      name?: string
      imagePreviewUrl?: string
      tokenID?: string
      outstandingPrincipal: BigNumber
      interestOutstanding: BigNumber
    } & LoanListItemType
  >()

  // 当前 loan 的 nft 的 collection 数据
  const [collectionInfo, setCollectionInfo] = useState<{
    name: string
    safelistRequestStatus: string
  }>()
  const { loading: collectionLoading } = useRequest(apiGetCollectionDetail, {
    defaultParams: [
      {
        assetContractAddresses: [prepayData?.nft_collateral_contract || ''],
      },
    ],
    ready: !!prepayData,
    refreshDeps: [prepayData],
    onSuccess({ data: cData }) {
      const { nftCollectionsByContractAddresses } = cData

      if (!nftCollectionsByContractAddresses?.length) return
      const currentCollection = nftCollectionsByContractAddresses[0]
      const {
        nftCollection: { name, safelistRequestStatus },
      } = currentCollection

      setCollectionInfo({
        name,
        safelistRequestStatus,
      })
    },
  })

  // 点击 pay in advance, 读取当前 loan,并打开弹窗
  const handleClickPayInAdvance = useCallback(
    (info: LoanListItemType) => {
      if ((prepayLoadingMap && prepayLoadingMap[info.loan_id]) || nftLoading) {
        return
      }
      const currentInfo = bactNftListInfo?.find(
        (i) =>
          i?.tokenID === info.nft_collateral_id &&
          i?.assetContractAddress.toLowerCase() ===
            info.nft_collateral_contract.toLowerCase(),
      )
      const {
        repaid_principal,
        loan_amount,
        number_of_installments,
        loan_start_time,
        loan_interest_rate,
        loan_duration,
        lp_scheduled_received,
        repaid_interest,
      } = info

      // 应还本金 = 贷款本金 -  已还本金
      const outstandingPrincipal =
        BigNumber(loan_amount).minus(repaid_principal)

      // 日利率 = 年利率 / 365
      const dayRate = BigNumber(loan_interest_rate).dividedBy(365)
      // 上次还款时间 默认为借款开始时间
      let lastTime = BigNumber(loan_start_time)
      if (BigNumber(repaid_principal).gt(0)) {
        // 如果已还金额大于 0
        // 已还本息 = 已还本金 + 已还利息 （lp 利息 + 协议利息）
        const repaidAmount = BigNumber(repaid_principal).plus(repaid_interest)

        // 已还次数 = 已还金额 / 每期还款金额
        const payedTimes = repaidAmount.dividedBy(lp_scheduled_received)
        // 每期还款期限 = 还款期限 / 还款期数
        const perLoanDuration = BigNumber(loan_duration).dividedBy(
          number_of_installments,
        )
        // 上次还款时间 = 借款开始时间 + 每期还款期间 * 已还次数
        lastTime = BigNumber(loan_start_time).plus(
          perLoanDuration.multipliedBy(payedTimes),
        )
      }
      // 提前还款利息天数 = （当前时间 - （借款成功时间 || 上次还款时间））/ 24 向上取整
      const currentTime = dayjs(new Date()).unix()
      const preTimes = BigNumber(currentTime).minus(lastTime)
      const preDays = preTimes
        .dividedBy(24 * 60 * 60)
        .integerValue(BigNumber.ROUND_UP)

      const interestOutstanding = outstandingPrincipal
        .multipliedBy(dayRate.dividedBy(10000))
        .multipliedBy(preDays)

      setPrepayData({
        ...info,
        outstandingPrincipal,
        interestOutstanding: interestOutstanding.lt(0)
          ? BigNumber(0)
          : interestOutstanding,
        imagePreviewUrl: currentInfo?.imagePreviewUrl,
        name: currentInfo?.name,
        tokenID: currentInfo?.tokenID,
      })
    },
    [bactNftListInfo, prepayLoadingMap, nftLoading],
  )
  // 确认提前还款
  const handleConfirmPayInAdvance = useCallback(() => {
    interceptFn(async () => {
      if (!prepayData) return
      const { loan_id, outstandingPrincipal, interestOutstanding } = prepayData
      try {
        const amount = outstandingPrincipal.plus(interestOutstanding)
        setPrepayLoadingMap((prev) => ({
          ...prev,
          [loan_id]: true,
        }))

        const currentBalance = await provider.eth.getBalance(currentAccount)
        if (BigNumber(currentBalance).lt(amount)) {
          toast({
            title: 'Insufficient balance',
            status: 'warning',
          })
          setPrepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: false,
          }))
          return
        }
        // 2. 调用 xbank.prepayment
        await xBankContract.methods.prepayment(loan_id).send({
          from: currentAccount,
          gas: 300000,
          value: `${amount.integerValue().toNumber()}`,
        })
        setPrepayLoadingMap((prev) => ({
          ...prev,
          [loan_id]: false,
        }))
        toast({
          status: 'success',
          title: 'successful prepayment',
        })
        setTimeout(() => {
          refresh()
          setPrepayData(undefined)
        }, 1000)
      } catch (error: any) {
        toastError(error)

        setPrepayLoadingMap((prev) => ({
          ...prev,
          [loan_id]: false,
        }))
      }
    })
  }, [prepayData, refresh, toastError, toast, currentAccount, interceptFn])

  const handleClose = useCallback(() => {
    if (!prepayData) return
    if (prepayLoadingMap && prepayLoadingMap[prepayData?.loan_id]) return
    setPrepayData(undefined)
  }, [prepayLoadingMap, prepayData])

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
                  <Heading fontSize={'20px'}>Current Loans</Heading>
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
                  {
                    title: 'Asset',
                    dataIndex: 'nft_asset_info',
                    key: 'nft_asset_info',
                    align: 'left',
                    width: 130,
                    render: (_: any, info: any) => {
                      const currentInfo = bactNftListInfo?.find(
                        (i) =>
                          i?.tokenID === info.nft_collateral_id &&
                          i?.assetContractAddress.toLowerCase() ===
                            info.nft_collateral_contract.toLowerCase(),
                      )
                      return (
                        <Flex alignItems={'center'} gap={'8px'}>
                          <ImageWithFallback
                            src={currentInfo?.imagePreviewUrl as string}
                            w='40px'
                            h='40px'
                            borderRadius={4}
                            fit={'contain'}
                          />
                          <Text
                            w={'100px'}
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
                    title: 'Next payment date',
                    dataIndex: 'number_of_installments',
                    key: 'number_of_installments',
                    render: (_: any, info: any) => {
                      const {
                        repaid_principal,
                        number_of_installments,
                        loan_start_time,
                        loan_duration,
                        repaid_interest,
                        lp_scheduled_received,
                      } = info
                      // 每期还款期限 = 还款期限 / 还款期数
                      const perLoanDuration = BigNumber(
                        loan_duration,
                      ).dividedBy(number_of_installments)
                      let nextPaymentData =
                        BigNumber(loan_start_time).plus(perLoanDuration)
                      if (BigNumber(repaid_principal).gt(0)) {
                        // 如果已还金额大于 0

                        // 已还本息 = 已还本金 + 已还利息 （lp 利息 + 协议利息）
                        const repaidAmount =
                          BigNumber(repaid_principal).plus(repaid_interest)

                        // 已还次数 = 已还金额 / 每期还款金额
                        const payedTimes = repaidAmount.dividedBy(
                          lp_scheduled_received,
                        )
                        // 每期还款期限 = 还款期限 / 还款期数
                        nextPaymentData = BigNumber(loan_start_time).plus(
                          perLoanDuration.multipliedBy(payedTimes.plus(1)),
                        )
                      }
                      return (
                        <Text>
                          {unix(nextPaymentData.toNumber()).format(
                            'YYYY/MM/DD HH:mm:ss',
                          )}
                        </Text>
                      )
                    },
                  },
                  {
                    title: 'Next payment amount',
                    dataIndex: 'installment',
                    key: 'installment',
                    render: (value: any) => (
                      <Text>
                        {BigNumber(wei2Eth(value) || 0).toFormat(
                          8,
                          BigNumber.ROUND_UP,
                        )}
                        &nbsp;
                        {UNIT}
                      </Text>
                    ),
                  },
                  ...loansForBuyerColumns,
                  {
                    title: 'operation',
                    dataIndex: 'loan_id',
                    key: 'loan_id',
                    thAlign: 'center',
                    fixedRight: true,
                    tdStyleConfig: {
                      bg: 'white',
                      px: 0,
                    },
                    render: (value: any, info: any) => (
                      <Flex alignItems={'center'}>
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
                              fontWeight={'500'}
                            >
                              Repay
                            </Text>
                          )}
                        </Box>
                        <Divider
                          orientation='vertical'
                          bg='blue.4'
                          h='16px'
                          w='1px'
                        />

                        <Box
                          px='12px'
                          bg='white'
                          borderRadius={8}
                          cursor='pointer'
                          onClick={() => handleClickPayInAdvance(info)}
                          textAlign={'center'}
                        >
                          <Text
                            color='blue.1'
                            fontSize='14px'
                            fontWeight={'500'}
                          >
                            Pay in advance
                          </Text>
                        </Box>
                      </Flex>
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
                      Previous Loans(Paid Off)
                    </Highlight>
                  </Heading>
                ),

                columns: [
                  {
                    title: 'Asset',
                    dataIndex: 'nft_asset_info',
                    key: 'nft_asset_info',
                    align: 'left',
                    width: 130,
                    render: (_: any, info: any) => {
                      const currentInfo = bactNftListInfo?.find(
                        (i) =>
                          i?.tokenID === info.nft_collateral_id &&
                          i?.assetContractAddress.toLowerCase() ===
                            info.nft_collateral_contract.toLowerCase(),
                      )
                      return (
                        <Flex alignItems={'center'} gap={'8px'}>
                          <ImageWithFallback
                            src={currentInfo?.imagePreviewUrl as string}
                            w='40px'
                            h='40px'
                            borderRadius={4}
                            fit={'contain'}
                          />
                          <Text
                            w={'100px'}
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
                  ...loansForBuyerColumns,
                ],
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
                      Previous Loans(Overdue)
                    </Highlight>
                  </Heading>
                ),
                columns: [
                  {
                    title: 'Asset',
                    dataIndex: 'nft_asset_info',
                    key: 'nft_asset_info',
                    align: 'left',
                    width: 130,
                    render: (_: any, info: any) => {
                      const currentInfo = bactNftListInfo?.find(
                        (i) =>
                          i?.tokenID === info.nft_collateral_id &&
                          i?.assetContractAddress.toLowerCase() ===
                            info.nft_collateral_contract.toLowerCase(),
                      )
                      return (
                        <Flex alignItems={'center'} gap={'8px'}>
                          <ImageWithFallback
                            src={currentInfo?.imagePreviewUrl as string}
                            w='40px'
                            h='40px'
                            borderRadius={4}
                            fit={'contain'}
                          />
                          <Text
                            w={'100px'}
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
                  ...loansForBuyerColumns,
                ],
                loading: loading,
                data: statuedLoans[2],
                key: '3',
              },
            ]}
          />
        </Box>
      </Flex>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />

      <Modal
        onClose={handleClose}
        isOpen={!!prepayData}
        isCentered
        scrollBehavior='inside'
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            md: '576px',
            sm: '326px',
            xs: '326px',
          }}
          maxH={'calc(100% - 5.5rem)'}
          borderRadius={16}
        >
          <LoadingComponent loading={collectionLoading} top={0} />
          <ModalHeader {...MODEL_HEADER_PROPS}>
            Confirm Prepayment
            <SvgComponent
              svgId='icon-close'
              onClick={handleClose}
              cursor={'pointer'}
            />
          </ModalHeader>
          <ModalBody
            m={0}
            p={0}
            px={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
          >
            <Flex gap='12px' alignItems={'center'} mb='10px'>
              <Box borderRadius={8} borderWidth={1} borderColor={'gray.2'}>
                <Image
                  src={prepayData?.imagePreviewUrl}
                  w='100px'
                  h='100px'
                  fit={'contain'}
                />
              </Box>

              <Flex flexDir={'column'} w='60%' gap={'4px'}>
                <Text noOfLines={1} fontSize={'24px'} fontWeight={'700'}>
                  {prepayData?.name ||
                    (prepayData?.tokenID ? `#${prepayData?.tokenID}` : '---')}
                </Text>
                <Flex>
                  <Text>{collectionInfo?.name || '--'}</Text>
                  {collectionInfo?.safelistRequestStatus === 'verified' && (
                    <SvgComponent svgId='icon-verified-fill' />
                  )}
                </Flex>
              </Flex>
            </Flex>
            <Divider />
            <Text my='24px' fontWeight={'700'} mb='20px'>
              Payment Info
            </Text>

            <Flex flexDir={'column'} gap='10px' mb='24px'>
              <Flex color='gray.3' fontSize={'14px'} justify={'space-between'}>
                <Text>Outstanding Principal</Text>
                <Text>
                  {prepayData
                    ? formatFloat(
                        wei2Eth(prepayData?.outstandingPrincipal) || 0,
                      )
                    : '--'}
                  {UNIT}
                </Text>
              </Flex>
              <Flex color='gray.3' fontSize={'14px'} justify={'space-between'}>
                <Text>Interest Outstanding</Text>
                <Text>
                  {prepayData
                    ? formatFloat(
                        wei2Eth(
                          prepayData?.interestOutstanding.integerValue(),
                        ) || 0,
                      )
                    : '--'}
                  {UNIT}
                </Text>
              </Flex>
            </Flex>

            <Flex justify={'space-between'} mb='20px'>
              <Text>Prepayment Amount</Text>
              <Text fontWeight={'700'}>
                {prepayData
                  ? formatFloat(
                      wei2Eth(
                        prepayData?.outstandingPrincipal.plus(
                          prepayData?.interestOutstanding,
                        ),
                      ) || 0,
                    )
                  : '--'}
                {UNIT}
              </Text>
            </Flex>
            {/* button */}
            <Flex
              pt='12px'
              px={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
              pb={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
              position={'sticky'}
              bottom={'0px'}
              bg='white'
              mt='8px'
            >
              <Button
                w='100%'
                h='52px'
                variant='primary'
                px='30px'
                disabled={!prepayData}
                isLoading={
                  prepayLoadingMap &&
                  prepayData &&
                  prepayLoadingMap[prepayData.loan_id]
                }
                onClick={handleConfirmPayInAdvance}
              >
                Confirm
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Loans

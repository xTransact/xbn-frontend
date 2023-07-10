import {
  Box,
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Heading,
  Tag,
  type TabProps,
  AlertDescription,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react'
import useLocalStorageState from 'ahooks/lib/useLocalStorageState'
import useRequest from 'ahooks/lib/useRequest'
import dayjs, { unix } from 'dayjs'
// import etherscanapi from 'etherscan-api'
import capitalize from 'lodash-es/capitalize'
import isEmpty from 'lodash-es/isEmpty'
import {
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  useCallback,
} from 'react'
// import Joyride from 'react-joyride'
import { useNavigate, useParams } from 'react-router-dom'

import { apiGetListings, apiGetLoanOrder } from '@/api'
import {
  ConnectWalletModal,
  MyTable,
  EmptyComponent,
  ImageWithFallback,
  type ColumnProps,
  NotFound,
  EthText,
  Pagination,
} from '@/components'
import { LOAN_ORDER_STATUS, LISTING_ORDER_STATUS } from '@/constants'
import { useBatchAsset, useWallet } from '@/hooks'
import useAuth from '@/hooks/useAuth'
import RootLayout from '@/layouts/RootLayout'
import { clearUserToken, getUserToken, type UserTokenType } from '@/utils/auth'
import { formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'
import { uniq } from '@/utils/utils'

enum TAB_KEY {
  LOAN_TAB = 0,
  REPAY_TAB = 1,
  SALE_TAB = 2,
}

enum LOAN_ORDER_STATUS_TEXT {
  Succeeded = 'Succeeded',
  Refunded = 'Refunded',
  Processing = 'Processing',
  Failed = 'Failed',
}

enum LISTING_ORDER_STATUS_TEXT {
  Succeeded = 'Succeeded',
  Sold = 'Sold',
  Failed = 'Failed',
  Canceled = 'Canceled',
  Processing = 'Processing',
}
// const api = etherscanapi.init('', 'goerli')

const TabWrapper: FunctionComponent<
  TabProps & {
    count?: number
  }
> = ({ children, count, ...rest }) => {
  return (
    <Tab
      pt='14px'
      px='6px'
      pb='20px'
      _selected={{
        color: 'blue.1',
        borderBottomWidth: 2,
        borderColor: 'blue.1',
        w: {
          md: 'auto',
          sm: '200px',
          xs: '200px',
        },
      }}
      display={'inline-flex'}
      {...rest}
    >
      <Text fontWeight='bold' noOfLines={1} fontSize='16px'>
        {children}
      </Text>
      {!!count && (
        <Tag
          bg={'blue.1'}
          color='white'
          borderRadius={15}
          fontSize='12px'
          w='25px'
          h='20px'
          textAlign={'center'}
          justifyContent='center'
          lineHeight={2}
          fontWeight='700'
          ml='4px'
        >
          {count}
        </Tag>
      )}
    </Tab>
  )
}

const History = () => {
  const [tabKey, setTabKey] = useState<TAB_KEY>(TAB_KEY.LOAN_TAB)

  const { isOpen, onClose, interceptFn, currentAccount } = useWallet()

  const params = useParams() as {
    type: 'sale' | 'loan' | 'repay'
  }
  const navigate = useNavigate()
  const [isDenied, setIsDenied] = useState(false)
  const { runAsync } = useAuth()

  const handleSign = useCallback(async () => {
    clearUserToken()
    try {
      await runAsync(currentAccount)
      setIsDenied(false)
    } catch (e: any) {
      if (e.code === -32603) {
        // 用户拒绝签名
        setIsDenied(true)
      }
    }
  }, [runAsync, currentAccount])

  const { runAsync: runSignAsync, loading: signLoading } = useRequest(
    handleSign,
    {
      manual: true,
    },
  )
  const [userToken] = useLocalStorageState<UserTokenType>('auth')

  const [loanPage, setLoanPage] = useState<number>(1)
  const {
    data: loanData,
    loading: loanLoading,
    runAsync: fetchLoanData,
  } = useRequest(apiGetLoanOrder, {
    manual: true,
  })

  const sortedLoanData = useMemo(() => {
    if (!loanData) return []
    if (isEmpty(loanData)) return []
    return loanData?.sort(
      (a, b) => -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
    )
  }, [loanData])

  const currentLoanData = useMemo(() => {
    return sortedLoanData.slice((loanPage - 1) * 10, loanPage * 10)
  }, [loanPage, sortedLoanData])

  const batchAssetParamsForLoan = useMemo(() => {
    if (!loanData) return []
    if (isEmpty(loanData)) return []
    const res = loanData?.map((i) => ({
      assetContractAddress: i.allow_collateral_contract,
      assetTokenId: i.nft_collateral_id,
    }))
    return uniq(res || [])
  }, [loanData])
  const {
    data: loanAssetsData,
    // loading: loanAssetLoading
  } = useBatchAsset(batchAssetParamsForLoan)

  const [listPage, setListPage] = useState<number>(1)
  const {
    data: listData,
    loading: listLoading,
    runAsync: fetchListData,
  } = useRequest(apiGetListings, {
    ready: !!currentAccount,
    manual: true,
  })

  const sortedListData = useMemo(() => {
    if (!listData) return []
    if (isEmpty(listData)) return []
    return listData?.sort(
      (a, b) => -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
    )
  }, [listData])

  const currentListData = useMemo(() => {
    return sortedListData.slice((listPage - 1) * 10, listPage * 10)
  }, [listPage, sortedListData])

  const batchAssetParamsForList = useMemo(() => {
    if (!listData) return []
    if (isEmpty(listData)) return []
    const res = listData?.map((i) => ({
      assetContractAddress: i.contract_address,
      assetTokenId: i.token_id,
    }))
    // return res
    return uniq(res || [])
  }, [listData])

  const {
    data: listAssetsData,
    // loading: listAssetLoading
  } = useBatchAsset(batchAssetParamsForList)

  useEffect(() => {
    interceptFn(() => {
      const { type } = params
      setLoanPage(1)
      setListPage(1)
      setTabKey(() => {
        switch (type) {
          case 'loan':
            return TAB_KEY.LOAN_TAB
          case 'repay':
            return TAB_KEY.REPAY_TAB
          case 'sale':
            return TAB_KEY.SALE_TAB
          default:
            return TAB_KEY.LOAN_TAB
        }
      })
    })
  }, [params, interceptFn])
  useEffect(() => {
    if (
      !fetchLoanData ||
      !currentAccount ||
      isDenied ||
      userToken?.address !== currentAccount ||
      !runSignAsync
    ) {
      return
    }
    fetchLoanData({
      borrower_address: currentAccount,
    }).catch(async (error) => {
      if (error.code === 'unauthenticated') {
        // 未能签名
        await runSignAsync()
        setTimeout(() => {
          fetchLoanData({
            borrower_address: currentAccount,
          })
        }, 1000)
      }
    })
    fetchListData({
      borrower_address: currentAccount,
    }).catch(async (error) => {
      if (error.code === 'unauthenticated') {
        // 未能签名
        await runSignAsync()
        setTimeout(() => {
          fetchListData({
            borrower_address: currentAccount,
          })
        }, 1000)
      }
    })
  }, [
    currentAccount,
    isDenied,
    fetchLoanData,
    fetchListData,
    runSignAsync,
    userToken,
  ])

  const loanColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'nft_collateral_id',
        key: 'nft_collateral_id',
        align: 'left',
        width: 240,
        render: (value: any, info: any) => {
          const currentInfo = loanAssetsData?.find(
            (i) =>
              i.assetContractAddress.toLowerCase() ===
                info?.allow_collateral_contract.toLowerCase() &&
              i.tokenID === value,
          )
          return (
            <Flex alignItems={'center'} gap={'8px'} w='100%'>
              <ImageWithFallback
                src={currentInfo?.imagePreviewUrl}
                boxSize={{
                  md: '42px',
                  sm: '32px',
                  xs: '32px',
                }}
                borderRadius={8}
                fit={'contain'}
              />
              <Text
                display='inline-block'
                overflow='hidden'
                whiteSpace='nowrap'
                textOverflow='ellipsis'
              >
                {currentInfo?.name ||
                  (currentInfo?.tokenID ? `#${currentInfo?.tokenID}` : '--')}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'Down payment',
        dataIndex: 'down_payment',
        key: 'down_payment',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Loan Amount',
        dataIndex: 'loan_amount',
        key: 'loan_amount',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Duration',
        dataIndex: 'loan_duration',
        key: 'loan_duration',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <Text>{Number(value) / 60 / 60 / 24} days</Text>
        ),
      },
      {
        title: 'Interest',
        dataIndex: 'loan_interest_rate',
        key: 'loan_interest_rate',
        thAlign: 'center',
        align: 'center',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
      {
        title: 'Apply Date',
        dataIndex: 'created_at',
        key: 'created_at',
        thAlign: 'center',
        align: 'center',
        render: (value: any) => (
          <Text>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => {
          let status = '--'
          if (value === LOAN_ORDER_STATUS.Completed) {
            status = LOAN_ORDER_STATUS_TEXT.Succeeded
          } else if (value === LOAN_ORDER_STATUS.Refunded) {
            status = LOAN_ORDER_STATUS_TEXT.Refunded
          } else if (
            [
              LOAN_ORDER_STATUS.New,
              LOAN_ORDER_STATUS.DownPaymentConfirmed,
              LOAN_ORDER_STATUS.PendingPurchase,
              LOAN_ORDER_STATUS.PurchaseSubmitted,
              LOAN_ORDER_STATUS.PurchaseConfirmed,
              LOAN_ORDER_STATUS.PendingLoan,
              LOAN_ORDER_STATUS.LoanSubmitted,
            ].includes(value)
          ) {
            status = LOAN_ORDER_STATUS_TEXT.Processing
          } else {
            status = LOAN_ORDER_STATUS_TEXT.Failed
          }
          return <Text>{status}</Text>
        },
      },
      {
        title: 'Remark',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        thAlign: 'center',
        render: (_: any, info: any) => (
          <Text>
            {info?.status === LOAN_ORDER_STATUS.Refunded
              ? 'Refunded down payment'
              : ''}
          </Text>
        ),
      },
    ]
  }, [loanAssetsData])

  const repayColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'nftCollection',
        key: 'nftCollection',
        align: 'left',
        width: 240,
        render: (value: any) => {
          return (
            <Flex alignItems={'center'} gap={'8px'} w='100%'>
              <ImageWithFallback
                src={value?.imagePreviewUrl}
                boxSize={{
                  md: '42px',
                  sm: '32px',
                  xs: '32px',
                }}
                borderRadius={8}
              />
              <Text
                display='inline-block'
                overflow='hidden'
                whiteSpace='nowrap'
                textOverflow='ellipsis'
              >
                {value?.name || '--'}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'Paid Amount',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Repayment Amount',
        dataIndex: 'pool_amount',
        key: 'pool_amount',
        align: 'right',
        thAlign: 'right',
        render: (value: any, info: any) => (
          <EthText>
            {formatFloat(
              wei2Eth(Number(value) - Number(info.pool_used_amount)),
            )}
          </EthText>
        ),
      },
      {
        title: 'Interest',
        dataIndex: 'maximum_loan_amount',
        key: 'maximum_loan_amount',
        align: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'pool_maximum_percentage',
        key: 'pool_maximum_percentage',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <Text>{Number(value) / 100} %</Text>,
      },
      {
        title: 'Paid Date',
        dataIndex: 'pool_maximum_days',
        key: 'pool_maximum_days',
        align: 'right',
        thAlign: 'right',
        render: (value: any) => <Text>{value} days</Text>,
      },
      {
        title: 'Status',
        dataIndex: 'pool_maximum_interest_rate',
        key: 'pool_maximum_interest_rate',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
    ]
  }, [])

  const saleColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'token_id',
        key: 'token_id',
        width: 240,
        render: (value: any, info: any) => {
          const currentInfo = listAssetsData?.find(
            (i) =>
              i.assetContractAddress.toLowerCase() ===
                info?.contract_address.toLowerCase() && i.tokenID === value,
          )
          return (
            <Flex alignItems={'center'} gap={'8px'} w='100%'>
              <ImageWithFallback
                src={currentInfo?.imagePreviewUrl}
                boxSize={{
                  md: '42px',
                  sm: '32px',
                  xs: '32px',
                }}
                borderRadius={8}
              />
              <Text
                display='inline-block'
                overflow='hidden'
                whiteSpace='nowrap'
                textOverflow='ellipsis'
              >
                {currentInfo?.name ||
                  (currentInfo?.tokenID ? `#${currentInfo?.tokenID}` : '--')}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'List Price',
        dataIndex: 'price',
        key: 'price',
        align: 'center',
        thAlign: 'center',
        render: (value: any, info: any) => (
          <EthText>{info.type === 1 ? formatFloat(value) : '--'}</EthText>
        ),
      },
      {
        title: 'Platform',
        dataIndex: 'platform',
        align: 'center',
        thAlign: 'center',
        key: 'platform',
        render: (value: any) => <Text>{capitalize(value)}</Text>,
      },
      {
        title: 'Expiration',
        dataIndex: 'expiration_time',
        align: 'center',
        thAlign: 'center',
        key: 'expiration_time',
        render: (value: any, info: any) => {
          return (
            <Text>
              {info.type === 1 ? unix(value).format('YYYY-MM-DD HH:mm') : '--'}
            </Text>
          )
        },
      },
      {
        title: 'type',
        dataIndex: 'type',
        align: 'center',
        thAlign: 'center',
        key: 'type',
        render: (value: any) => (
          <Text>{value === 1 ? 'Listing' : 'Cancel Listing'}</Text>
        ),
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <Text>{dayjs(value).format('YYYY/MM/DD HH:mm')}</Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        thAlign: 'center',
        render: (value: any, info: any) => {
          let status = '--'
          // Listing 操作
          if (info.type === 1) {
            if (value === LISTING_ORDER_STATUS.Listed)
              status = LISTING_ORDER_STATUS_TEXT.Succeeded
            if (value === LISTING_ORDER_STATUS.Completed)
              status = LISTING_ORDER_STATUS_TEXT.Sold
            if (value === LISTING_ORDER_STATUS.Cancelled)
              status = LISTING_ORDER_STATUS_TEXT.Canceled
          }
          // Cancel List 操作
          if (info.type === 2 && value === LISTING_ORDER_STATUS.Completed) {
            status = LISTING_ORDER_STATUS_TEXT.Succeeded
          }
          if (
            [
              LISTING_ORDER_STATUS.Rejected,
              LISTING_ORDER_STATUS.InstRejected,
              LISTING_ORDER_STATUS.Failed,
            ].includes(value)
          ) {
            status = LISTING_ORDER_STATUS_TEXT.Failed
          }
          if (
            [
              LISTING_ORDER_STATUS.New,
              LISTING_ORDER_STATUS.PendingProgress,
              LISTING_ORDER_STATUS.PendingApproval,
              LISTING_ORDER_STATUS.Approved,
              LISTING_ORDER_STATUS.CoinTransferred,
            ].includes(value)
          ) {
            status = LISTING_ORDER_STATUS_TEXT.Processing
          }
          return <Text>{status}</Text>
        },
      },
    ]
  }, [listAssetsData])

  if (
    !params ||
    ![
      'loan',
      // 'repay',
      'sale',
    ].includes(params?.type)
  ) {
    return <NotFound backTo='/history/loan' />
  }

  return (
    <RootLayout mb='100px'>
      <Box mt='60px' mb='40px'>
        <Heading fontWeight={'700'} fontSize={'48px'}>
          My Loan History
        </Heading>
        <Text color='gray.3' fontWeight={'500'} fontSize={'20px'}>
          View and track all your loan activity history
        </Text>
        <Button
          hidden
          variant={'primary'}
          onClick={async () => {
            // const balance =await  api.account.txlist(
            //   currentAccount,
            //   1,
            //   'latest',
            //   1,
            //   100,
            //   'desc',
            // )
          }}
        >
          fetch
        </Button>
      </Box>
      {isDenied || !getUserToken() ? (
        <Alert
          px={'40px'}
          status='error'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            Please click to sign in and accept the xBank Terms of Service
          </AlertTitle>
          <AlertDescription>
            <Button
              mt='20px'
              onClick={async () => {
                if (signLoading) return
                await runSignAsync()
                if (tabKey === TAB_KEY.LOAN_TAB) {
                  setTimeout(() => {
                    fetchLoanData({
                      borrower_address: currentAccount,
                    })
                  }, 1000)
                }
                if (tabKey === TAB_KEY.SALE_TAB) {
                  setTimeout(() => {
                    fetchListData({
                      borrower_address: currentAccount,
                    })
                  }, 1000)
                }
              }}
              variant={'outline'}
              isDisabled={signLoading}
              isLoading={signLoading}
            >
              Click to Sign
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs
          pb='40px'
          isLazy
          index={tabKey}
          position='relative'
          onChange={(key) => {
            switch (key) {
              case 0:
                navigate('/history/loan')
                break
              case 1:
                navigate('/history/repay')
                break
              case 2:
                navigate('/history/sale')
                break

              default:
                break
            }
          }}
        >
          <TabList
            _active={{
              color: 'blue.1',
              fontWeight: 'bold',
            }}
            position='sticky'
            top={{ md: '131px', sm: '131px', xs: '107px' }}
            bg='white'
            zIndex={2}
          >
            <TabWrapper count={loanData?.length}>Loan</TabWrapper>
            <TabWrapper hidden>Repay</TabWrapper>
            <TabWrapper count={listData?.length}>Sale</TabWrapper>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pb='20px'>
              <MyTable
                loading={loanLoading}
                columns={loanColumns}
                data={currentLoanData}
                emptyRender={() => {
                  return (
                    <EmptyComponent
                      action={() => {
                        return (
                          <Button
                            variant={'secondary'}
                            minW='200px'
                            onClick={() =>
                              interceptFn(() => navigate('/buy-nfts/market'))
                            }
                          >
                            + Buy NFTs Pay Later
                          </Button>
                        )
                      }}
                    />
                  )
                }}
              />
              <Flex justify={'center'} mt='24px'>
                <Pagination
                  total={loanData?.length}
                  pageSize={10}
                  onChange={(page) => {
                    console.log('aaa', page)
                    if (loanPage === page) return
                    setLoanPage(page)
                  }}
                  current={loanPage}
                  style={{
                    display:
                      loanData && loanData?.length > 10 ? 'flex' : 'none',
                  }}
                />
              </Flex>
            </TabPanel>
            <TabPanel p={0} pb='20px' hidden>
              <MyTable columns={repayColumns} data={[]} />
            </TabPanel>
            <TabPanel p={0} pb='20px'>
              <MyTable
                columns={saleColumns}
                data={currentListData}
                loading={listLoading}
              />
              <Flex justify={'center'} mt='24px'>
                <Pagination
                  total={listData?.length}
                  pageSize={10}
                  onChange={(page) => {
                    if (listPage === page) return
                    setListPage(page)
                  }}
                  current={listPage}
                  style={{
                    display:
                      listData && listData?.length > 10 ? 'flex' : 'none',
                  }}
                />
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default History

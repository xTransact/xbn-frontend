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
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import dayjs from 'dayjs'
// import etherscanapi from 'etherscan-api'
import isEmpty from 'lodash-es/isEmpty'
import { useEffect, useMemo, useState, type FunctionComponent } from 'react'
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
} from '@/components'
import { RESPONSIVE_MAX_W, LOAN_ORDER_STATUS } from '@/constants'
import { useBatchAsset, useWallet } from '@/hooks'
import RootLayout from '@/layouts/RootLayout'
import { formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

enum TAB_KEY {
  LOAN_TAB = 0,
  REPAY_TAB = 1,
  SALE_TAB = 2,
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

  const { data: loanData, loading: loanLoading } = useRequest(
    () =>
      apiGetLoanOrder({
        borrower_address: currentAccount,
      }),
    {
      ready: tabKey === TAB_KEY.LOAN_TAB && !!currentAccount,
      refreshDeps: [currentAccount],
    },
  )

  const batchAssetParamsForLoan = useMemo(() => {
    return []
    if (!loanData) return []
    if (isEmpty(loanData)) return []
    return loanData?.map((i) => ({
      assetContractAddress: '',
      assetTokenId: i.nft_collateral_id,
    }))
  }, [loanData])
  const {
    data: loanAssetsData,
    // loading: loanAssetLoading
  } = useBatchAsset(batchAssetParamsForLoan)

  const { data: listData, loading: listLoading } = useRequest(
    () =>
      apiGetListings({
        borrower_address: currentAccount,
      }),
    {
      ready: tabKey === TAB_KEY.SALE_TAB && !!currentAccount && false,
    },
  )

  const batchAssetParamsForList = useMemo(() => {
    return []
    if (!listData) return []
    if (isEmpty(listData)) return []
    return listData?.map((i) => ({
      assetContractAddress: i.contract_address,
      assetTokenId: i.token_id,
    }))
  }, [listData])
  const {
    data: listAssetsData,
    // loading: listAssetLoading
  } = useBatchAsset(batchAssetParamsForList)

  useEffect(() => {
    interceptFn(() => {
      const { type } = params
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

  const loanColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'nft_collateral_id',
        key: 'nft_collateral_id',
        align: 'left',
        width: 320,
        render: (value: any, info: any) => {
          const currentInfo = loanAssetsData?.find(
            (i) =>
              i.assetContractAddress.toLowerCase() ===
                info?.nft_collateral_contract.toLowerCase() &&
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
              />
              <Text
                display='inline-block'
                overflow='hidden'
                whiteSpace='nowrap'
                textOverflow='ellipsis'
              >
                {currentInfo?.name || currentInfo?.tokenID
                  ? `#${currentInfo?.tokenID}`
                  : '--'}
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
        render: (value) => {
          let res = '--'
          if (value === LOAN_ORDER_STATUS.Completed) {
            res = 'Succeeded'
          }
          if (value === LOAN_ORDER_STATUS.Refunded) {
            res = 'Refunded'
          }
          if (
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
            res = 'Processing'
          }
          return <Text>{res}</Text>
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
                {currentInfo?.name || currentInfo?.tokenID
                  ? `#${currentInfo?.tokenID}`
                  : '--'}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'List Price',
        dataIndex: 'price',
        key: 'price',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{formatFloat(wei2Eth(value))}</Text>,
      },
      {
        title: 'Platform',
        dataIndex: 'platform',
        thAlign: 'right',
        align: 'right',
        key: 'platform',
        render: (value: any) => <Text>{value}</Text>,
      },
      {
        title: 'Duration',
        dataIndex: 'expiration_time',
        align: 'right',
        thAlign: 'right',
        key: 'expiration_time',
        render: (value: any, info: any) => {
          const diffDays = dayjs(value).diff(dayjs(info.created_at), 'days')
          // 用 到期时间 - 创建时间 = 天数
          return <Text>{diffDays} days</Text>
        },
      },
      {
        title: 'type',
        dataIndex: 'type',
        align: 'right',
        thAlign: 'right',
        key: 'type',
        render: (value: any) => (
          <Text>{value === 1 ? 'Listing' : 'Cancel Listing'}</Text>
        ),
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value: any) => (
          <Text>{dayjs(value).format('YYYY/MM/DD HH:mm')}</Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
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
    <RootLayout mb='100px' maxW={{ ...RESPONSIVE_MAX_W, xl: 1408 }}>
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
          <TabWrapper>Sale</TabWrapper>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pb='20px'>
            <MyTable
              loading={loanLoading}
              columns={loanColumns}
              data={(loanData || []).sort(
                (a, b) =>
                  -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
              )}
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
          </TabPanel>
          <TabPanel p={0} pb='20px' hidden>
            <MyTable columns={repayColumns} data={[]} />
          </TabPanel>
          <TabPanel p={0} pb='20px'>
            <MyTable
              columns={saleColumns}
              data={listData || []}
              loading={listLoading}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default History

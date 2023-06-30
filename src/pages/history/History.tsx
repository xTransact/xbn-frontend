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
import { unix } from 'dayjs'
// import etherscanapi from 'etherscan-api'
import { useEffect, useMemo, useState, type FunctionComponent } from 'react'
// import Joyride from 'react-joyride'
import { useNavigate, useParams } from 'react-router-dom'

import { apiGetListings } from '@/api'
import {
  ConnectWalletModal,
  MyTable,
  EmptyComponent,
  ImageWithFallback,
  type ColumnProps,
  NotFound,
  EthText,
} from '@/components'
import { RESPONSIVE_MAX_W, UNIT } from '@/constants'
import { useWallet } from '@/hooks'
import RootLayout from '@/layouts/RootLayout'
import { formatAddress, formatFloat } from '@/utils/format'
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

  useRequest(apiGetListings, {
    defaultParams: [
      {
        borrower_address: currentAccount,
      },
    ],
    ready: false,
  })

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
        dataIndex: 'nftCollection',
        key: 'contractAddress',
        align: 'left',
        width: 320,
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
        title: 'Down payment',
        dataIndex: 'nftCollection',
        key: 'id',
        align: 'right',
        thAlign: 'right',
      },
      {
        title: 'Loan Amount',
        dataIndex: 'pool_amount',
        key: 'pool_amount',
        align: 'center',
        thAlign: 'center',
        render: (value: any, info: any) => (
          <EthText>
            {formatFloat(
              wei2Eth(Number(value) - Number(info.pool_used_amount)),
            )}
          </EthText>
        ),
      },
      {
        title: 'Duration',
        dataIndex: 'pool_maximum_percentage',
        key: 'pool_maximum_percentage',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <Text>{Number(value) / 100} %</Text>,
      },
      {
        title: 'Interest',
        dataIndex: 'pool_maximum_interest_rate',
        key: 'pool_maximum_interest_rate',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
      {
        title: 'Apply Date',
        dataIndex: 'nftCollection',
        key: 'nftCollection',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
    ]
  }, [])

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
        dataIndex: 'lender_address',
        key: 'lender_address',
        render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
      },
      {
        title: 'List Price',
        dataIndex: 'borrower_address',
        key: 'borrower_address',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
      },
      {
        title: 'Platform',
        dataIndex: 'loan_start_time',
        thAlign: 'right',
        align: 'right',
        key: 'loan_start_time',
        render: (value: any) => (
          <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
        ),
      },
      {
        title: 'Duration',
        dataIndex: 'loan_amount',
        align: 'right',
        thAlign: 'right',
        key: 'loan_amount',
        render: (value: any) => (
          <Text>
            {formatFloat(wei2Eth(value))} {UNIT}
          </Text>
        ),
      },
      {
        title: 'type',
        dataIndex: 'loan_duration',
        align: 'right',
        thAlign: 'right',
        key: 'loan_duration',
        render: (value: any) => <Text>{value / 24 / 60 / 60} days</Text>,
      },
      {
        title: 'Date',
        dataIndex: 'installment',
        key: 'installment',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
    ]
  }, [])

  return <NotFound backTo='/' />

  if (!params || !['loan', 'repay', 'sale'].includes(params?.type)) {
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
        <Button variant={'primary'}>fetch</Button>
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
          <TabWrapper count={2}>Loan</TabWrapper>
          <TabWrapper>Repay</TabWrapper>
          <TabWrapper>Sale</TabWrapper>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pb='20px'>
            <MyTable
              columns={loanColumns}
              data={[]}
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
          <TabPanel p={0} pb='20px'>
            <MyTable columns={repayColumns} data={[]} />
          </TabPanel>
          <TabPanel p={0} pb='20px'>
            <MyTable columns={saleColumns} data={[]} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default History

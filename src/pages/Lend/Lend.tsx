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
  List,
  Highlight,
  Drawer,
  useDisclosure,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  type TabProps,
  ScaleFade,
} from '@chakra-ui/react'
import useDebounce from 'ahooks/lib/useDebounce'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import { unix } from 'dayjs'
import groupBy from 'lodash-es/groupBy'
import isEmpty from 'lodash-es/isEmpty'
import maxBy from 'lodash-es/maxBy'
import omit from 'lodash-es/omit'
import reduce from 'lodash-es/reduce'
import sortBy from 'lodash-es/sortBy'
import {
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  useRef,
} from 'react'
// import Joyride from 'react-joyride'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiGetLoans, apiGetPools } from '@/api'
import ImgLend from '@/assets/LEND.png'
import {
  ConnectWalletModal,
  MyTable,
  LoadingComponent,
  TableList,
  EmptyComponent,
  SvgComponent,
  EthText,
  ImageWithFallback,
  type ColumnProps,
  SearchInput,
  LenderGuideModal,
  NoticeSlider,
} from '@/components'
import { UNIT } from '@/constants'
import type { NftCollection } from '@/hooks'
import { useWallet, useBatchAsset, useGuide } from '@/hooks'
import RootLayout from '@/layouts/RootLayout'
import { formatAddress, formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

import AllPoolsDescription from './components/AllPoolsDescription'
import CollectionListItem from './components/CollectionListItem'
import MyPoolActionRender from './components/MyPoolActionRender'

type Dictionary<T> = Record<string, T>

enum TAB_KEY {
  COLLECTION_TAB = 0,
  MY_POOLS_TAB = 1,
  LOANS_TAB = 2,
}

const TabWrapper: FunctionComponent<TabProps> = ({ children, ...rest }) => {
  return (
    <Tab
      pt='14px'
      px='6px'
      pb='20px'
      _selected={{
        color: 'blue.1',
        borderBottomWidth: 2,
        borderColor: 'blue.1',
      }}
      display={'inline-block'}
      {...rest}
    >
      <Text fontWeight='bold' fontSize='16px'>
        {children}
      </Text>
    </Tab>
  )
}

/**
 * 1. Collections
 *    1.1 /lending/api/v1/nft/pools = all pools
 *    1.2 forEach CollectionList => filter collectionWithPool => calculate summary items
 *    1.3 [{...collection, ...pools}]
 * 2. MyPools
 *    2.1 1.1 => filter currentAccount pools => myPoolsData
 *    2.2 myPoolsData => [{...collection, ...pools}]
 * 3. Loans
 *    3.1 /lending/api/v1/loans?lender_address=xxx = current loans
 *    2.1 forEach useAssetQuery = nft info
 * @returns Collections  MyPools Loans
 */
const Lend = () => {
  const { isOpen: guideVisible, onClose: closeGuide } = useGuide({
    key: 'has-read-lp-guide',
  })
  const tabListRef = useRef<HTMLDivElement>(null)

  const [tabKey, setTabKey] = useState<TAB_KEY>(TAB_KEY.COLLECTION_TAB)

  const { isOpen: showSearch, onToggle: toggleShowSearch } = useDisclosure()

  const {
    isOpen,
    onClose,
    interceptFn,
    currentAccount,
    collectionList,
    collectionLoading,
    noticeData,
  } = useWallet()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setTabKey(() => {
      switch (pathname) {
        case '/lending/collections':
          return TAB_KEY.COLLECTION_TAB
        case '/lending/my-pools':
          interceptFn()
          return TAB_KEY.MY_POOLS_TAB
        case '/lending/loans':
          interceptFn()
          return TAB_KEY.LOANS_TAB
        default:
          return TAB_KEY.COLLECTION_TAB
      }
    })
  }, [pathname, interceptFn])

  useEffect(() => {
    if (!tabListRef?.current) return
    if (tabKey !== TAB_KEY.LOANS_TAB) {
      tabListRef.current.scrollTo(0, 0)
    } else {
      tabListRef.current.scrollTo(tabListRef.current.scrollWidth, 0)
    }
  }, [tabKey, tabListRef])

  /**
   * 进入页面 fetch all pools => for 'Collections Tab'
   * filter owner_address === currentAccount => for 'My Pools Tab'
   *  */
  const [allPoolsData, setAllPoolsData] = useState<PoolsListItemType[]>([])
  const { loading: poolsLoading1 } = useRequest(apiGetPools, {
    onSuccess: (data) => {
      if (isEmpty(data)) {
        return
      }
      setAllPoolsData(data)
    },
    ready: tabKey === TAB_KEY.COLLECTION_TAB,
    debounceWait: 10,
  })

  /**
   * Collection Tab
   * 1. map All Pool => Collection Address with pools Address
   * 2. filter collectionList => Collection info with pools
   * 3. map Collection info with pools => fiter pools => [{...collection, ...pools}]
   */
  const activeCollectionList = useMemo(() => {
    const collectionsAddressWithPools = [
      ...new Set(
        allPoolsData?.map((i) => i.allow_collateral_contract.toLowerCase()),
      ),
    ]
    const collectionsWithPools = collectionList.filter((i) =>
      collectionsAddressWithPools.includes(i.contractAddress.toLowerCase()),
    )
    return sortBy(
      collectionsWithPools.map(({ contractAddress, ...rest }) => {
        const currentCollectionPools = allPoolsData.filter(
          (item) =>
            item.allow_collateral_contract.toLowerCase() ===
            contractAddress.toLowerCase(),
        )
        const pool_maximum_percentage = maxBy(
          currentCollectionPools,
          (i) => i.pool_maximum_percentage,
        )?.pool_maximum_percentage

        const pool_maximum_interest_rate = maxBy(
          currentCollectionPools,
          (i) => i.pool_maximum_interest_rate,
        )?.pool_maximum_interest_rate

        const pool_size = reduce(
          currentCollectionPools,
          (sum, i) => {
            const _size = BigNumber(i.pool_amount).minus(i.pool_used_amount)
            return BigNumber(sum).plus(_size.lte(0) ? BigNumber(0) : _size)
          },
          BigNumber(0),
        )

        const isContainMyPool =
          currentCollectionPools?.findIndex(
            (i) =>
              i.owner_address.toLowerCase() === currentAccount.toLowerCase(),
          ) !== -1

        return {
          pool_maximum_percentage,
          pool_maximum_interest_rate,
          pool_size,
          contractAddress,
          isContainMyPool,
          ...rest,
        }
      }),
      'pool_amount',
      (i) => Number(i.pool_amount),
    )
  }, [collectionList, allPoolsData, currentAccount])

  const [activeCollectionSearchValue, setActiveCollectionSearchValue] =
    useState('')
  const debounceActiveCollectionSearchValue = useDebounce(
    activeCollectionSearchValue,
    {
      wait: 500,
    },
  )
  const filteredActiveCollectionList = useMemo(() => {
    if (!debounceActiveCollectionSearchValue) return activeCollectionList || []
    return activeCollectionList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceActiveCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [debounceActiveCollectionSearchValue, activeCollectionList])

  /**
   * My Pools Tab
   * 1. myPoolsData append collection info
   */
  const [myPoolsData, setMyPoolsData] = useState<PoolsListItemType[]>([])
  const { loading: poolsLoading2, refreshAsync: refreshMyPools } = useRequest(
    () =>
      apiGetPools({
        owner_address: currentAccount,
      }),
    {
      ready: !!currentAccount && tabKey !== TAB_KEY.COLLECTION_TAB,
      debounceWait: 100,
      refreshDeps: [currentAccount],
      onSuccess: (data) => {
        setMyPoolsData(data || [])
      },
    },
  )
  const poolList = useMemo(() => {
    if (!myPoolsData) return []
    return myPoolsData?.map((item) => {
      const nftCollection = collectionList.find(
        (i) =>
          i.contractAddress.toLowerCase() ===
          item.allow_collateral_contract.toLowerCase(),
      )?.nftCollection
      return {
        ...item,
        nftCollection,
      }
    })
  }, [myPoolsData, collectionList])

  const [myPoolsSearchValue, setMyPoolsSearchValue] = useState('')
  const debounceMyPoolsSearchValue = useDebounce(myPoolsSearchValue, {
    wait: 500,
  })

  const filteredPoolList = useMemo(() => {
    if (!debounceMyPoolsSearchValue) return poolList || []
    return poolList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceMyPoolsSearchValue.toLocaleLowerCase()),
    )
  }, [debounceMyPoolsSearchValue, poolList])

  /**
   * Loan Tab 左侧
   */
  // loan 左侧选择某一个 pool
  const [selectKeyForOpenLoans, setSelectKeyForOpenLoans] = useState<number>()
  // loan 左侧 loan totalCount
  const [totalLoanCount, setTotalLoanCount] = useState(0)
  // debounce search value
  const [loanCollectionSearchValue, setLoanCollectionSearchValue] = useState('')
  const debounceLoanCollectionSearchValue = useDebounce(
    loanCollectionSearchValue,
    {
      wait: 500,
    },
  )
  // filtered by debounceSearchValue pool list
  const filteredPoolCollectionList = useMemo(() => {
    if (!poolList) return []
    if (!debounceLoanCollectionSearchValue) return poolList || []

    return poolList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceLoanCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [poolList, debounceLoanCollectionSearchValue])

  /**
   * Loan 右侧
   */
  // groupBy loan status
  const [loansData, setLoansData] = useState<Dictionary<LoanListItemType[]>>({
    0: [],
    1: [],
    2: [],
  })
  const { loading: loansLoading, data: loanDataForNft } = useRequest(
    () =>
      apiGetLoans({
        lender_address: currentAccount,
        pool_id: selectKeyForOpenLoans,
      }),
    {
      onSuccess: async (data) => {
        if (!currentAccount) {
          setLoansData({
            0: [],
            1: [],
            2: [],
          })
          return
        }
        setLoansData(groupBy(data, 'loan_status'))
        if (selectKeyForOpenLoans === undefined) {
          setTotalLoanCount(data?.length)
        }
      },
      ready: !!currentAccount && tabKey === TAB_KEY.LOANS_TAB,
      refreshDeps: [selectKeyForOpenLoans, currentAccount],
      debounceWait: 100,
    },
  )
  // batch fetch asset detail params
  const batchAssetParams = useMemo(() => {
    if (!loanDataForNft) return []
    return loanDataForNft?.map((i) => ({
      assetContractAddress: i.nft_collateral_contract,
      assetTokenId: i.nft_collateral_id,
    }))
  }, [loanDataForNft])
  const { data: batchNftListInfo } = useBatchAsset(batchAssetParams)

  const activeCollectionColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Collection',
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
              {value?.safelistRequestStatus === 'verified' && (
                <SvgComponent svgId='icon-verified-fill' />
              )}
            </Flex>
          )
        },
      },
      {
        title: 'Est. Floor*',
        dataIndex: 'nftCollection',
        key: 'id',
        align: 'right',
        thAlign: 'right',
        render: (info: any) => {
          // 后期需要优化
          return (
            <Flex alignItems={'center'}>
              <SvgComponent svgId='icon-eth' />
              <Text>{formatFloat(info?.nftCollectionStat?.floorPrice)}</Text>
            </Flex>
          )
        },
      },
      {
        title: 'Pool Size',
        dataIndex: 'pool_size',
        key: 'pool_size',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Collateral Factor',
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
        title: 'Trade',
        dataIndex: 'nftCollection',
        key: 'nftCollection',
        align: 'right',
        fixedRight: true,
        thAlign: 'right',
        render: (value: any, info: any) => {
          return (
            <Flex alignItems='center' gap={'8px'}>
              <Text
                color={info.isContainMyPool ? 'gray.1' : 'blue.1'}
                onClick={() => {
                  interceptFn(() => {
                    if (info.isContainMyPool) return
                    navigate(`/lending/create`, {
                      state: {
                        contractAddress: info.contractAddress,
                        nftCollection: value,
                      },
                    })
                  })
                }}
                cursor={info.isContainMyPool ? 'not-allowed' : 'pointer'}
              >
                Supply
              </Text>
            </Flex>
          )
        },
      },
    ]
  }, [navigate, interceptFn])

  const myPoolsColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Collection',
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
              {value?.safelistRequestStatus === 'verified' && (
                <SvgComponent svgId='icon-verified-fill' />
              )}
            </Flex>
          )
        },
      },
      {
        title: 'Est. Floor*',
        dataIndex: 'id',
        key: 'id',
        align: 'right',
        thAlign: 'right',
        render: (_: any, info: any) => {
          return (
            <Flex alignItems={'center'}>
              <SvgComponent svgId='icon-eth' />
              <Text>
                {formatFloat(
                  info?.nftCollection?.nftCollectionStat?.floorPrice,
                )}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'Pool Size',
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
        title: 'Max Loan Amount',
        dataIndex: 'maximum_loan_amount',
        key: 'maximum_loan_amount',
        align: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Collateral Factor',
        dataIndex: 'pool_maximum_percentage',
        key: 'pool_maximum_percentage',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <Text>{Number(value) / 100} %</Text>,
      },
      {
        title: 'Duration',
        dataIndex: 'pool_maximum_days',
        key: 'pool_maximum_days',
        align: 'right',
        thAlign: 'right',
        render: (value: any) => <Text>{value} days</Text>,
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
        title: 'Supporting Loans',
        dataIndex: 'loan_count',
        key: 'loan_count',
        align: 'center',
        thAlign: 'center',
      },
      {
        title: '',
        dataIndex: 'pool_id',
        key: 'pool_id',
        align: 'right',
        fixedRight: true,
        thAlign: 'right',
        render: (value: any, info: any) => {
          const poolData = omit(info, 'nftCollection') as PoolsListItemType
          const collectionData = info?.nftCollection as NftCollection

          return (
            <MyPoolActionRender
              poolData={poolData}
              collectionData={collectionData}
              onClickDetail={() => setSelectKeyForOpenLoans(value as number)}
              onRefresh={refreshMyPools}
            />
          )
        },
      },
    ]
  }, [refreshMyPools])

  const loansForLendColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'id',
        key: 'id',
        align: 'left',
        width: {
          lg: 200,
          md: 150,
          sm: 130,
          xs: 130,
        },
        thAlign: 'left',
        render: (_: any, info: any) => {
          // const currentInfo = batchNftListInfo?.get(
          //   JSON.stringify({
          //     address: info.nft_collateral_contract.toLowerCase(),
          //     tokenId: info.nft_collateral_id,
          //   }),
          // )
          const currentInfo = batchNftListInfo?.find(
            (i) =>
              i.assetContractAddress.toLowerCase() ===
                info.nft_collateral_contract.toLowerCase() &&
              i.tokenID === info.nft_collateral_id,
          )
          return (
            <Flex alignItems={'center'} gap={'8px'}>
              <ImageWithFallback
                src={currentInfo?.imagePreviewUrl as string}
                w='40px'
                h='40px'
                borderRadius={4}
              />
              <Text
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
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{formatAddress(value.toString())}</Text>,
      },
      {
        title: 'Start time',
        dataIndex: 'loan_start_time',
        thAlign: 'right',
        align: 'right',
        key: 'loan_start_time',
        render: (value: any) => (
          <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
        ),
      },
      {
        title: 'Loan value',
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
        title: 'Duration',
        dataIndex: 'loan_duration',
        align: 'right',
        thAlign: 'right',
        key: 'loan_duration',
        render: (value: any) => <Text>{value / 24 / 60 / 60} days</Text>,
      },
      {
        title: 'Interest',
        dataIndex: 'installment',
        key: 'installment',
        render: (_: any, item: Record<string, any>) => {
          return (
            <Text>
              {formatFloat(
                BigNumber(
                  wei2Eth(
                    BigNumber(item.installment)
                      .multipliedBy(item?.number_of_installments)
                      .minus(item.loan_amount),
                  ) || 0,
                ),
              )}
              {UNIT}
            </Text>
          )
        },
      },
    ]
  }, [batchNftListInfo])

  // 移动端 loan 左侧 collection pools draw
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()

  return (
    <RootLayout mb='100px'>
      <LenderGuideModal isOpen={guideVisible} onClose={closeGuide} />

      <Box
        my={{
          md: '60px',
          sm: '24px',
          xs: '24px',
        }}
        className='my-first-step'
      >
        <AllPoolsDescription
          data={{
            img: ImgLend,
            title: 'Lend',
            description:
              'Provide funds to support NFT Buy Now Pay Later, \nreceive interests or discounts on NFTs as collateral.',
          }}
        />
      </Box>
      {/* <Joyride steps={steps} continuous run /> */}
      <NoticeSlider data={noticeData} />

      <Tabs
        isLazy
        index={tabKey}
        position='relative'
        onChange={(key) => {
          switch (key) {
            case 0:
              navigate('/lending/collections')
              break
            case 1:
              navigate('/lending/my-pools')
              break
            case 2:
              navigate('/lending/loans')
              break

            default:
              break
          }
        }}
      >
        <Box
          overflowX={{
            sm: 'hidden',
            xs: 'auto',
          }}
          ref={tabListRef}
          className='scroll-bar-hidden'
          position='sticky'
          top={{ md: '131px', sm: '131px', xs: '107px' }}
          bg='white'
          zIndex={13}
        >
          {[TAB_KEY.COLLECTION_TAB, TAB_KEY.MY_POOLS_TAB].includes(tabKey) && (
            <Flex
              position={'absolute'}
              right={0}
              top={'8px'}
              gap={'16px'}
              zIndex={3}
              display={{
                md: 'flex',
                sm: 'none',
                xs: 'none',
              }}
            >
              <ScaleFade in={showSearch} initialScale={0.9}>
                <SearchInput
                  value={
                    tabKey === TAB_KEY.COLLECTION_TAB
                      ? activeCollectionSearchValue
                      : myPoolsSearchValue
                  }
                  onChange={(e) => {
                    if (tabKey === TAB_KEY.COLLECTION_TAB) {
                      setActiveCollectionSearchValue(e.target.value)
                    }
                    if (tabKey === TAB_KEY.MY_POOLS_TAB) {
                      setMyPoolsSearchValue(e.target.value)
                    }
                  }}
                />
              </ScaleFade>

              <Flex
                h='44px'
                w='44px'
                borderRadius={44}
                justify='center'
                alignItems={'center'}
                cursor='pointer'
                onClick={toggleShowSearch}
                _hover={{
                  bg: `var(--chakra-colors-gray-5)`,
                }}
                hidden={showSearch}
              >
                <SvgComponent svgId='icon-search' fill={'gray.3'} />
              </Flex>
              {((tabKey === TAB_KEY.COLLECTION_TAB &&
                !isEmpty(activeCollectionList)) ||
                (tabKey === TAB_KEY.MY_POOLS_TAB && !isEmpty(myPoolsData))) && (
                <Button
                  variant={'secondary'}
                  minW='200px'
                  onClick={() => interceptFn(() => navigate('/lending/create'))}
                  className='my-other-step'
                >
                  + Create New Pool
                </Button>
              )}
            </Flex>
          )}
          <TabList
            _active={{
              color: 'blue.1',
              fontWeight: 'bold',
            }}
            position='sticky'
            top={{ md: '131px', sm: '131px', xs: '107px' }}
            bg='white'
            zIndex={2}
            w={{
              md: '100%',
              sm: '100%',
              xs: 'max-content',
            }}
            justifyContent={{
              md: 'flex-start',
              sm: 'space-between',
              xs: 'space-between',
            }}
          >
            <TabWrapper>Collections</TabWrapper>
            <TabWrapper>
              My Pools
              {!isEmpty(myPoolsData) && (
                <Tag
                  bg={'blue.1'}
                  color='white'
                  borderRadius={15}
                  fontSize='12px'
                  w='27px'
                  h='20px'
                  textAlign={'center'}
                  justifyContent='center'
                  lineHeight={2}
                  fontWeight='700'
                  ml='4px'
                >
                  {poolList?.length}
                </Tag>
              )}
            </TabWrapper>
            <TabWrapper>Outstanding Loans</TabWrapper>
          </TabList>
        </Box>

        <Box
          display={{
            md: 'none',
            sm: 'block',
            xs: 'block',
          }}
          mt='20px'
          hidden={
            tabKey === TAB_KEY.LOANS_TAB ||
            (tabKey === TAB_KEY.COLLECTION_TAB &&
              isEmpty(activeCollectionList)) ||
            (tabKey === TAB_KEY.MY_POOLS_TAB && isEmpty(poolList))
          }
        >
          <SearchInput
            value={
              tabKey === TAB_KEY.COLLECTION_TAB
                ? activeCollectionSearchValue
                : myPoolsSearchValue
            }
            onChange={(e) => {
              if (tabKey === TAB_KEY.COLLECTION_TAB) {
                setActiveCollectionSearchValue(e.target.value)
              }
              if (tabKey === TAB_KEY.MY_POOLS_TAB) {
                setMyPoolsSearchValue(e.target.value)
              }
            }}
          />
        </Box>
        <TabPanels>
          <TabPanel p={0} pb='20px'>
            <MyTable
              loading={poolsLoading1 || collectionLoading}
              columns={activeCollectionColumns}
              data={filteredActiveCollectionList || []}
              emptyRender={() => {
                return (
                  <EmptyComponent
                    action={() => {
                      return (
                        <Button
                          variant={'secondary'}
                          minW='200px'
                          onClick={() =>
                            interceptFn(() => navigate('/lending/create'))
                          }
                        >
                          + Create New Pool
                        </Button>
                      )
                    }}
                  />
                )
              }}
            />
          </TabPanel>
          <TabPanel p={0} pb='20px'>
            <MyTable
              loading={poolsLoading2 || collectionLoading}
              columns={myPoolsColumns}
              data={filteredPoolList || []}
              emptyRender={() => {
                return (
                  <EmptyComponent
                    action={() => {
                      return (
                        <Button
                          variant={'secondary'}
                          minW='200px'
                          onClick={() =>
                            interceptFn(() => navigate('/lending/create'))
                          }
                        >
                          + Create New Pool
                        </Button>
                      )
                    }}
                  />
                )
              }}
            />
          </TabPanel>
          <TabPanel p={0} pb='20px'>
            <Flex justify={'space-between'} mt='16px' flexWrap='wrap'>
              <Box
                border={`1px solid var(--chakra-colors-gray-2)`}
                borderRadius={12}
                p={'24px'}
                w={{
                  xl: '360px',
                  lg: '300px',
                  md: '260px',
                }}
                display={{
                  md: 'block',
                  sm: 'none',
                  xs: 'none',
                }}
              >
                <Heading mb='16px' fontSize={'16px'}>
                  My Collection Pools
                </Heading>
                <Box
                  hidden={
                    !loanCollectionSearchValue &&
                    !filteredPoolCollectionList?.length
                  }
                >
                  <SearchInput
                    placeholder='Collections...'
                    value={loanCollectionSearchValue}
                    onChange={(e) =>
                      setLoanCollectionSearchValue(e.target.value)
                    }
                  />
                </Box>

                <List spacing='16px' mt='16px' position='relative'>
                  <LoadingComponent
                    loading={poolsLoading2 || collectionLoading}
                    top={0}
                  />
                  {isEmpty(filteredPoolCollectionList) &&
                    !poolsLoading2 &&
                    !collectionLoading && <EmptyComponent />}
                  {!isEmpty(filteredPoolCollectionList) && (
                    <Flex
                      justify={'space-between'}
                      py='12px'
                      px='16px'
                      alignItems='center'
                      borderRadius={8}
                      border={`1px solid var(--chakra-colors-gray-2)`}
                      cursor='pointer'
                      onClick={() => setSelectKeyForOpenLoans(undefined)}
                      bg={
                        selectKeyForOpenLoans === undefined ? 'blue.2' : 'white'
                      }
                    >
                      <Text fontSize='14px' fontWeight='700'>
                        All My Collections
                      </Text>
                      {selectKeyForOpenLoans === undefined ? (
                        <SvgComponent svgId='icon-checked' />
                      ) : (
                        <Text fontSize='14px'>{totalLoanCount || ''}</Text>
                      )}
                    </Flex>
                  )}

                  {!isEmpty(filteredPoolCollectionList) &&
                    filteredPoolCollectionList.map(
                      ({
                        pool_id,
                        allow_collateral_contract,
                        loan_count,
                        nftCollection,
                      }) => {
                        return (
                          <CollectionListItem
                            data={{
                              nftCollection,
                              contractAddress: allow_collateral_contract,
                            }}
                            key={`${pool_id}${allow_collateral_contract}`}
                            onClick={() => setSelectKeyForOpenLoans(pool_id)}
                            isActive={selectKeyForOpenLoans === pool_id}
                            count={loan_count}
                          />
                        )
                      },
                    )}
                </List>
              </Box>
              <Box
                w={{
                  lg: '72%',
                  md: '65%',
                  sm: '100%',
                  xs: '100%',
                }}
              >
                <TableList
                  tables={[
                    {
                      tableTitle: () => (
                        <Heading
                          fontSize={'20px'}
                          mt={{
                            md: '16px',
                            sm: '20px',
                            xs: '20px',
                          }}
                        >
                          Current Loans as Lender
                        </Heading>
                      ),
                      columns: loansForLendColumns,
                      loading: loansLoading,
                      data: sortBy(loansData[0], (i) => -i.loan_start_time),
                      key: '1',
                      loadingConfig: {
                        top: '30px',
                        loading: loansLoading,
                      },
                    },
                    {
                      tableTitle: () => (
                        <Heading
                          fontSize={'20px'}
                          mt={{
                            md: '16px',
                            sm: '40px',
                            xs: '40px',
                          }}
                        >
                          <Highlight
                            styles={{
                              fontSize: '18px',
                              fontWeight: 500,
                              color: `gray.3`,
                            }}
                            query='(Paid Off)'
                          >
                            Previous Loans as Lender(Paid Off)
                          </Highlight>
                        </Heading>
                      ),
                      columns: loansForLendColumns,
                      data: sortBy(loansData[1], (i) => -i.loan_start_time),
                      loading: loansLoading,
                      key: '2',
                      loadingConfig: {
                        top: '30px',
                        loading: loansLoading,
                      },
                    },
                    {
                      tableTitle: () => (
                        <Heading
                          fontSize={'20px'}
                          mt={{
                            md: '16px',
                            sm: '40px',
                            xs: '40px',
                          }}
                        >
                          <Highlight
                            styles={{
                              fontSize: '18px',
                              fontWeight: 500,
                              color: `gray.3`,
                            }}
                            query='(Overdue)'
                          >
                            Previous Loans as Lender(Overdue)
                          </Highlight>
                        </Heading>
                      ),
                      columns: loansForLendColumns,
                      data: sortBy(loansData[2], (i) => -i.loan_start_time),
                      loading: loansLoading,
                      key: '3',
                      loadingConfig: {
                        top: '30px',
                        loading: loansLoading,
                      },
                    },
                  ]}
                />
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {[TAB_KEY.COLLECTION_TAB, TAB_KEY.MY_POOLS_TAB].includes(tabKey) &&
        !isEmpty(myPoolsData) && (
          <Flex
            bg='white'
            position={'fixed'}
            bottom={0}
            left={0}
            right={0}
            h='74px'
            display={{ md: 'none', sm: 'flex', xs: 'flex' }}
            alignItems='center'
            justify={'center'}
            zIndex={5}
            px={8}
          >
            <Button
              variant={'primary'}
              w='100%'
              h='42px'
              onClick={() => interceptFn(() => navigate('/lending/create'))}
            >
              + Create New Pool
            </Button>
          </Flex>
        )}

      {tabKey === TAB_KEY.LOANS_TAB && (
        <Flex
          bg='white'
          position={'fixed'}
          bottom={0}
          left={0}
          right={0}
          h='74px'
          display={{ md: 'none', sm: 'flex', xs: 'flex' }}
          alignItems='center'
          justify={'center'}
          zIndex={5}
          px={8}
        >
          <Button
            variant={'primary'}
            w='100%'
            h='42px'
            onClick={openDraw}
            leftIcon={<SvgComponent svgId='icon-search' fill={'white'} />}
          >
            My Collection Pools
          </Button>
        </Flex>
      )}
      <Drawer placement={'bottom'} onClose={closeDraw} isOpen={drawVisible}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius={16} pb='40px' h='85vh'>
          <DrawerBody>
            <DrawerCloseButton mt='40px' />
            <Heading fontSize={'24px'} pt='40px' pb='32px'>
              My Collection Pools
            </Heading>
            <Box
              hidden={
                !loanCollectionSearchValue &&
                !filteredPoolCollectionList?.length
              }
            >
              <SearchInput
                placeholder='Collections...'
                value={loanCollectionSearchValue}
                onChange={(e) => setLoanCollectionSearchValue(e.target.value)}
              />
            </Box>

            <List spacing={'16px'} position='relative' mt='16px'>
              <LoadingComponent
                loading={poolsLoading2 || collectionLoading}
                top={0}
                borderRadius={8}
              />
              {isEmpty(filteredPoolCollectionList) &&
                !poolsLoading2 &&
                !collectionLoading && <EmptyComponent />}
              {!isEmpty(filteredPoolCollectionList) && (
                <Flex
                  justify={'space-between'}
                  py='12px'
                  px='16px'
                  alignItems='center'
                  borderRadius={8}
                  border={`1px solid var(--chakra-colors-gray-2)`}
                  cursor='pointer'
                  onClick={() => setSelectKeyForOpenLoans(undefined)}
                  bg={selectKeyForOpenLoans === undefined ? 'blue.2' : 'white'}
                >
                  <Text fontSize='14px' fontWeight='700'>
                    All My Collections
                  </Text>

                  {selectKeyForOpenLoans === undefined ? (
                    <SvgComponent svgId='icon-checked' />
                  ) : (
                    <Text fontSize='14px'>{totalLoanCount || ''}</Text>
                  )}
                </Flex>
              )}

              {!isEmpty(filteredPoolCollectionList) &&
                filteredPoolCollectionList.map(
                  ({
                    pool_id,
                    allow_collateral_contract,
                    loan_count,
                  }: PoolsListItemType) => {
                    const collection_info = collectionList?.find(
                      (i) =>
                        i.contractAddress.toLowerCase() ===
                        allow_collateral_contract.toLowerCase(),
                    )

                    return (
                      <CollectionListItem
                        data={collection_info}
                        key={`${pool_id}${allow_collateral_contract}`}
                        onClick={() => setSelectKeyForOpenLoans(pool_id)}
                        isActive={selectKeyForOpenLoans === pool_id}
                        count={loan_count}
                      />
                    )
                  },
                )}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default Lend

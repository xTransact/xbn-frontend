import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  GridItem,
  Heading,
  List,
  SimpleGrid,
  Text,
  useDisclosure,
  Image,
} from '@chakra-ui/react'
import useDebounce from 'ahooks/lib/useDebounce'
import useInfiniteScroll from 'ahooks/lib/useInfiniteScroll'
import useRequest from 'ahooks/lib/useRequest'
import bigNumber from 'bignumber.js'
import isEmpty from 'lodash-es/isEmpty'
import max from 'lodash-es/max'
import min from 'lodash-es/min'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiGetFloorPrice, apiGetPools } from '@/api'
import ImgLabel from '@/assets/desire-label.png'
import {
  BuyerGuideModal,
  ConnectWalletModal,
  EmptyComponent,
  LoadingComponent,
  SearchInput,
} from '@/components'
import { TransactionContext } from '@/context/TransactionContext'
import {
  NftAssetStatus,
  useNftCollectionSearchAssetLazyQuery,
  NftAssetOrderByField,
  OrderDirection,
  useNftCollectionAssetsLazyQuery,
  useWallet,
  type NftAsset,
  useGuide,
} from '@/hooks'
import { wei2Eth } from '@/utils/unit-conversion'

import CollectionDescription from './components/CollectionDescription'
import CollectionListItem from './components/CollectionListItem'
import MarketNftListCard from './components/MarketNftListCard'
import Toolbar from './components/Toolbar'

const SORT_OPTIONS = [
  {
    label: 'Price: low to high',
    value: {
      direction: OrderDirection.Asc,
      field: NftAssetOrderByField.Price,
    },
  },
  {
    label: 'Price: high to low',
    value: {
      direction: OrderDirection.Desc,
      field: NftAssetOrderByField.Price,
    },
  },
  {
    label: 'Recent Created',
    value: {
      direction: OrderDirection.Desc,
      field: NftAssetOrderByField.CreatedAt,
    },
  },
]

const Market = () => {
  const navigate = useNavigate()
  const pathData = useParams()
  const { search } = useLocation()
  const { isOpen, onClose, interceptFn } = useWallet()
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()
  const [selectCollection, setSelectCollection] =
    useState<XBNCollectionItemType>()
  const [assetSearchValue, setAssetSearchValue] = useState('')
  const debounceSearchValue = useDebounce(assetSearchValue, { wait: 500 })
  const [collectionSearchValue, setCollectionSearchValue] = useState('')
  const debounceCollectionSearchValue = useDebounce(collectionSearchValue, {
    wait: 500,
  })
  const [orderOption, setOrderOption] = useState(SORT_OPTIONS[0])

  const [poolsMap, setPoolsMap] = useState<Map<string, PoolsListItemType[]>>()

  const { loading: poolsLoading } = useRequest(() => apiGetPools({}), {
    onSuccess: (data) => {
      if (isEmpty(data)) {
        return
      }
      const newMap = new Map()
      data.forEach((item) => {
        const lowercaseAddress = item.allow_collateral_contract.toLowerCase()
        const prev = newMap.get(lowercaseAddress)
        if (prev) {
          newMap.set(lowercaseAddress, [...prev, item])
        } else {
          newMap.set(lowercaseAddress, [item])
        }
      })

      setPoolsMap(newMap)
    },
    debounceWait: 100,
  })

  const collectionWithPoolsIds = useMemo(
    () => (poolsMap ? [...poolsMap.keys()] : []),
    [poolsMap],
  )

  const { collectionList, collectionLoading } = useContext(TransactionContext)

  const collectionData = useMemo(() => {
    if (!collectionList) return
    if (isEmpty(collectionList)) return []
    return collectionList
      .filter((i) => collectionWithPoolsIds.includes(i.contractAddress))
      .sort((a, b) => -a.priority + b.priority)
  }, [collectionList, collectionWithPoolsIds])
  console.log(collectionData)

  const initialCollection = useMemo(() => {
    if (!collectionData || isEmpty(collectionData)) {
      return
    }

    const prevCollectionId = pathData?.collectionId
    const prevItem = collectionData.find(
      (i) => i.nftCollection.id === prevCollectionId,
    )

    const currentItem = prevItem || collectionData[0]
    return currentItem
  }, [collectionData, pathData])

  useEffect(() => {
    if (!initialCollection) return
    setSelectCollection(initialCollection)
    navigate(
      `/buy-nfts/market/${initialCollection.nftCollection.id}${search || ''}`,
    )
  }, [initialCollection, navigate, search])

  const [floorPrice, setFloorPrice] = useState<number>()
  const { loading: floorPriceLoading, data: floorPriceData } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: selectCollection?.nftCollection.slug || '',
      }),
    {
      ready: !!selectCollection,
      refreshDeps: [selectCollection],
      // cacheKey: `staleTime-floorPrice-${selectCollection?.nftCollection?.slug}`,
      // staleTime: 1000 * 60,
    },
  )

  useEffect(() => {
    if (!floorPriceData) return
    if (isEmpty(floorPriceData)) return
    setFloorPrice(floorPriceData.floor_price)
  }, [floorPriceData])

  const currentCollectionPools = useMemo(() => {
    if (!selectCollection || !poolsMap) return []
    return poolsMap.get(selectCollection.contractAddress)
  }, [poolsMap, selectCollection])

  const bestPoolAmount: number | undefined = useMemo(() => {
    if (!selectCollection) return
    if (!currentCollectionPools) return
    if (floorPrice === undefined) return
    // 取当前 collection 的所有 pool，算出每个 pool 的实际可借出金额
    const prevArr = currentCollectionPools.map((i) => {
      // 该 pool 剩余可借 amount
      const availablePoolSize = wei2Eth(
        bigNumber(i.pool_amount).minus(i.pool_used_amount),
      )
      // 地板价 * 该 pool 最大贷款比例
      const floorPriceMultiPercentage = bigNumber(floorPrice)
        .multipliedBy(i.pool_maximum_percentage)
        .dividedBy(10000)
        .toNumber()
      // 单笔最大贷款金额
      const maxLoanAmountEth = wei2Eth(i.maximum_loan_amount)
      // 三者取最小，极为该 pool 的实际可借出金额
      console.log(
        `pool id 为 ${i.pool_id}:`,
        'availablePoolSize---',
        availablePoolSize,
        ';',
        'floorPriceMultiPercentage',
        floorPriceMultiPercentage,
        ';',
        'maxSingleLoanAmount',
        maxLoanAmountEth,
      )
      return min([
        availablePoolSize,
        floorPriceMultiPercentage,
        maxLoanAmountEth,
      ])
    })
    console.log('所有 pool 的最大的 实际可借出金额', prevArr)
    // 取所有 pool 的最大的 实际可借出金额
    const prevMax = max(prevArr)
    // 实际可借出金额 与 地板价 二者取其小
    return min([prevMax, floorPrice])
  }, [selectCollection, floorPrice, currentCollectionPools])

  console.log('collection的可贷款金额', bestPoolAmount)
  // useEffect(() => {
  //   if (!selectCollection) return
  //   const {
  //     nftCollection: { id },
  //   } = selectCollection
  //   navigate(`/buy-nfts/market/${id}${search}`)
  // }, [selectCollection, navigate, search])

  // 根据 collectionId 搜索 assets
  const [fetchAssetByCollectionId] = useNftCollectionAssetsLazyQuery({
    fetchPolicy: 'network-only',
  })

  const getLoadMoreList = useCallback(
    async (after: string | null, first: number) => {
      if (!selectCollection?.nftCollection?.id || !fetchAssetByCollectionId)
        return {
          list: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        }
      const { data } = await fetchAssetByCollectionId({
        variables: {
          collectionId: `${selectCollection?.nftCollection?.id}`,
          orderBy: orderOption.value,
          where: {
            status: [NftAssetStatus.BuyNow],
          },
          first,
          after,
        },
      })

      return {
        list: data?.nftCollectionAssets.edges || [],
        pageInfo: data?.nftCollectionAssets.pageInfo,
      }
    },
    [fetchAssetByCollectionId, selectCollection, orderOption],
  )

  const {
    data: assetsData,
    loading: assetLoading,
    // loadMore,
    loadingMore: assetLoadingMore,
    noMore,
    loadMore,
  } = useInfiniteScroll(
    (item) =>
      getLoadMoreList(item?.pageInfo?.endCursor, item?.list.length || 24),
    {
      // target: ref,
      isNoMore: (item) => !item?.pageInfo?.hasNextPage,
      reloadDeps: [selectCollection?.nftCollection?.id, orderOption],
      // threshold: 10,
      manual: true,
    },
  )

  const filteredCollectionList = useMemo(() => {
    if (!collectionData) return
    if (!debounceCollectionSearchValue) return collectionData || []
    return collectionData.filter((item) =>
      item.nftCollection.name
        .toLocaleLowerCase()
        .includes(debounceCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [collectionData, debounceCollectionSearchValue])

  const [fetchAssetBySearch, { loading: fetchAssetBySearchLoading }] =
    useNftCollectionSearchAssetLazyQuery()
  const [searchedAsset, setSearchedAsset] = useState<NftAsset>()

  useEffect(() => {
    if (!debounceSearchValue || !fetchAssetBySearch || !selectCollection) {
      return setSearchedAsset(undefined)
    }
    fetchAssetBySearch({
      variables: {
        collectionId: selectCollection?.nftCollection?.id,
        search: debounceSearchValue,
      },
    })
      .then(({ data }) => {
        setSearchedAsset(data?.nftCollectionSearchAsset)
      })
      .catch(() => {
        setSearchedAsset(undefined)
      })
  }, [debounceSearchValue, fetchAssetBySearch, selectCollection])

  // grid
  const [grid, setGrid] = useState(3)

  const responsiveSpan = useMemo(
    () => ({
      xl: grid,
      lg: grid,
      md: grid,
      sm: 2,
      xs: 2,
    }),
    [grid],
  )

  const { isOpen: guideVisible, onClose: closeGuide } = useGuide({
    key: 'has-read-buyer-guide',
  })
  return (
    <>
      <BuyerGuideModal isOpen={guideVisible} onClose={closeGuide} />
      {/* Propose Listing */}
      <Box
        pos={'sticky'}
        top={'92vh'}
        zIndex={9}
        w={{
          xl: '300px',
          lg: '260px',
          md: '100%',
          sm: '100%',
          xs: '100%',
        }}
      >
        <Image
          src={ImgLabel}
          w='160px'
          right={0}
          position={'absolute'}
          top='-55%'
        />
        <Button w='100%' variant={'primary'}>
          Propose Listing
        </Button>
      </Box>
      <Box
        mb={{ md: '40px', sm: 0, xs: 0 }}
        mt={{
          md: '60px',
          sm: '16px',
          xs: '16px',
        }}
      >
        <Heading fontSize={{ md: '48px', sm: '24px', xs: '24px' }}>
          Buy NFTs
        </Heading>
      </Box>

      <Flex
        mt={'10px'}
        mb='100px'
        gap={9}
        flexWrap={{ lg: 'nowrap', md: 'wrap', sm: 'wrap', xs: 'wrap' }}
      >
        <Box
          w={{
            xl: '300px',
            lg: '260px',
            md: '100%',
            sm: '100%',
            xs: '100%',
          }}
          pos={'relative'}
        >
          <Box
            borderColor='gray.2'
            borderWidth={{ md: 1, sm: 0, xs: 0 }}
            borderRadius={{ md: '12px', sm: 0, xs: 0 }}
            pt={{ md: '24px', sm: 0, xs: 0 }}
            px={{ md: '24px', sm: 0, xs: 0 }}
            // overflowY='auto'
            overflowX={'visible'}
            position={{
              md: 'sticky',
              sm: 'static',
              xs: 'static',
            }}
            minH={{
              md: '400px',
              sm: '100px',
              xs: '100px',
            }}
            top='151px'
          >
            <Heading fontSize={'16px'} mb='16px'>
              Top Collections
            </Heading>
            {/* pc collection list */}
            <Box
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}
              pb='20px'
            >
              <Box
                hidden={
                  !collectionSearchValue && !filteredCollectionList?.length
                }
              >
                <SearchInput
                  placeholder='Collections...'
                  isDisabled={collectionLoading || poolsLoading}
                  value={collectionSearchValue}
                  onChange={(e) => {
                    setCollectionSearchValue(e.target.value)
                  }}
                />
              </Box>

              {/* pc 端 */}
              <List
                spacing='16px'
                mt='16px'
                position='relative'
                display={{
                  md: 'block',
                  sm: 'none',
                  xs: 'none',
                }}
              >
                <LoadingComponent
                  loading={collectionLoading || poolsLoading}
                  top={0}
                  minH={'220px'}
                />
                {isEmpty(filteredCollectionList) &&
                  !collectionLoading &&
                  !poolsLoading && <EmptyComponent />}

                {filteredCollectionList?.map((item) => (
                  <CollectionListItem
                    data={item}
                    key={`${item?.nftCollection?.id}${item?.contractAddress}`}
                    onClick={() => {
                      setSelectCollection(item)
                      setOrderOption(SORT_OPTIONS[0])
                      setAssetSearchValue('')
                      setCollectionSearchValue('')
                      navigate(
                        `/buy-nfts/market/${item.nftCollection.id}${search}`,
                      )
                    }}
                    count={item.nftCollection.assetsCount}
                    isActive={
                      selectCollection?.nftCollection?.id ===
                      item?.nftCollection?.id
                    }
                  />
                ))}
              </List>
            </Box>
            {/* 移动端  collection list*/}
            <Box
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
              mt={'16px'}
              position='relative'
            >
              <CollectionListItem
                isActive
                data={selectCollection}
                onClick={openDraw}
              />
              <Divider mt='16px' />
              <Drawer
                placement={'bottom'}
                onClose={closeDraw}
                isOpen={drawVisible}
              >
                <DrawerOverlay />
                <DrawerContent borderTopRadius={16} pb='40px'>
                  <DrawerBody>
                    <Heading fontSize={'16px'} pt='40px' pb='32px'>
                      Top Collections
                    </Heading>
                    <Box
                      hidden={
                        !collectionSearchValue &&
                        !filteredCollectionList?.length
                      }
                    >
                      <SearchInput
                        placeholder='Collections...'
                        value={collectionSearchValue}
                        onChange={(e) => {
                          setCollectionSearchValue(e.target.value)
                        }}
                      />
                    </Box>

                    <List spacing='16px' mt='16px' position='relative'>
                      <LoadingComponent
                        loading={collectionLoading || poolsLoading}
                        top={0}
                      />
                      {!filteredCollectionList?.length &&
                        !collectionLoading && <EmptyComponent />}

                      {filteredCollectionList?.map((item) => (
                        <CollectionListItem
                          data={item}
                          key={`${item?.nftCollection?.id}${item?.contractAddress}`}
                          onClick={() => {
                            setSelectCollection(item)
                            setOrderOption(SORT_OPTIONS[0])
                            setAssetSearchValue('')
                            setCollectionSearchValue('')
                            closeDraw()
                            navigate(
                              `/buy-nfts/market/${item.nftCollection.id}${search}`,
                            )
                          }}
                          count={item.nftCollection.assetsCount}
                          isActive={
                            selectCollection?.nftCollection?.id ===
                            item?.nftCollection?.id
                          }
                          iconSize='26px'
                        />
                      ))}
                    </List>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          </Box>
        </Box>

        <Box
          w={{
            xl: '820px',
            lg: '640px',
            md: '100%',
            sm: '100%',
            xs: '100%',
          }}
        >
          <CollectionDescription
            loading={collectionLoading || poolsLoading || floorPriceLoading}
            data={selectCollection?.nftCollection}
            floorPrice={floorPrice}
            bestPoolAmount={bestPoolAmount}
            tags={selectCollection?.tags}
          />
          <Toolbar
            loading={collectionLoading || poolsLoading}
            searchConfig={{
              searchValue: assetSearchValue,
              setSearchValue: (t) => setAssetSearchValue(t),
            }}
            sortConfig={{
              sortOptions: SORT_OPTIONS,
              sortValue: orderOption,
              setSortValue: (t) => setOrderOption(t),
            }}
            gridConfig={{
              gridValue: grid,
              setGridValue: (t) => setGrid(t),
            }}
          />

          {!debounceSearchValue && (
            <SimpleGrid
              spacingX={{
                xl: '16px',
                lg: '8px',
                md: '8px',
                sm: '10px',
                xs: '10px',
              }}
              spacingY={'20px'}
              columns={responsiveSpan}
              position={'relative'}
            >
              <LoadingComponent
                loading={
                  assetLoading ||
                  poolsLoading ||
                  collectionLoading ||
                  floorPriceLoading
                }
                top={0}
              />
              {isEmpty(assetsData?.list) ? (
                <GridItem colSpan={responsiveSpan}>
                  <EmptyComponent />
                </GridItem>
              ) : (
                assetsData?.list?.map((item) => {
                  if (!item) return null
                  const { node } = item
                  const {
                    tokenID,
                    nftAssetContract: { address },
                    name,
                  } = node || {}
                  return (
                    <MarketNftListCard
                      data={{ ...item, bestPoolAmount }}
                      imageSize={{
                        xl: grid === 4 ? '190px' : '260px',
                        lg: grid === 4 ? '152px' : '206px',
                        md: grid === 4 ? '172px' : '234px',
                        sm: '174px',
                        xs: '174px',
                      }}
                      isDisabled={
                        (bestPoolAmount === undefined ||
                          bestPoolAmount / item.node.orderPrice < 0.1) &&
                        floorPrice !== undefined
                      }
                      key={`${tokenID}${address}${name}`}
                      onClick={() => {
                        if (!selectCollection) return
                        // floorPrice === 0 disabled
                        // floorPrice === undefined enable
                        if (
                          (bestPoolAmount === undefined ||
                            bestPoolAmount / item.node.orderPrice < 0.1) &&
                          floorPrice !== undefined
                        ) {
                          return
                        }
                        const { nftCollection } = selectCollection
                        interceptFn(() => {
                          navigate(`/asset/${address}/${tokenID}`, {
                            state: {
                              collection: {
                                name: nftCollection.name,
                                imagePreviewUrl: nftCollection.imagePreviewUrl,
                                safelistRequestStatus:
                                  nftCollection?.safelistRequestStatus,
                                slug: nftCollection?.slug,
                              },
                            },
                            // replace: true,
                          })
                        })
                      }}
                    />
                  )
                })
              )}
              <GridItem colSpan={responsiveSpan}>
                <Flex justifyContent='center' mb={'40px'} p='20px' h='35px'>
                  {!noMore &&
                    (assetLoadingMore ? (
                      <Text>Loading more...</Text>
                    ) : (
                      <Button onClick={loadMore} variant='secondary'>
                        Click to load more
                      </Button>
                    ))}
                  {noMore && !isEmpty(assetsData?.list) && (
                    <Text>No more data</Text>
                  )}
                </Flex>
              </GridItem>
            </SimpleGrid>
          )}
          {!!debounceSearchValue && (
            <SimpleGrid
              spacingX={'16px'}
              spacingY={'20px'}
              columns={responsiveSpan}
              // overflowY='auto'
              position={'relative'}
              // overflowX='hidden'
            >
              {fetchAssetBySearchLoading || poolsLoading ? (
                <LoadingComponent loading top={0} />
              ) : !searchedAsset ? (
                <GridItem colSpan={responsiveSpan}>
                  <EmptyComponent />
                </GridItem>
              ) : (
                <MarketNftListCard
                  data={{
                    node: searchedAsset,
                    bestPoolAmount,
                  }}
                  isDisabled={
                    (bestPoolAmount === undefined ||
                      bestPoolAmount / searchedAsset.orderPrice < 0.1) &&
                    floorPrice !== undefined
                  }
                  key={`${searchedAsset.tokenID}${searchedAsset.assetContractAddress}${searchedAsset.name}`}
                  onClick={() => {
                    interceptFn(() => {
                      if (!selectCollection) return
                      if (
                        (bestPoolAmount === undefined ||
                          bestPoolAmount / searchedAsset.orderPrice < 0.1) &&
                        floorPrice !== undefined
                      ) {
                        return
                      }
                      navigate(
                        `/asset/${searchedAsset?.assetContractAddress}/${searchedAsset?.tokenID}`,
                        {
                          state: {
                            collection: {
                              ...selectCollection?.nftCollection,
                              name: selectCollection?.nftCollection?.name,
                              imagePreviewUrl:
                                selectCollection?.nftCollection
                                  ?.imagePreviewUrl,
                              safelistRequestStatus:
                                selectCollection?.nftCollection
                                  ?.safelistRequestStatus,
                              slug: selectCollection?.nftCollection?.slug,
                            },
                          },
                        },
                      )
                    })
                  }}
                />
              )}
              <GridItem colSpan={responsiveSpan} hidden={!!debounceSearchValue}>
                <Flex justifyContent='center' mb={'40px'} p='20px' h='35px'>
                  {!noMore &&
                    (assetLoadingMore ? (
                      <Text>Loading more...</Text>
                    ) : (
                      <Button onClick={loadMore} variant='secondary'>
                        Click to load more
                      </Button>
                    ))}
                  {noMore && !isEmpty(assetsData?.list) && (
                    <Text>No more data</Text>
                  )}
                </Flex>
              </GridItem>
            </SimpleGrid>
          )}
        </Box>
      </Flex>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </>
  )
}

export default Market

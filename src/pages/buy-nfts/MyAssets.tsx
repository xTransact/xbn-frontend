import {
  Box,
  Heading,
  Tabs,
  TabPanel,
  TabList,
  Tab,
  TabPanels,
  Tag,
  SimpleGrid,
  GridItem,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react'
import { useRequest } from 'ahooks'
import isEmpty from 'lodash-es/isEmpty'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetMyAssets } from '@/api'
import {
  ConnectWalletModal,
  EmptyComponent,
  LoadingComponent,
  SvgComponent,
} from '@/components'
import { useBatchAsset, useWallet } from '@/hooks'
import useAuth from '@/hooks/useAuth'
import { clearUserToken } from '@/utils/auth'

import MyAssetNftListCard from './components/MyAssetNftListCard'

// const SORT_OPTIONS = [
//   {
//     label: 'Price: low to high',
//     value: {
//       direction: OrderDirection.Asc,
//       field: NftAssetOrderByField.Price,
//     },
//   },
//   {
//     label: 'Price: high to low',
//     value: {
//       direction: OrderDirection.Desc,
//       field: NftAssetOrderByField.Price,
//     },
//   },
//   {
//     label: 'Recent Created',
//     value: {
//       direction: OrderDirection.Desc,
//       field: NftAssetOrderByField.CreatedAt,
//     },
//   },
// ]

const MyAssets = () => {
  const navigate = useNavigate()
  const { interceptFn, currentAccount, isOpen, onClose } = useWallet()
  // const [orderOption, setOrderOption] = useState(SORT_OPTIONS[0])
  // const [assetSearchValue, setAssetSearchValue] = useState('')
  // const debounceSearchValue = useDebounce(assetSearchValue, { wait: 500 })
  // console.log(
  //   '🚀 ~ file: MyAssets.tsx:63 ~ MyAssets ~ debounceSearchValue:',
  //   debounceSearchValue,
  // )
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
  const { data, loading, refresh } = useRequest(apiGetMyAssets, {
    debounceWait: 100,
    defaultParams: [
      {
        wallet_address: currentAccount,
      },
    ],
    refreshDeps: [currentAccount],
    ready: !!currentAccount && !isDenied,
    onError: async (error: any) => {
      console.log('🚀 ~ file: MyAssets.tsx:77 ~ MyAssets ~ error:', error)
      if (error.code === 'unauthenticated') {
        // 未能签名
        await runSignAsync()
        setTimeout(() => {
          refresh()
        }, 1000)
      }
    },
  })

  const batchAssetParams = useMemo(() => {
    if (!data) return []
    return data?.map((i) => ({
      assetContractAddress: i.asset_contract_address,
      assetTokenId: i.token_id,
    }))
  }, [data])
  const { data: batchNftListInfo } = useBatchAsset(batchAssetParams)

  useEffect(() => {
    interceptFn()
  }, [interceptFn])

  const [
    grid,
    // setGrid
  ] = useState(4)

  const responsiveSpan = useMemo(
    () => ({
      xl: grid,
      lg: grid,
      md: grid,
      sm: 2,
      xs: 1,
    }),
    [grid],
  )

  return (
    <Box mb='100px'>
      <Flex
        py='20px'
        onClick={() => navigate(-1)}
        display={{
          md: 'none',
          sm: 'flex',
          xs: 'flex',
        }}
      >
        <SvgComponent svgId='icon-arrow-down' transform={'rotate(90deg)'} />
      </Flex>
      <Heading
        mt={{
          md: '60px',
          sm: '10px',
          xs: '10px',
        }}
        mb={{
          md: '56px',
          sm: '32px',
          xs: '32px',
        }}
        fontSize={{
          md: '48px',
          sm: '24px',
          xs: '24px',
        }}
      >
        My Assets
      </Heading>
      {isDenied ? (
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
                setTimeout(() => {
                  refresh()
                }, 1000)
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
        <Tabs position='relative'>
          <TabList
            _active={{
              color: 'blue.1',
              fontWeight: 'bold',
            }}
          >
            <Tab
              pt='16px'
              px={'4px'}
              pb={'20px'}
              _selected={{
                color: 'blue.1',
                borderBottomWidth: 2,
                borderColor: 'blue.1',
              }}
              fontWeight='bold'
            >
              Collected &nbsp;
              {!isEmpty(data) && (
                <Tag
                  bg='blue.1'
                  color='white'
                  borderRadius={15}
                  fontSize={'12px'}
                  lineHeight={'20px'}
                >
                  {data?.length}
                </Tag>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              {/* <Toolbar
              loading={loading}
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
              loadingProps={{
                mt: '25px',
              }}
            /> */}

              <SimpleGrid
                spacingX={'16px'}
                spacingY={'20px'}
                columns={responsiveSpan}
                position={'relative'}
                mt='20px'
              >
                <LoadingComponent loading={loading} top={0} />
                {(!data || isEmpty(data)) && (
                  <GridItem colSpan={responsiveSpan}>
                    <EmptyComponent />
                  </GridItem>
                )}
                {data &&
                  data?.map((item) => {
                    // const assetInfo = batchNftListInfo?.get(JSON.stringify({
                    //   address: item.asset_contract_address.toLowerCase(),
                    //   tokenId: item.token_id,
                    // }))

                    const assetInfo = batchNftListInfo?.find(
                      (i) =>
                        i.assetContractAddress.toLowerCase() ===
                          item.asset_contract_address.toLowerCase() &&
                        i.tokenID === item.token_id,
                    )
                    return (
                      <MyAssetNftListCard
                        key={`${item?.asset_contract_address}-${item?.token_id}`}
                        imageSize={{
                          xl: grid === 4 ? '332px' : '445px',
                          lg: grid === 4 ? '220px' : '298px',
                          md: grid === 4 ? '170px' : '234px',
                          sm: '174px',
                          xs: '174px',
                        }}
                        data={{
                          assetData: {
                            tokenID: assetInfo?.tokenID || item.token_id,
                            name: assetInfo?.name,
                            imagePreviewUrl: assetInfo?.imagePreviewUrl,
                          },
                          contractData: { ...item },
                        }}
                        onRefreshList={refresh}
                      />
                    )
                  })}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </Box>
  )
}

export default MyAssets

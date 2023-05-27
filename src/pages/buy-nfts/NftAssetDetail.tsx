import {
  Box,
  Text,
  Flex,
  Button,
  SlideFade,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Highlight,
  VStack,
  Divider,
  Skeleton,
  type FlexProps,
  Spinner,
  Container,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import map from 'lodash/map'
import ceil from 'lodash-es/ceil'
import debounce from 'lodash-es/debounce'
import floor from 'lodash-es/floor'
import get from 'lodash-es/get'
import head from 'lodash-es/head'
import isEmpty from 'lodash-es/isEmpty'
import maxBy from 'lodash-es/maxBy'
import min from 'lodash-es/min'
import minBy from 'lodash-es/minBy'
import range from 'lodash-es/range'
import Lottie from 'lottie-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type FunctionComponent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiGetXCurrency, apiPostLoanOrder } from '@/api'
import uiSuccessJson from '@/assets/ui-sucess.json'
import {
  ConnectWalletModal,
  NotFound,
  SvgComponent,
  NftMedia,
  H5SecondaryHeader,
} from '@/components'
import { COLLATERALS, FORMAT_NUMBER, TENORS, UNIT } from '@/constants'
import {
  useWallet,
  useAssetOrdersPriceLazyQuery,
  useAssetQuery,
  useBatchWethBalance,
  useCatchContractError,
  type AssetOrdersPriceQuery,
  type AssetQueryVariables,
  type NftOrder,
  type NftCollection,
} from '@/hooks'
import { amortizationCalByDays } from '@/utils/calculation'
import { createWeb3Provider, createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

import BelongToCollection from './components/BelongToCollection'
import DetailComponent from './components/DetailComponent'
import ImageToolBar from './components/ImageToolBar'
import LabelComponent from './components/LabelComponent'
import PlanItem from './components/PlanItem'
import RadioCard from './components/RadioCard'

enum LOAN_DAYS_ENUM {
  Loan7Days = 7,
  Loan14Days = 14,
  Loan30Days = 30,
  Loan60Days = 60,
  Loan90Days = 90,
}

type PoolType = {
  pool_id: number
  pool_apr_with_spread: number
  pool_days: LOAN_DAYS_ENUM
  lp_address: string
  lp_pool_apr: number
}

const NFTDetailContainer: FunctionComponent<FlexProps> = ({
  children,
  ...rest
}) => (
  <Flex
    justify={{
      lg: 'space-between',
    }}
    alignItems='flex-start'
    flexWrap={{ lg: 'nowrap', md: 'wrap' }}
    gap={{
      md: '40px',
      sm: 0,
      xs: 0,
    }}
    mx={{
      md: '58px',
      sm: 0,
      xs: 0,
    }}
    mb={{ md: '80px' }}
    flexDir={{
      md: 'row',
      sm: 'column',
      xs: 'column',
    }}
    {...rest}
  >
    {children}
  </Flex>
)

const NftAssetDetail = () => {
  const navigate = useNavigate()
  const { toastError, toast } = useCatchContractError()
  const timer = useRef<NodeJS.Timeout>()
  const [loanStep, setLoanStep] = useState<'loading' | 'success' | undefined>()
  const { isOpen, onClose, currentAccount, interceptFn } = useWallet()
  const {
    state,
  }: {
    state: {
      collection: NftCollection
      poolsList: PoolsListItemType[]
      assetVariable: AssetQueryVariables
    }
  } = useLocation()

  useEffect(() => {
    const web3 = createWeb3Provider()
    web3.eth.clearSubscriptions()
  }, [])

  useEffect(() => {
    return () => {
      if (timer?.current) {
        clearTimeout(timer.current)
      }
    }
  }, [timer])

  // 读取利差 X 0.1
  const fetchInterestSpread = async () => {
    // const xBankContract = createXBankContract()
    // const listLoan = await xBankContract.methods.listLoan().call()
    // console.log(
    //   '🚀 ~ file: NftAssetDetail.tsx:164 ~ fetchInterestSpread ~ listLoan:',
    //   listLoan,
    // )
    return 0.1
  }

  const { loading: fetchSpreadLoading, data: interestSpread } =
    useRequest(fetchInterestSpread)

  const [commodityWeiPrice, setCommodityWeiPrice] = useState(BigNumber(0))
  // const [, setUpdatedAt] = useState('')

  const { collection, poolsList: originPoolList, assetVariable } = state || {}
  const { data: detail, loading: assetFetchLoading } = useAssetQuery({
    variables: assetVariable,
  })

  const [openSeaOrders, setOpenSeaOrders] = useState<{ node: NftOrder }[]>()
  /* 查询 NFT 在 OpenSea 上的 Orders */
  const [
    queryOpenSeaAssetOrders,
    {
      loading: ordersPriceFetchLoading,
      startPolling: startPollingOpenSeaAssetOrders,
      stopPolling: stopPollingOpenSeaAssetOrders,
    },
  ] = useAssetOrdersPriceLazyQuery({
    fetchPolicy: 'network-only',
    onCompleted: (data: AssetOrdersPriceQuery) => {
      const _openSeaOrders = get(data, 'assetOrders.edges', []) as {
        node: NftOrder
      }[]
      setOpenSeaOrders(_openSeaOrders)
    },
  })
  const fetchOrderPrice = useCallback(() => {
    if (!detail) return
    queryOpenSeaAssetOrders({
      variables: {
        assetTokenId: detail?.asset.tokenID,
        assetContractAddress: detail?.asset.assetContractAddress,
        withUpdate: true,
      },
    })
  }, [detail, queryOpenSeaAssetOrders])
  useEffect(() => {
    if (!fetchOrderPrice) return
    fetchOrderPrice()
  }, [fetchOrderPrice])

  useEffect(() => {
    const updatedAt = get(head(openSeaOrders), 'node.updatedAt', '')
    if (updatedAt) {
      const updatedAtObj = dayjs(updatedAt)
      if (updatedAtObj.isValid()) {
        const msTime = dayjs(Date.now()).diff(updatedAtObj, 'minute')
        if (msTime > 1) {
          // 如果更新时间距离现在大于一分钟，则需要重新请求 OpenSea Orders 数据
          // 在一分钟之内 每隔 5s 请求一次数据，如果数据 updatedAt 距离当前时间小于一分钟，则停止请求
          stopPollingOpenSeaAssetOrders()
          startPollingOpenSeaAssetOrders(5000)
          setTimeout(() => {
            stopPollingOpenSeaAssetOrders()
          }, 1000 * 60)
        } else {
          stopPollingOpenSeaAssetOrders()
        }
      }
    }
  }, [
    openSeaOrders,
    stopPollingOpenSeaAssetOrders,
    startPollingOpenSeaAssetOrders,
    queryOpenSeaAssetOrders,
  ])

  useEffect(() => {
    const priceArr = map(openSeaOrders, (row) => {
      const x = get(row, 'node')
      const decimals = get(x, 'nftPaymentToken.decimals', 0)
      const weiDiffDecimals = 18 - Number(decimals)
      const price = get(x, 'price')
      const _price = new BigNumber(price).dividedBy(
        new BigNumber(10).pow(weiDiffDecimals),
      )
      return _price.toNumber()
    })
    const minPrice = min(priceArr) || 0
    setCommodityWeiPrice(BigNumber(minPrice))
  }, [openSeaOrders])

  const [percentage, setPercentage] = useState(COLLATERALS[4])
  const loanPercentage = useMemo(() => 10000 - percentage, [percentage])

  useEffect(() => {
    if (isEmpty(originPoolList) || !originPoolList) {
      setPercentage(COLLATERALS[4])
      return
    }
    const percentagesMax = maxBy(
      originPoolList,
      (i) => i.pool_maximum_percentage,
    )?.pool_maximum_percentage
    if (!percentagesMax) {
      return
    }
    // 滑竿默认定位在这笔订单匹配到的所有贷款 offer 的刻度区间中最中间的那个刻度
    const defaultPercentage = ceil(percentagesMax / 1000 / 2) * 1000
    setPercentage(10000 - defaultPercentage)
  }, [originPoolList])

  // 首付价格
  const downPaymentWei = useMemo(() => {
    if (!commodityWeiPrice) return BigNumber(0)
    return commodityWeiPrice.multipliedBy(percentage).dividedBy(10000)
  }, [commodityWeiPrice, percentage])

  // 贷款价格
  const loanWeiAmount = useMemo(() => {
    return commodityWeiPrice.minus(downPaymentWei)
  }, [commodityWeiPrice, downPaymentWei])

  const { loading: balanceFetchLoading, data: latestBalanceMap } =
    useBatchWethBalance(originPoolList?.map((i) => i?.owner_address))

  const [selectPool, setSelectPool] = useState<PoolType>()

  const pools = useMemo(() => {
    if (
      !originPoolList ||
      isEmpty(originPoolList) ||
      latestBalanceMap?.size === 0 ||
      loanWeiAmount?.eq(0) ||
      fetchSpreadLoading
    ) {
      setSelectPool(undefined)
      return []
    }
    const filterPercentageAndLatestBalancePools = originPoolList.filter(
      (item) => {
        // 此 pool 创建者最新 weth 资产
        const latestWeth = latestBalanceMap?.get(item.owner_address)
        if (!latestWeth) {
          return false
        }
        // 此 pool 最新可用资产
        const poolLatestCanUseAmount = BigNumber(item.pool_amount).minus(
          item.pool_used_amount,
        )
        // 二者取较小值用于比较
        const forCompareWei = poolLatestCanUseAmount.lte(latestWeth)
          ? poolLatestCanUseAmount
          : latestWeth
        return (
          item.pool_maximum_percentage >= loanPercentage &&
          loanWeiAmount.lte(forCompareWei) &&
          //  存在一些脏数据
          item.loan_ratio_preferential_flexibility <= 200 &&
          item.loan_ratio_preferential_flexibility <= 200
        )
      },
    )
    console.log(
      'pool 筛选逻辑第 1 & 2 条的结果',
      filterPercentageAndLatestBalancePools,
    )

    const currentPools: PoolType[] = []
    for (let index = 0; index < TENORS.length; index++) {
      // 7 14 30 60 90
      const item = TENORS[index]
      const currentFilterPools = filterPercentageAndLatestBalancePools.filter(
        (i) => i.pool_maximum_days >= item,
      )
      if (isEmpty(currentFilterPools)) break
      const currentPool = minBy(
        currentFilterPools.map(
          ({
            pool_id,
            pool_maximum_interest_rate,
            pool_maximum_days,
            loan_time_concession_flexibility,
            pool_maximum_percentage,
            loan_ratio_preferential_flexibility,
            owner_address,
          }) => {
            const lp_pool_apr =
              pool_maximum_interest_rate -
              (TENORS.indexOf(pool_maximum_days) - index) *
                loan_time_concession_flexibility -
              // percentage 与最大贷款比例的 差
              // 4000 6000 => 1
              ((pool_maximum_percentage - loanPercentage) / 1000) *
                loan_ratio_preferential_flexibility
            return {
              pool_id,
              pool_apr_with_spread: lp_pool_apr * (1 + (interestSpread || 0)),
              lp_pool_apr,
              pool_days: item,
              lp_address: owner_address,
            }
          },
        ),
        (i) => i.pool_apr_with_spread,
      )
      if (!currentPool) break
      currentPools.push(currentPool)
    }
    setSelectPool(currentPools?.length > 1 ? currentPools[1] : currentPools[0])

    return currentPools
  }, [
    latestBalanceMap,
    loanPercentage,
    loanWeiAmount,
    originPoolList,
    interestSpread,
    fetchSpreadLoading,
  ])

  // number of installments
  const [installmentOptions, setInstallmentOptions] = useState<(1 | 2 | 3)[]>()
  const [installmentValue, setInstallmentValue] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (isEmpty(selectPool)) {
      setInstallmentOptions([])
      return
    }
    const { pool_days } = selectPool
    if (pool_days === LOAN_DAYS_ENUM.Loan7Days) {
      setInstallmentOptions([1])
      setInstallmentValue(1)
      return
    }
    setInstallmentValue(2)
    if (pool_days === LOAN_DAYS_ENUM.Loan14Days) {
      setInstallmentOptions([1, 2])
      return
    }
    setInstallmentOptions([1, 2, 3])
  }, [selectPool])

  const getPlanPer = useCallback(
    (value: 1 | 2 | 3) => {
      if (!loanWeiAmount || isEmpty(selectPool)) {
        return BigNumber(0)
      }
      const { pool_days, pool_apr_with_spread } = selectPool
      const loanEthAmount = Number(wei2Eth(loanWeiAmount))
      const apr = pool_apr_with_spread / 10000
      return amortizationCalByDays(loanEthAmount, apr, pool_days, value)
    },
    [selectPool, loanWeiAmount],
  )

  const [transferFromLoading, setTransferFromLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const { runAsync: generateLoanOrder, loading: loanOrderGenerateLoading } =
    useRequest(apiPostLoanOrder, {
      manual: true,
    })

  const [flag, setFlag] = useState(true)
  const handleClickPay = useCallback(async () => {
    interceptFn(async () => {
      if (!selectPool || isEmpty(selectPool)) {
        return
      }
      const xBankContract = createXBankContract()
      const { pool_days, pool_id, lp_address, lp_pool_apr } = selectPool
      let transferBlock

      try {
        setTransferFromLoading(true)
        transferBlock = await xBankContract.methods
          .transferFrom(pool_id, loanWeiAmount.toNumber().toString())
          .send({
            from: currentAccount,
            value: commodityWeiPrice.minus(loanWeiAmount).toNumber().toString(),
            gas: 300000,
            // gasPrice:''
          })
        setTransferFromLoading(false)
      } catch (error: any) {
        toastError(error)
        setTransferFromLoading(false)
        return
      }
      try {
        const postParams: LoanOrderDataType = {
          pool_id: pool_id.toString(),
          borrower_address: currentAccount,
          commodity_price: `${commodityWeiPrice.toNumber()}`,
          oracle_floor_price: `${commodityWeiPrice.toNumber()}`,
          load_principal_amount: downPaymentWei.toNumber().toString(),
          nft_collateral_id: `${detail?.asset?.tokenID}`,
          repay_times: installmentValue,
          total_repayment: loanWeiAmount.toNumber().toString(),
          loan_duration: pool_days * 24 * 60 * 60,
          loan_interest_rate: lp_pool_apr,
        }
        await generateLoanOrder({
          ...postParams,
        })
      } catch {
        //
      }

      setSubscribeLoading(true)
      setLoanStep('loading')
      // 监听 loan 是否生成
      xBankContract.events
        .LoanCreated({
          filter: {
            lender: lp_address,
            borrower: currentAccount,
          },
          fromBlock: transferBlock?.BlockNumber || 'latest',
        })
        .on(
          'data',
          flag
            ? debounce((event) => {
                console.log(event, 'on data') // same results as the optional callback above
                setFlag(false)
                setLoanStep('success')
                setSubscribeLoading(false)
              }, 10000)
            : () => console.log(flag, 'flag false '),
        )
      // 如果一直监听不到
      timer.current = setTimeout(() => {
        toast({
          status: 'info',
          title: 'The loan is being generated, please wait and refresh later',
        })
        navigate('/xlending/buy-nfts/loans')
      }, 2 * 60 * 1000)
    })
  }, [
    currentAccount,
    downPaymentWei,
    selectPool,
    generateLoanOrder,
    detail,
    installmentValue,
    loanWeiAmount,
    toastError,
    navigate,
    commodityWeiPrice,
    interceptFn,
    flag,
    toast,
  ])

  const [usdPrice, setUsdPrice] = useState<BigNumber>()

  // 获取 eth => USD 汇率
  useRequest(apiGetXCurrency, {
    onSuccess: (data) => {
      if (!data || isEmpty(data)) return
      const { resources } = data

      const res = resources.find((item) => {
        return item.resource.fields.name === 'USD/ETH'
      })?.resource.fields.price
      if (!res) return
      setUsdPrice(BigNumber(1).dividedBy(Number(res)))
    },
    debounceWait: 100,
    ready: false,
    // refreshDeps: [commodityWeiPrice],
  })

  const clickLoading = useMemo(
    () => transferFromLoading || subscribeLoading || loanOrderGenerateLoading,
    [transferFromLoading, subscribeLoading, loanOrderGenerateLoading],
  )

  if (!state || isEmpty(state) || (isEmpty(detail) && !assetFetchLoading))
    return (
      <NotFound title='Asset not found' backTo='/xlending/buy-nfts/market' />
    )
  if (!!loanStep) {
    return (
      <Container px={0}>
        <H5SecondaryHeader />
        <Flex
          justify={{
            md: 'space-between',
            sm: 'center',
            xs: 'center',
          }}
          mt={{
            md: '44px',
            sm: '32px',
            xs: '32px',
          }}
        >
          <Button
            leftIcon={<SvgComponent svgId='icon-arrow-left' />}
            onClick={() => {
              if (loanStep === 'loading') {
                setLoanStep(undefined)
                return
              }
              if (loanStep === 'success') {
                setLoanStep(undefined)
                navigate('/xlending/buy-nfts/loans')
                return
              }
              if (loanStep === 'delay') {
                setLoanStep(undefined)
              }
            }}
            display={{
              md: 'flex',
              sm: 'none',
              xs: 'none',
            }}
          >
            Back
          </Button>
          <Flex
            mr={{
              xl: '290px',
              lg: '200px',
              md: '100px',
              sm: 0,
              xs: 0,
            }}
            flexDir='column'
            justifyContent={'center'}
            alignItems='center'
          >
            <Flex
              position={'relative'}
              mb={{ md: '40px', sm: '28px', xs: '28px' }}
              w={{ md: '285px', sm: '244px', xs: '244px' }}
              alignItems={'center'}
              justify='center'
            >
              <NftMedia
                data={{
                  imagePreviewUrl: detail?.asset.imagePreviewUrl,
                  animationUrl: detail?.asset.animationUrl,
                }}
                borderRadius={16}
                boxSize={{
                  md: '240px',
                  sm: '160px',
                  xs: '160px',
                }}
                fit='contain'
              />
              {loanStep === 'success' && (
                <Flex
                  pos='absolute'
                  bottom={{
                    md: '-20px',
                    sm: '-10px',
                    xs: '-10px',
                  }}
                  right={{ md: '6px', sm: '30px', xs: '30px' }}
                  bg='white'
                  borderRadius={'100%'}
                  boxSize={{
                    md: '64px',
                    sm: '40px',
                    xs: '40px',
                  }}
                  zIndex={10}
                >
                  <Lottie animationData={uiSuccessJson} loop={false} />
                </Flex>
              )}
            </Flex>
            {loanStep === 'loading' && (
              <Spinner
                color='blue.1'
                boxSize={'52px'}
                thickness='3px'
                speed='0.6s'
              />
            )}
            {loanStep === 'success' && (
              <Box textAlign={'center'}>
                <Text
                  fontWeight={'700'}
                  fontSize={{
                    md: '28px',
                    sm: '24px',
                    xs: '24px',
                  }}
                >
                  Purchase completed
                </Text>
                <Text
                  color={'gray.3'}
                  fontSize={{
                    md: '16px',
                    xs: '14px',
                    sm: '14px',
                  }}
                  mt={{
                    md: '16px',
                    sm: '8px',
                    xs: '8px',
                  }}
                  fontWeight={'500'}
                >
                  Loan has been initialized.
                </Text>
              </Box>
            )}
          </Flex>
        </Flex>
      </Container>
    )
  }

  return (
    <NFTDetailContainer>
      {/* 手机端 */}
      <H5SecondaryHeader title='Buy NFTs' mb='20px' />
      {assetFetchLoading ? (
        <Skeleton
          h='120px'
          borderRadius={16}
          w='100%'
          display={{
            md: 'none',
            sm: 'flex',
            xs: 'flex',
          }}
          mb='20px'
        />
      ) : (
        <Flex
          gap={'12px'}
          display={{
            md: 'none',
            sm: 'flex',
            xs: 'flex',
          }}
        >
          <NftMedia
            data={{
              imagePreviewUrl: detail?.asset.imagePreviewUrl,
              animationUrl: detail?.asset.animationUrl,
            }}
            borderRadius={8}
            boxSize={'64px'}
            fit='contain'
          />
          <Flex flexDir={'column'} justify='center'>
            <Text fontSize={'16px'} fontWeight='700'>
              {detail?.asset?.name || `#${detail?.asset?.tokenID || ''}`}
            </Text>
            <Text fontSize={'12px'} fontWeight='500'>
              {wei2Eth(commodityWeiPrice)}&nbsp;
              {UNIT}
            </Text>
          </Flex>
        </Flex>
      )}
      {/* pc 端 */}
      {assetFetchLoading ? (
        <Skeleton
          height={700}
          borderRadius={16}
          w={{
            xl: '600px',
            lg: '450px',
            md: '80%',
          }}
          display={{
            md: 'block',
            sm: 'none',
            xs: 'none',
          }}
          mt='32px'
        />
      ) : (
        <Flex
          justify={{
            xl: 'flex-start',
            lg: 'center',
            md: 'center',
          }}
          alignItems={{
            xl: 'flex-start',
            lg: 'center',
            md: 'center',
          }}
          w={{
            xl: '600px',
            lg: '450px',
            md: '100%',
          }}
          mt={'32px'}
          flexDirection={'column'}
          display={{
            md: 'flex',
            sm: 'none',
            xs: 'none',
          }}
        >
          <NftMedia
            data={{
              imagePreviewUrl: detail?.asset.imagePreviewUrl,
              animationUrl: detail?.asset.animationUrl,
            }}
            borderRadius={20}
            boxSize={{
              xl: '600px',
              lg: '380px',
              md: '100%',
            }}
            fit='contain'
          />
          <ImageToolBar data={detail} />
          <BelongToCollection
            data={{
              ...collection,
            }}
          />
        </Flex>
      )}
      <Box
        w={{
          lg: '600px',
          md: '100%',
          sm: '100%',
          xs: '100%',
        }}
        mt={{ md: '32px' }}
      >
        {/* 价格 名称 */}
        <DetailComponent
          data={{
            name1: collection?.name,
            name2: detail?.asset?.name || `#${detail?.asset?.tokenID}`,
            price: wei2Eth(commodityWeiPrice),
            usdPrice: !!usdPrice
              ? formatFloat(
                  usdPrice?.multipliedBy(Number(wei2Eth(commodityWeiPrice))),
                )
              : '',
            verified: collection?.safelistRequestStatus === 'verified',
          }}
          // onReFresh={}
          loading={assetFetchLoading}
          onRefreshPrice={fetchOrderPrice}
          refreshLoading={ordersPriceFetchLoading}
          display={{
            md: 'block',
            sm: 'none',
            xs: 'none',
          }}
        />

        {/* Down payment */}
        <LabelComponent
          label='Down Payment'
          loading={assetFetchLoading || ordersPriceFetchLoading}
        >
          <Flex
            p={'16px'}
            pr={'24px'}
            border={`1px solid var(--chakra-colors-gray-1)`}
            borderRadius={16}
            alignItems='center'
            gap={'16px'}
          >
            {downPaymentWei && (
              <Flex
                py={'12px'}
                bg='gray.5'
                borderRadius={8}
                gap={'4px'}
                alignItems='center'
                justify={'center'}
                minW='96px'
                px={'8px'}
              >
                <SvgComponent svgId='icon-eth' svgSize='20px' />
                <Text
                  fontSize={{
                    md: '20px',
                    xs: '12px',
                    sm: '12px',
                  }}
                >
                  {wei2Eth(downPaymentWei)}
                </Text>
              </Flex>
            )}

            <Divider orientation='vertical' h={'24px'} />
            <Slider
              min={COLLATERALS[0]}
              max={COLLATERALS[COLLATERALS.length - 1]}
              step={1000}
              onChange={(target) => {
                setPercentage(target)
              }}
              isDisabled={balanceFetchLoading || clickLoading}
              value={percentage}
              w={{
                xl: '436px',
                lg: '300px',
                md: '436px',
                sm: '230px',
                xs: '230px',
              }}
            >
              {COLLATERALS.map((item) => (
                <SliderMark value={item} fontSize='14px' key={item} zIndex={1}>
                  <Box
                    w={'8px'}
                    h={'8px'}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor='white'
                    mt={-1}
                    bg={percentage > item ? 'blue.1' : 'gray.1'}
                  />
                </SliderMark>
              ))}
              <SliderTrack bg='gray.1'>
                <SliderFilledTrack
                  bgGradient={`linear-gradient(90deg,#fff,var(--chakra-colors-blue-1))`}
                />
              </SliderTrack>
              <SliderThumb
                boxSize={'24px'}
                borderWidth={5}
                borderColor={'blue.1'}
                _focus={{
                  boxShadow: 'none',
                }}
              />
              <SlideFade />
            </Slider>
          </Flex>

          <Flex justify={'center'} gap={'4px'} alignItems='center' mt={'24px'}>
            <Text fontSize={'12px'} fontWeight='500'>
              Loan amount
            </Text>
            <SvgComponent svgId='icon-eth' svgSize='12px' />
            <Text fontSize={'14px'} fontWeight='500'>
              {wei2Eth(loanWeiAmount)}
            </Text>
          </Flex>
        </LabelComponent>

        {/* Loan Period */}
        <LabelComponent
          label='Loan Period'
          isEmpty={isEmpty(pools)}
          loading={
            balanceFetchLoading ||
            assetFetchLoading ||
            ordersPriceFetchLoading ||
            fetchSpreadLoading
          }
        >
          <Flex gap={'8px'} flexWrap='wrap'>
            {pools.map(
              ({
                pool_id,
                pool_apr_with_spread,
                pool_days,
                lp_address,
                lp_pool_apr,
              }) => {
                return (
                  <Flex
                    key={`${pool_id}-${pool_apr_with_spread}-${pool_days}`}
                    w={{
                      md: `${100 / pools.length}%`,
                      sm: '100%',
                      xs: '100%',
                    }}
                    minW={{
                      md: '112px',
                      sm: '100%',
                      xs: '100%',
                    }}
                    maxW={{
                      md: '112px',
                      sm: '100%',
                      xs: '100%',
                    }}
                  >
                    <RadioCard
                      isDisabled={clickLoading}
                      onClick={() =>
                        setSelectPool({
                          pool_apr_with_spread,
                          pool_id,
                          pool_days,
                          lp_address,
                          lp_pool_apr,
                        })
                      }
                      isActive={selectPool?.pool_days === pool_days}
                    >
                      <Text fontWeight={700}>{pool_days} Days</Text>
                      <Text fontWeight={500} fontSize='12px' color='blue.1'>
                        <Highlight query={'APR'} styles={{ color: `black.1` }}>
                          {`${
                            pool_apr_with_spread &&
                            floor(pool_apr_with_spread / 100, 4)
                          } % APR`}
                        </Highlight>
                      </Text>
                    </RadioCard>
                  </Flex>
                )
              },
            )}
          </Flex>
        </LabelComponent>

        {/* Number of installments */}
        <LabelComponent
          label='Number of installments'
          isEmpty={isEmpty(selectPool)}
          loading={
            balanceFetchLoading ||
            assetFetchLoading ||
            ordersPriceFetchLoading ||
            fetchSpreadLoading
          }
        >
          <Flex gap={'8px'} flexWrap='wrap'>
            {installmentOptions?.map((value) => {
              return (
                <Flex
                  key={value}
                  w={{
                    md: `${100 / installmentOptions.length}%`,
                    sm: '100%',
                    xs: '100%',
                  }}
                  maxW={{
                    md: '206px',
                    sm: '100%',
                    xs: '100%',
                  }}
                >
                  <RadioCard
                    isDisabled={clickLoading}
                    onClick={() => setInstallmentValue(value)}
                    isActive={value === installmentValue}
                  >
                    <Text fontWeight={700}>Pay in {value} installments</Text>
                    <Text fontWeight={500} fontSize='12px'>
                      {formatFloat(getPlanPer(value))}
                      &nbsp;
                      {UNIT}/per
                    </Text>
                  </RadioCard>
                </Flex>
              )
            })}
          </Flex>
        </LabelComponent>

        {/* Repayment Plan */}
        {!commodityWeiPrice.eq(0) && !loanWeiAmount.eq(0) && (
          <LabelComponent
            label='Repayment Plan'
            isEmpty={isEmpty(selectPool)}
            loading={
              balanceFetchLoading ||
              assetFetchLoading ||
              ordersPriceFetchLoading ||
              fetchSpreadLoading
            }
          >
            <VStack
              bg='gray.5'
              py='24px'
              px='16px'
              borderRadius={12}
              spacing='16px'
            >
              <PlanItem
                value={wei2Eth(downPaymentWei)}
                label='Down payment now'
              />

              {range(installmentValue).map((value, index) => (
                <PlanItem
                  value={formatFloat(getPlanPer(installmentValue))}
                  label={dayjs()
                    .add(
                      ((selectPool?.pool_days || 0) / installmentValue) *
                        (index + 1),
                      'days',
                    )
                    .format('YYYY/MM/DD')}
                  key={value}
                />
              ))}
            </VStack>
          </LabelComponent>
        )}

        {/* Trading Information */}
        <LabelComponent
          label='Deal Details'
          borderBottom={'none'}
          isEmpty={isEmpty(pools)}
          loading={
            balanceFetchLoading ||
            assetFetchLoading ||
            ordersPriceFetchLoading ||
            fetchSpreadLoading
          }
        >
          {!loanWeiAmount.eq(0) && !commodityWeiPrice.eq(0) && (
            <Flex
              border={`1px solid var(--chakra-colors-gray-1)`}
              py='24px'
              px='16px'
              borderRadius={12}
              gap='16px'
              direction='column'
            >
              {/* Commodity price */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>NFT price</Text>
                <Text color='gray.3'>
                  {wei2Eth(commodityWeiPrice)}
                  {UNIT}
                </Text>
              </Flex>
              {/* Down payment */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Down payment</Text>
                <Text color='gray.3'>
                  {wei2Eth(downPaymentWei)}
                  {UNIT}
                </Text>
              </Flex>
              {/* Loan amount */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Loan amount</Text>
                <Text color='gray.3'>
                  {wei2Eth(loanWeiAmount)}
                  {UNIT}
                </Text>
              </Flex>
              {/* Interest fee */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Interest fee</Text>
                <Text color='gray.3'>
                  {getPlanPer(installmentValue)
                    .multipliedBy(installmentValue)
                    .minus(Number(wei2Eth(loanWeiAmount)))
                    .toFormat(FORMAT_NUMBER)}
                  {UNIT}
                </Text>
              </Flex>
              <Divider color='gray.2' />
              {/* Total repayment */}
              <Flex justify={'space-between'}>
                <Text fontSize='16px' fontWeight='bold'>
                  Total repayment
                </Text>
                <Text fontSize='16px' fontWeight='bold'>
                  {formatFloat(
                    getPlanPer(installmentValue)
                      .multipliedBy(installmentValue)
                      .minus(Number(wei2Eth(loanWeiAmount)))
                      .plus(Number(wei2Eth(commodityWeiPrice))),
                  )}
                  {UNIT}
                </Text>
              </Flex>
              {/* Floor breakeven */}
              <Flex justify={'space-between'}>
                <Text fontSize='16px' fontWeight='bold'>
                  Floor breakeven
                </Text>
                <Text fontSize='16px' fontWeight='bold'>
                  {/*  */}
                  {formatFloat(
                    getPlanPer(installmentValue)
                      .multipliedBy(installmentValue)
                      .minus(Number(wei2Eth(loanWeiAmount)))
                      .plus(Number(wei2Eth(commodityWeiPrice)))
                      .multipliedBy(1.025),
                  )}
                  {UNIT}
                </Text>
              </Flex>
            </Flex>
          )}
        </LabelComponent>

        {/* 按钮 */}
        <Flex
          px={{
            md: 0,
            sm: '32px',
            xs: '32px',
          }}
          mb='40px'
        >
          <Button
            variant={'primary'}
            display='flex'
            h='60px'
            w='100%'
            onClick={handleClickPay}
            isDisabled={
              loanWeiAmount.eq(0) ||
              balanceFetchLoading ||
              isEmpty(selectPool) ||
              assetFetchLoading ||
              ordersPriceFetchLoading ||
              fetchSpreadLoading
            }
            isLoading={clickLoading}
            loadingText='The loan is being generated, please wait'
          >
            <Text fontWeight={'400'}>Pay now with</Text>&nbsp;
            {wei2Eth(downPaymentWei)} {UNIT}
          </Button>
        </Flex>
      </Box>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </NFTDetailContainer>
  )
}

export default NftAssetDetail

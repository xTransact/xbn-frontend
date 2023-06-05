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
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { min } from 'lodash-es'
import ceil from 'lodash-es/ceil'
import isEmpty from 'lodash-es/isEmpty'
import maxBy from 'lodash-es/maxBy'
import minBy from 'lodash-es/minBy'
import range from 'lodash-es/range'
import round from 'lodash-es/round'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type FunctionComponent,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiGetAssetPrice, apiGetXCurrency, apiPostLoanOrder } from '@/api'
import {
  ConnectWalletModal,
  NotFound,
  SvgComponent,
  NftMedia,
  H5SecondaryHeader,
  MiddleStatus,
} from '@/components'
import { MarketType } from '@/components/nft-origin/NftOrigin'
import { FORMAT_NUMBER, UNIT } from '@/constants'
import { TENOR_VALUES } from '@/constants/interest'
import {
  useWallet,
  useAssetQuery,
  useBatchWethBalance,
  useCatchContractError,
  type NftCollection,
} from '@/hooks'
import { amortizationCalByDays } from '@/utils/calculation'
import { createWeb3Provider, createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import BelongToCollection from './components/BelongToCollection'
import DetailComponent from './components/DetailComponent'
import EmptyPools from './components/EmptyPools'
import ImageToolBar from './components/ImageToolBar'
import LabelComponent from './components/LabelComponent'
import PlanItem from './components/PlanItem'
import RadioCard from './components/RadioCard'

const COLLATERAL = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000]

export enum LOAN_DAYS_ENUM {
  LOAN1Days = 1,
  LOAN3Days = 3,
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

const converseToString: (arg?: number) => string = (arg) => {
  return arg === undefined ? '--' : arg.toString()
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
  const [platform, setPlatform] = useState<MarketType | undefined>()
  const {
    state,
  }: {
    state: {
      collection: NftCollection
      poolsList: PoolsListItemType[]
    }
  } = useLocation()
  const assetVariable = useParams() as {
    contractAddress: string
    tokenID: string
  }

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
    const xBankContract = createXBankContract()
    const res = await xBankContract.methods.getProtocolIRMultiplier().call()
    return res / 10000 || 0
  }

  const { loading: fetchSpreadLoading, data: interestSpread } =
    useRequest(fetchInterestSpread)

  const [commodityWeiPrice, setCommodityWeiPrice] = useState(BigNumber(0))

  const { collection, poolsList: originPoolList } = state || {}
  const { data: detail, loading: assetFetchLoading } = useAssetQuery({
    variables: {
      assetContractAddress: assetVariable?.contractAddress,
      assetTokenId: assetVariable?.tokenID,
    },
  })

  const { loading: ordersPriceFetchLoading, refresh: refreshOrderPrice } =
    useRequest(apiGetAssetPrice, {
      ready: !!assetVariable,
      defaultParams: [
        {
          contract_address: assetVariable.contractAddress,
          token_id: assetVariable.tokenID,
        },
      ],
      onSuccess({ data }) {
        if (!data || !data?.length) {
          setCommodityWeiPrice(BigNumber(0))
          return
        }
        const formatData = data.map((item) => ({
          marketplace: item.marketplace,
          amount: item.opensea_price?.amount || item.blur_price?.amount,
        }))
        const minMarketPrice = minBy(formatData, (item) => item?.amount)

        if (!minMarketPrice) {
          setCommodityWeiPrice(BigNumber(0))
          return
        }
        const weiPrice = eth2Wei(Number(minMarketPrice.amount))
        if (!weiPrice) {
          setCommodityWeiPrice(BigNumber(0))
          return
        }
        setCommodityWeiPrice(BigNumber(weiPrice))
        setPlatform(
          minMarketPrice.marketplace === 'OPENSEA'
            ? MarketType.OPENSEA
            : minMarketPrice.marketplace === 'BLUR'
            ? MarketType.BLUR
            : undefined,
        )
      },
      onError() {
        setCommodityWeiPrice(BigNumber(0))
      },
      debounceWait: 100,
    })

  const [percentage, setPercentage] = useState(COLLATERAL[4])
  const loanPercentage = useMemo(() => 10000 - percentage, [percentage])

  const handleSetDefaultPercentage = useCallback(() => {
    if (isEmpty(originPoolList) || !originPoolList) {
      setPercentage(COLLATERAL[4])
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

  useEffect(() => {
    handleSetDefaultPercentage()
  }, [handleSetDefaultPercentage])

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
        const latestWeth = BigNumber(latestBalanceMap?.get(item.owner_address))
        if (!latestWeth) {
          return false
        }
        // 此 pool 最新可用资产
        const poolLatestCanUseAmount = BigNumber(item.pool_amount).minus(
          item.pool_used_amount,
        )
        // 单笔最大贷款金额
        const maxSingleLoanAmount = BigNumber(item.maximum_loan_amount)
        // 三者取较小值用于比较
        const forCompareWei = min([
          poolLatestCanUseAmount.toNumber(),
          latestWeth.toNumber(),
          maxSingleLoanAmount.toNumber(),
        ])
        return (
          item.pool_maximum_percentage >= loanPercentage &&
          loanWeiAmount.lte(forCompareWei as number)
          //  存在一些脏数据
          // item.loan_ratio_preferential_flexibility <= 200 &&
          // item.loan_ratio_preferential_flexibility <= 200
        )
      },
    )
    console.log(
      'pool 筛选逻辑第 1 & 2 条的结果',
      filterPercentageAndLatestBalancePools,
    )

    const currentPools: PoolType[] = []
    for (let index = 0; index < TENOR_VALUES.length; index++) {
      // 1 3 7 14 30 60 90
      const item = TENOR_VALUES[index]
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
            const loanBottomPower = loan_time_concession_flexibility / 10000
            const bottomDistance =
              TENOR_VALUES.indexOf(pool_maximum_days) - index

            const loanRightPower = loan_ratio_preferential_flexibility / 10000
            const rightDistance =
              (pool_maximum_percentage - loanPercentage) / 1000
            const lp_pool_apr =
              pool_maximum_interest_rate *
              Math.pow(loanBottomPower, bottomDistance) *
              Math.pow(loanRightPower, rightDistance)

            // const lp_pool_apr =
            //   pool_maximum_interest_rate -
            //   (TENOR_VALUES.indexOf(pool_maximum_days) - index) *
            //     loan_time_concession_flexibility -
            //   // percentage 与最大贷款比例的 差
            //   // 4000 6000 => 1
            //   ((pool_maximum_percentage - loanPercentage) / 1000) *
            //     loan_ratio_preferential_flexibility
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

  console.log('当前选中的 pool:', selectPool)

  // number of installments
  const [installmentOptions, setInstallmentOptions] = useState<(1 | 2 | 3)[]>()
  const [installmentValue, setInstallmentValue] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (isEmpty(selectPool)) {
      setInstallmentOptions([])
      return
    }
    const { pool_days } = selectPool
    if (
      [
        LOAN_DAYS_ENUM.Loan7Days,
        LOAN_DAYS_ENUM.LOAN3Days,
        LOAN_DAYS_ENUM.LOAN1Days,
      ].includes(pool_days)
    ) {
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
      const loanEthAmount = wei2Eth(loanWeiAmount)
      if (!loanEthAmount) return BigNumber(0)
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
        const postParams: LoanOrderDataType = {
          pool_id: pool_id.toString(),
          borrower_address: currentAccount,
          commodity_price: `${commodityWeiPrice.toNumber()}`,
          oracle_floor_price: `${commodityWeiPrice.toNumber()}`,
          down_payment: downPaymentWei.toNumber().toString(),
          nft_collateral_id: `${detail?.asset?.tokenID}`,
          number_of_installments: installmentValue,
          loan_amount: loanWeiAmount.toNumber().toString(),
          loan_duration: pool_days * 24 * 60 * 60,
          loan_interest_rate: Number(lp_pool_apr?.toFixed()),
        }
        await generateLoanOrder({
          ...postParams,
        })

        setSubscribeLoading(true)
        setLoanStep('loading')
        // 监听 loan 是否生成
        xBankContract.events
          .LoanCreated(
            {
              filter: {
                lender: lp_address,
                borrower: currentAccount,
              },
              fromBlock: transferBlock?.BlockNumber || 'latest',
            },
            (error: any, event: any) => {
              console.log(event, error, 'aaaaa')
            },
          )
          .on('data', function (event: any) {
            console.log(event, 'on data') // same results as the optional callback above
            setLoanStep('success')
            setSubscribeLoading(false)
          })
          .on('changed', console.log)
          .on('error', console.error)

        // 如果一直监听不到
        timer.current = setTimeout(() => {
          toast({
            status: 'info',
            title: 'The loan is being generated, please wait and refresh later',
          })
          navigate('/xlending/buy-nfts/loans')
        }, 2 * 60 * 1000)
      } catch (error: any) {
        toastError(error)
        setTransferFromLoading(false)
        setSubscribeLoading(false)
        setLoanStep(undefined)
        return
      }
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
      <MiddleStatus
        imagePreviewUrl={detail?.asset?.imagePreviewUrl}
        animationUrl={detail?.asset?.animationUrl}
        onLoadingBack={() => {
          setLoanStep(undefined)
          return
        }}
        onSuccessBack={() => {
          setLoanStep(undefined)
          navigate('/xlending/buy-nfts/loans')
          return
        }}
        successTitle='Purchase completed'
        successDescription='Loan has been initialized.'
        step={loanStep}
      />
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
              {converseToString(wei2Eth(commodityWeiPrice))}&nbsp;
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
            xl: '500px',
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
            xl: '500px',
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
              xl: '500px',
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
            price: wei2Eth(commodityWeiPrice)?.toString(),
            usdPrice: !!usdPrice
              ? formatFloat(
                  usdPrice?.multipliedBy(wei2Eth(commodityWeiPrice) || 0),
                )
              : '',
            verified: collection?.safelistRequestStatus === 'verified',
            platform,
          }}
          // onReFresh={}
          loading={assetFetchLoading}
          onRefreshPrice={refreshOrderPrice}
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
                  {converseToString(wei2Eth(downPaymentWei))}
                </Text>
              </Flex>
            )}

            <Divider orientation='vertical' h={'24px'} />
            <Slider
              min={COLLATERAL[0]}
              max={COLLATERAL[COLLATERAL.length - 1]}
              step={1000}
              onChange={(target) => {
                setPercentage(target)
              }}
              isDisabled={balanceFetchLoading || clickLoading}
              value={percentage}
              w={{
                xl: '450px',
                lg: '350px',
                md: '436px',
                sm: '230px',
                xs: '230px',
              }}
            >
              {COLLATERAL.map((item) => (
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
              {converseToString(wei2Eth(loanWeiAmount))}
            </Text>
          </Flex>
        </LabelComponent>

        {/* 当没有匹配到 pool */}
        <EmptyPools
          isShow={
            isEmpty(selectPool) &&
            !assetFetchLoading &&
            !ordersPriceFetchLoading &&
            !balanceFetchLoading
          }
          onReset={handleSetDefaultPercentage}
        />
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
                    minW={{
                      xl: '90px',
                      lg: '80px',
                      md: '80px',
                      sm: '100%',
                      xs: '100%',
                    }}
                    maxW={{
                      xl: '112px',
                      lg: '95px',
                      md: '80px',
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
                      p={{
                        xl: '16px',
                        lg: '10px',
                        md: '8px',
                        sm: '8px',
                        xs: '8px',
                      }}
                      isActive={selectPool?.pool_days === pool_days}
                    >
                      <Text fontWeight={700}>{pool_days} Days</Text>
                      <Text fontWeight={500} fontSize='12px' color='blue.1'>
                        <Highlight query={'APR'} styles={{ color: `black.1` }}>
                          {`${
                            pool_apr_with_spread &&
                            round(pool_apr_with_spread / 100, 2)
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
                    md: `${100 / installmentOptions.length - 2}%`,
                    sm: '100%',
                    xs: '100%',
                  }}
                  maxW={{
                    md: '200px',
                    sm: '100%',
                    xs: '100%',
                  }}
                >
                  <RadioCard
                    p='10px'
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
                  {converseToString(wei2Eth(commodityWeiPrice))}
                  {UNIT}
                </Text>
              </Flex>
              {/* Down payment */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Down payment</Text>
                <Text color='gray.3'>
                  {converseToString(wei2Eth(downPaymentWei))}
                  {UNIT}
                </Text>
              </Flex>
              {/* Loan amount */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Loan amount</Text>
                <Text color='gray.3'>
                  {converseToString(wei2Eth(loanWeiAmount))}
                  {UNIT}
                </Text>
              </Flex>
              {/* Interest fee */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Interest fee</Text>
                <Text color='gray.3'>
                  {getPlanPer(installmentValue)
                    .multipliedBy(installmentValue)
                    .minus(wei2Eth(loanWeiAmount) || 0)
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
                      .minus(wei2Eth(loanWeiAmount) || 0)
                      .plus(wei2Eth(commodityWeiPrice) || 0),
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
                      .minus(wei2Eth(loanWeiAmount) || 0)
                      .plus(wei2Eth(commodityWeiPrice) || 0)
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
          hidden={isEmpty(selectPool)}
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
            {converseToString(wei2Eth(downPaymentWei))}
            {UNIT}
          </Button>
        </Flex>
      </Box>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </NFTDetailContainer>
  )
}

export default NftAssetDetail

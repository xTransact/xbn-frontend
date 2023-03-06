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
  HStack,
  Highlight,
  VStack,
  Divider,
  useToast,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import ceil from 'lodash-es/ceil'
import floor from 'lodash-es/floor'
import isEmpty from 'lodash-es/isEmpty'
import maxBy from 'lodash-es/maxBy'
import minBy from 'lodash-es/minBy'
import range from 'lodash-es/range'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type {
  LoanOrderDataType,
  AssetListItemType,
  CollectionListItemType,
  PoolsListItemType,
} from '@/api'
import { apiGetXCurrency, apiPostLoanOrder } from '@/api'
import {
  ConnectWalletModal,
  NotFound,
  SvgComponent,
  NftMedia,
} from '@/components'
import { COLLATERALS, FORMAT_NUMBER, TENORS, UNIT } from '@/constants'
import { useWallet } from '@/hooks'
import { amortizationCalByDays } from '@/utils/calculation'
import { createWethContract, createXBankContract } from '@/utils/createContract'
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
  pool_apr: number
  pool_days: LOAN_DAYS_ENUM
}

const NftAssetDetail = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onClose, currentAccount, interceptFn } = useWallet()
  const {
    state,
  }: {
    state: {
      collection: CollectionListItemType
      poolsList: PoolsListItemType[]
      asset: AssetListItemType
    }
  } = useLocation()

  const { collection, poolsList: originPoolList, asset: detail } = state || {}

  // 商品价格
  const commodityWeiPrice = useMemo(() => {
    if (!detail?.order_price) {
      return BigNumber(0)
    }
    return BigNumber(Number(detail?.order_price))
  }, [detail])

  // 获取每个 pool 的 owner_address 的最新 weth 资产
  const batchFetchOwenAddressLatestBalance = useCallback(
    async ({ data }: { data: PoolsListItemType[] }) => {
      const map = new Map()

      if (isEmpty(data)) return map
      const uniqAddress = [...new Set([...data?.map((i) => i.owner_address)])]

      const wethContract = createWethContract()

      const taskPromises = uniqAddress.map(async (item: string) => {
        return wethContract.methods
          .balanceOf(item)
          .call()
          .then((res: string) => {
            map.set(item, BigNumber(Number(res)))
          })
          .catch((error: Error) => {
            console.log(
              '🚀 ~ file: NftAssetDetail.tsx:150 ~ .then ~ error:',
              error,
            )
          })
      })
      await Promise.all(taskPromises).catch((error) => {
        console.log('🚀 ~ file: NftAssetDetail.tsx:108 ~ error:', error)
      })
      return map
    },
    [],
  )

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

  const loanWeiAmount = useMemo(() => {
    return commodityWeiPrice.minus(downPaymentWei)
  }, [commodityWeiPrice, downPaymentWei])

  const { loading: fetching, data: latestBalanceMap } = useRequest(
    () =>
      batchFetchOwenAddressLatestBalance({
        data: originPoolList,
      }),
    {
      refreshDeps: [originPoolList],
      debounceWait: 100,
    },
  )
  const [selectPool, setSelectPool] = useState<PoolType>()

  const pools = useMemo(() => {
    if (
      !originPoolList ||
      isEmpty(originPoolList) ||
      latestBalanceMap?.size === 0
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
      'pool 筛选逻辑第1 & 2条的结果',
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
          }) => {
            return {
              pool_id,
              pool_apr:
                pool_maximum_interest_rate -
                (TENORS.indexOf(pool_maximum_days) - index) *
                  loan_time_concession_flexibility -
                // percentage 与最大贷款比例的 差
                // 4000 6000 => 1
                ((pool_maximum_percentage - loanPercentage) / 1000) *
                  loan_ratio_preferential_flexibility,
              pool_days: item,
            }
          },
        ),
        (i) => i.pool_apr,
      )
      if (!currentPool) break
      currentPools.push(currentPool)
    }
    setSelectPool(currentPools?.length > 1 ? currentPools[1] : currentPools[0])

    return currentPools
  }, [latestBalanceMap, loanPercentage, loanWeiAmount, originPoolList])

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
      const { pool_days, pool_apr } = selectPool
      const loanEthAmount = Number(wei2Eth(loanWeiAmount))
      const apr = pool_apr / 10000
      return amortizationCalByDays(loanEthAmount, apr, pool_days, value)
    },
    [selectPool, loanWeiAmount],
  )

  const [transferFromLoading, setTransferFromHashLoading] = useState(false)
  const { runAsync: generateLoanOrder, loading: generateLoading } = useRequest(
    apiPostLoanOrder,
    {
      manual: true,
    },
  )

  /**
   * Error: Transaction has been reverted by the EVM:
{
  "blockHash": "0xcaacc89c458dd0e0e42d0669228cf5171dbad8ee911fcf05fe607787f692b39a",
  "blockNumber": 8570811,
  "contractAddress": null,
  "cumulativeGasUsed": 5247467,
  "effectiveGasPrice": 174444924222,
  "from": "0xe5c70a775a9cbc4b217a69ea4f4efa66f7f1c8fc",
  "gasUsed": 28761,
  "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "status": false,
  "to": "0x492d7368cf6280d4bc44ca3494ebedd56df0393d",
  "transactionHash": "0x6513f3c6ab10e486afe08b4fc8569c067c8e6ea92b722475cf6f341d1928c908",
  "transactionIndex": 74,
  "type": "0x2",
  "events": {}
   */

  const handleClickPay = useCallback(async () => {
    interceptFn(async () => {
      if (!selectPool || isEmpty(selectPool)) {
        return
      }
      const { pool_apr, pool_days, pool_id } = selectPool
      const { order_price, token_id } = detail
      try {
        setTransferFromHashLoading(true)
        const xBankContract = createXBankContract()
        const transferFromHash = await xBankContract.methods
          .transferFrom(pool_id, loanWeiAmount.toNumber().toString())
          .send({
            from: currentAccount,
            value: commodityWeiPrice.minus(loanWeiAmount).toNumber().toString(),
            gas: 300000,
            // gasPrice:''
          })
        console.log(transferFromHash, '111111111')
        setTransferFromHashLoading(false)
      } catch (error: any) {
        console.log(
          '🚀 ~ file: NftAssetDetail.tsx:254 ~ handleClickPay ~ error:',
          error,
        )
        toast({
          status: 'error',
          title: error?.code,
          description: error?.message,
          duration: 5000,
        })
        setTransferFromHashLoading(false)
        return
      }
      try {
        const postParams: LoanOrderDataType = {
          pool_id: pool_id.toString(),
          borrower_address: currentAccount,
          commodity_price: order_price,
          oracle_floor_price: order_price,
          load_principal_amount: downPaymentWei.toNumber().toString(),
          nft_collateral_id: token_id,
          repay_times: installmentValue,
          total_repayment: loanWeiAmount.toNumber().toString(),
          loan_duration: pool_days * 24 * 60 * 60,
          loan_interest_rate: pool_apr,
        }
        await generateLoanOrder({
          ...postParams,
        })
        toast({
          status: 'success',
          title: 'successfully down payment',
        })
        navigate('/buy-nfts/loans')
      } catch {
        //
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
    toast,
    navigate,
    commodityWeiPrice,
    interceptFn,
  ])

  const [usdPrice, setUsdPrice] = useState<BigNumber>()

  // 获取 eth => USD 汇率
  useRequest(apiGetXCurrency, {
    onSuccess: ({ data }) => {
      if (!data || isEmpty(data)) return
      const { resources } = data
      const res = resources.find((item) => {
        return item.resource.fields.name === 'USD/ETH'
      })?.resource.fields.price
      if (!res) return
      setUsdPrice(BigNumber(1).dividedBy(Number(res)))
    },
    onError: (error) => {
      console.log(
        '🚀 ~ file: NftAssetDetail.tsx:87 ~ NftAssetDetail ~ error:',
        error,
      )
    },
    cacheKey: 'x-curr-latest',
    staleTime: 1000 * 60 * 5,
    debounceWait: 100,
  })

  if (!state || isEmpty(state))
    return <NotFound title='Asset not found' backTo='/buy-nfts/market' />

  return (
    <Flex
      justify={{
        lg: 'space-between',
        md: 'center',
      }}
      alignItems='flex-start'
      flexWrap={{ lg: 'nowrap', md: 'wrap', sm: 'wrap' }}
      gap={10}
      mx='58px'
      mt={8}
      mb={20}
    >
      {/* <Button
        onClick={() => {
          const web3 = createWeb3Provider()
          const wethContract = createWethContract()
          const batch = new web3.BatchRequest()
          const uniqAddress = [
            ...new Set(originPoolList.map((item) => item.owner_address)),
          ]
          uniqAddress.map((address) => {
            batch.add(
              wethContract.methods
                .balanceOf(address)
                .call.request(
                  { from: currentAccount },
                  (_: any, balance: string) => {
                    console.log(address, _, '', balance)
                  },
                ),
            )
          })

          batch.execute()
        }}
      >
        shshshsh
      </Button> */}
      {/* {detailLoading ? (
        <Skeleton height={700} borderRadius={16} />
      ) : ( */}
      <Flex
        justify={{
          xl: 'flex-start',
          lg: 'center',
        }}
        alignItems={{
          xl: 'flex-start',
          lg: 'center',
        }}
        w={{
          xl: '600px',
          lg: '450px',
          md: '80%',
          sm: '100%',
        }}
        flexDirection={'column'}
      >
        <NftMedia
          data={{
            ...detail,
          }}
          borderRadius={20}
          boxSize={{
            xl: '600px',
            lg: '380px',
            md: '100%',
          }}
        />
        <ImageToolBar data={{ ...detail }} />
        <BelongToCollection
          data={{
            ...collection,
          }}
        />
      </Flex>
      {/* )} */}

      <Box
        w={{
          lg: '600px',
          md: '100%',
        }}
      >
        {/* 价格 名称 */}
        <DetailComponent
          data={{
            name1: collection?.name,
            name2: detail?.name,
            price: wei2Eth(commodityWeiPrice),
            usdPrice: usdPrice
              ? usdPrice
                  ?.multipliedBy(Number(wei2Eth(commodityWeiPrice)))
                  .toFormat(FORMAT_NUMBER)
              : '',
            verified: collection?.safelist_request_status === 'verified',
          }}
        />

        {/* Down payment */}
        <LabelComponent label='Down Payment'>
          <Flex
            p={4}
            pr={6}
            border={`1px solid var(--chakra-colors-gray-1)`}
            borderRadius={16}
            alignItems='center'
            gap={4}
          >
            {downPaymentWei && (
              <Flex
                py={3}
                bg='gray.5'
                borderRadius={8}
                gap={1}
                alignItems='center'
                justify={'center'}
                px={2}
              >
                <SvgComponent svgId='icon-eth' svgSize='20px' />
                <Text fontSize={'20px'}>{wei2Eth(downPaymentWei)}</Text>
              </Flex>
            )}

            <Divider orientation='vertical' h={6} />
            <Slider
              min={COLLATERALS[0]}
              max={COLLATERALS[COLLATERALS.length - 1]}
              step={1000}
              onChange={(target) => {
                setPercentage(target)
              }}
              isDisabled={fetching || transferFromLoading || generateLoading}
              value={percentage}
            >
              {COLLATERALS.map((item) => (
                <SliderMark value={item} fontSize='sm' key={item} zIndex={1}>
                  <Box
                    w={2}
                    h={2}
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
                boxSize={6}
                borderWidth={5}
                borderColor={'blue.1'}
                _focus={{
                  boxShadow: 'none',
                }}
              />
              <SlideFade />
            </Slider>
          </Flex>

          <Flex justify={'center'} gap={1} alignItems='center' mt={6}>
            <Text fontSize={'xs'} fontWeight='500'>
              Loan amount
            </Text>
            <SvgComponent svgId='icon-eth' svgSize='12px' />
            <Text fontSize={'xs'} fontWeight='500'>
              {wei2Eth(loanWeiAmount)}
            </Text>
          </Flex>
        </LabelComponent>

        {/* Loan Period */}
        <LabelComponent
          label='Loan Period'
          isEmpty={isEmpty(pools)}
          loading={fetching}
        >
          <Flex gap={2} flexWrap='wrap'>
            {pools.map(({ pool_id, pool_apr, pool_days }) => {
              return (
                <Flex
                  key={`${pool_id}-${pool_apr}-${pool_days}`}
                  w={`${100 / pools.length}%`}
                  minW='137px'
                  maxW={136}
                >
                  <RadioCard
                    isDisabled={transferFromLoading || generateLoading}
                    onClick={() =>
                      setSelectPool({
                        pool_apr,
                        pool_id,
                        pool_days,
                      })
                    }
                    isActive={selectPool?.pool_days === pool_days}
                  >
                    <Text fontWeight={700}>{pool_days} Days</Text>
                    <Text fontWeight={500} fontSize='xs' color='blue.1'>
                      <Highlight query={'APR'} styles={{ color: `black.1` }}>
                        {`${pool_apr && floor(pool_apr / 100, 4)} % APR`}
                      </Highlight>
                    </Text>
                  </RadioCard>
                </Flex>
              )
            })}
          </Flex>
        </LabelComponent>

        {/* Number of installments */}
        <LabelComponent
          label='Number of installments'
          isEmpty={isEmpty(selectPool)}
          loading={fetching}
        >
          <HStack gap={4}>
            {installmentOptions?.map((value) => {
              return (
                <Flex
                  key={value}
                  w={`${100 / installmentOptions.length}%`}
                  maxW={188}
                >
                  <RadioCard
                    isDisabled={transferFromLoading || generateLoading}
                    onClick={() => setInstallmentValue(value)}
                    isActive={value === installmentValue}
                  >
                    <Text fontWeight={700}>Pay in {value} installments</Text>
                    <Text fontWeight={500} fontSize='xs'>
                      {getPlanPer(value).toFormat(FORMAT_NUMBER)}
                      &nbsp;
                      {UNIT}/per
                    </Text>
                  </RadioCard>
                </Flex>
              )
            })}
          </HStack>
        </LabelComponent>

        {/* Repayment Plan */}
        {!commodityWeiPrice.eq(0) && !loanWeiAmount.eq(0) && (
          <LabelComponent
            label='Repayment Plan'
            isEmpty={isEmpty(selectPool)}
            loading={fetching}
          >
            <VStack bg='gray.5' py={6} px={4} borderRadius={12} spacing={4}>
              <PlanItem
                value={wei2Eth(downPaymentWei)}
                label='Down payment on today'
              />

              {range(installmentValue).map((value, index) => (
                <PlanItem
                  value={getPlanPer(installmentValue).toFormat(FORMAT_NUMBER)}
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
          label='Trading Information'
          borderBottom={'none'}
          loading={fetching}
          isEmpty={isEmpty(pools)}
        >
          {!loanWeiAmount.eq(0) && !commodityWeiPrice.eq(0) && (
            <Flex
              border={`1px solid var(--chakra-colors-gray-1)`}
              py={6}
              px={4}
              borderRadius={12}
              gap={4}
              direction='column'
            >
              {/* Commodity price */}
              <Flex justify={'space-between'}>
                <Text color='gray.3'>Commodity price</Text>
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
                <Text fontSize={'md'} fontWeight='bold'>
                  Total repayment
                </Text>
                <Text fontSize={'md'} fontWeight='bold'>
                  {getPlanPer(installmentValue)
                    .multipliedBy(installmentValue)
                    .minus(Number(wei2Eth(loanWeiAmount)))
                    .plus(Number(wei2Eth(commodityWeiPrice)))
                    .toFormat(FORMAT_NUMBER)}
                  {UNIT}
                </Text>
              </Flex>
              {/* Floor breakeven */}
              <Flex justify={'space-between'}>
                <Text fontSize={'md'} fontWeight='bold'>
                  Floor breakeven
                </Text>
                <Text fontSize={'md'} fontWeight='bold'>
                  {/*  */}
                  {getPlanPer(installmentValue)
                    .multipliedBy(installmentValue)
                    .minus(Number(wei2Eth(loanWeiAmount)))
                    .plus(Number(wei2Eth(commodityWeiPrice)))
                    .multipliedBy(1.025)
                    .toFormat(FORMAT_NUMBER)}
                  {UNIT}
                </Text>
              </Flex>
            </Flex>
          )}
        </LabelComponent>

        {/* 按钮 */}
        <Button
          variant={'primary'}
          display='flex'
          h='60px'
          w='100%'
          onClick={handleClickPay}
          isDisabled={loanWeiAmount.eq(0) || fetching || isEmpty(selectPool)}
          isLoading={transferFromLoading || generateLoading}
        >
          <Text fontWeight={'400'}>Down payment</Text>&nbsp;
          {wei2Eth(downPaymentWei)} {UNIT}
        </Button>
      </Box>

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </Flex>
  )
}

export default NftAssetDetail

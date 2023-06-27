import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  type CardProps,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
  type FlexProps,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import find from 'lodash-es/find'
import isEmpty from 'lodash-es/isEmpty'
import isEqual from 'lodash-es/isEqual'
import range from 'lodash-es/range'
import slice from 'lodash-es/slice'
import {
  useMemo,
  useState,
  type FunctionComponent,
  useEffect,
  useCallback,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  apiGetFloorPrice,
  apiGetPools,
  apiGetConfig,
  apiGetPoolPoints,
} from '@/api'
import {
  AsyncSelectCollection,
  NotFound,
  H5SecondaryHeader,
  ScrollNumber,
  SvgComponent,
  CustomNumberInput,
  LoadingComponent,
} from '@/components'
import { STEPS_DESCRIPTIONS } from '@/constants'
import {
  BASE_RATE,
  COLLATERAL_KEYS,
  COLLATERAL_MAP,
  COLLATERAL_VALUES,
  RATE_POWER_KEYS,
  RATE_POWER_MAP,
  TENOR_KEYS,
  TENOR_MAP,
  TENOR_VALUES,
  TERM_POWER_KEYS,
  TERM_POWER_MAP,
  RATIO_POWER_MAP,
  RATIO_POWER_KEYS,
  RATE_POWER_VALUES,
} from '@/constants/interest'
import { useCatchContractError, useWallet, type NftCollection } from '@/hooks'
import { computePoolPoint, getMaxSingleLoanScore } from '@/utils/calculation'
import { createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'
import { getKeyByValue } from '@/utils/utils'

import CreatePoolButton from './components/CreatePoolButton'
import ScoreChart from './components/ScoreChart'
import SliderWrapper from './components/SliderWrapper'
import StepDescription from './components/StepDescription'

const xBankContract = createXBankContract()

const Wrapper: FunctionComponent<
  {
    stepIndex: number
  } & CardProps
> = ({ stepIndex, children }) => {
  return (
    <Flex
      justify={'space-between'}
      alignItems='center'
      flexWrap={{
        md: 'nowrap',
        sm: 'wrap',
        xs: 'wrap',
      }}
      rowGap={'24px'}
      columnGap={'16px'}
      display={{
        md: 'flex',
        xs: 'block',
        sm: 'block',
      }}
      borderRadius={16}
      bg='gray.5'
      p={{ md: '32px', sm: '12px', xs: '12px' }}
    >
      <StepDescription
        data={{
          step: stepIndex,
          ...STEPS_DESCRIPTIONS[stepIndex - 1],
        }}
      />
      {children}
      {/* {isEmpty(params) ? <InputSearch /> : params.collectionId} */}
    </Flex>
  )
}

const SecondaryWrapper: FunctionComponent<
  {
    title: string
    description: string
  } & FlexProps
> = ({ description, title, children }) => (
  <Flex
    justify={'space-between'}
    w='100%'
    alignItems={'center'}
    p={{
      md: '10px 0 10px 8px',
      sm: '10px 0 10px 8px',
      xs: '10px 0 10px 8px',
    }}
    flexWrap={{
      md: 'nowrap',
      sm: 'wrap',
      xs: 'wrap',
    }}
    gap='10px'
  >
    <Flex alignItems={'center'} gap='6px'>
      <Box
        boxSize={'16px'}
        borderRadius={'100%'}
        borderWidth={4}
        borderColor={'blue.1'}
        mr='18px'
      />
      <Text> {title}</Text>
      <Tooltip
        label={description}
        placement='auto-start'
        hasArrow
        bg='white'
        borderRadius={8}
        p='10px'
        fontSize={'14px'}
        lineHeight={'18px'}
        fontWeight={'500'}
        boxShadow={'0px 0px 10px #D1D6DC'}
        color='gray.3'
        whiteSpace={'pre-line'}
      >
        <Box cursor={'pointer'}>
          <SvgComponent svgId='icon-tip' fill='gray.1' fontSize={'20px'} />
        </Box>
      </Tooltip>
    </Flex>
    <Box
      w={{
        md: 'auto',
        sm: '100%',
        xs: '100%',
      }}
    >
      {children}
    </Box>
  </Flex>
)

const Create = () => {
  const params = useParams() as {
    action: 'create' | 'edit'
  }
  const { toast, toastError } = useCatchContractError()

  const { state } = useLocation() as {
    state: {
      contractAddress: string
      nftCollection: NftCollection
      poolData: PoolsListItemType
    }
  }
  const navigate = useNavigate()
  const { currentAccount, interceptFn } = useWallet()
  const { isOpen: showFlexibility, onToggle: toggleShowFlexibility } =
    useDisclosure({
      defaultIsOpen: false,
    })

  const [collectionAddressWithPool, setCollectionAddressWithPool] =
    useState<string[]>()
  useRequest(apiGetPools, {
    ready: params?.action === 'create' && !!currentAccount,
    debounceWait: 10,
    onSuccess(data) {
      if (!data || !data?.length) {
        setCollectionAddressWithPool([])
        return
      }
      setCollectionAddressWithPool([
        ...new Set(data?.map((i) => i.allow_collateral_contract.toLowerCase())),
      ])
    },
    defaultParams: [
      {
        owner_address: currentAccount,
      },
    ],
    refreshDeps: [currentAccount],
  })

  const [configData, setConfigData] = useState<
    ConfigDataType & {
      maxLoanAmountMap: Map<number, number>
    }
  >()
  const { loading: configLoading } = useRequest(apiGetConfig, {
    onSuccess: (data) => {
      if (!data) return
      const maxLoanAmountMap: Map<number, number> = new Map()
      data.config.max_loan_amount.forEach(({ key, value }) => {
        const [start] = key.split('-')
        maxLoanAmountMap.set(Number(start) / 10000, value)
      })
      setConfigData({
        ...data.config,
        maxLoanAmountMap,
      })
    },
  })

  // collection
  const [selectCollection, setSelectCollection] = useState<{
    contractAddress: string
    nftCollection: NftCollection
  }>()
  // 贷款比例 key
  const [collateralKey, setCollateralKey] = useState(4)
  // 单笔最大贷款
  const [maxSingleLoanAmount, setMaxSingleLoanAmount] = useState<string>()
  // 贷款天数 key
  const [tenorKey, setTenorKey] = useState(5)
  // 贷款乘法系数
  const [interestPowerKey, setInterestPowerKey] = useState(5)

  // 贷款比例微调 right
  const [ratioPowerKey, setRatioPowerKey] = useState(2)
  // 贷款天数微调 bottom
  const [termPowerKey, setTermPowerKey] = useState(2)

  const initialCollection = useMemo(() => {
    if (!state) return
    const prev = {
      contractAddress: state.contractAddress,
      nftCollection: state.nftCollection,
    }
    if (params.action === 'edit') {
      return prev
    }
    if (params?.action === 'create') {
      if (!collectionAddressWithPool) return
      if (collectionAddressWithPool.includes(prev?.contractAddress)) return
      return prev
    }
  }, [state, params, collectionAddressWithPool])

  const initialItems = useMemo(() => {
    let currentCollateralKey = 4
    let currentTenorKey = 5
    let currentInterestPowerKey = 5
    let currentRatioPowerKey = 2
    let currentTermPowerKey = 2
    let singleMaximumLoanAmount

    // 只有编辑进来的 才才需要填入默认值，supply 只需要填入 collection
    if (state && params?.action === 'edit') {
      const { poolData } = state
      currentCollateralKey =
        getKeyByValue(COLLATERAL_MAP, poolData?.pool_maximum_percentage) ?? 4
      currentTenorKey =
        getKeyByValue(TENOR_MAP, poolData?.pool_maximum_days) ?? 5

      // 贷款利率
      const cKey = `${currentTenorKey}-${currentCollateralKey}`
      const defaultRate = BigNumber(BASE_RATE.get(cKey) as number)
      const interestRank =
        find(RATE_POWER_VALUES, (element) => {
          return (
            defaultRate.multipliedBy(element).toFixed(0, BigNumber.ROUND_UP) ===
            poolData?.pool_maximum_interest_rate.toString()
          )
        }) ?? 1

      currentInterestPowerKey = getKeyByValue(RATE_POWER_MAP, interestRank) ?? 5
      currentRatioPowerKey =
        getKeyByValue(
          RATIO_POWER_MAP,
          poolData?.loan_ratio_preferential_flexibility / 10000,
        ) ?? 2
      currentTermPowerKey =
        getKeyByValue(
          TERM_POWER_MAP,
          poolData?.loan_time_concession_flexibility / 10000,
        ) ?? 2
      singleMaximumLoanAmount = wei2Eth(poolData.maximum_loan_amount) ?? 0
    }
    return {
      collateralKey: currentCollateralKey,
      tenorKey: currentTenorKey,
      interestPowerKey: currentInterestPowerKey,
      ratioPowerKey: currentRatioPowerKey,
      termPowerKey: currentTermPowerKey,
      singleMaximumLoanAmount,
    }
  }, [state, params])

  useEffect(() => {
    if (!initialItems) return
    setCollateralKey(initialItems.collateralKey)
    setTenorKey(initialItems.tenorKey)
    setInterestPowerKey(initialItems.interestPowerKey)
    setRatioPowerKey(initialItems.ratioPowerKey)
    setTermPowerKey(initialItems.termPowerKey)
    setMaxSingleLoanAmount(
      initialItems?.singleMaximumLoanAmount?.toString() || undefined,
    )
  }, [initialItems])

  const { loading: poolPointLoading, data: pointData } = useRequest(
    apiGetPoolPoints,
    {
      defaultParams: [
        {
          contract_address: selectCollection?.contractAddress || '',
        },
      ],
      ready: !!selectCollection,
      refreshDeps: [selectCollection],
    },
  )

  const [floorPrice, setFloorPrice] = useState<number>()
  const { loading, data: floorPriceData } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: selectCollection?.nftCollection.slug || '',
      }),
    {
      ready: !!selectCollection,
      refreshDeps: [selectCollection],
      // cacheKey: `staleTime-floorPrice-${selectCollection?.nftCollection?.slug}`,
      // staleTime: 1000 * 60,
      onError: () => {
        toast({
          title: 'Network problems, please refresh and try again',
          status: 'error',
          duration: 3000,
        })
      },
    },
  )

  const calculateScore: BigNumber | undefined = useMemo(() => {
    if (
      !selectCollection ||
      maxSingleLoanAmount === undefined ||
      !floorPrice ||
      !configData
    )
      return
    const {
      weight: { x, y, z, w, u, v },
      loan_ratio,
      loan_term,
      maxLoanAmountMap,
      // 贷款期限微调 bottom
      loan_term_adjustment_factor,
      // 贷款比例微调 right
      loan_ratio_adjustment_factor,
      max_loan_interest_rate,
    } = configData

    // 贷款比例分数
    const collateralValue = COLLATERAL_MAP.get(collateralKey)?.toString()
    const collateralScore = BigNumber(
      loan_ratio.find((i) => i.key === collateralValue)?.value || 0,
    ).multipliedBy(x)
    console.log(collateralScore.toNumber(), 'collateralScore')

    // 单笔最大贷款金额分数
    const maxLoanAmountScore = BigNumber(
      getMaxSingleLoanScore(
        BigNumber(maxSingleLoanAmount).dividedBy(floorPrice).toNumber(),
        maxLoanAmountMap,
      ) || 0,
    ).multipliedBy(y)
    console.log(maxLoanAmountScore.toNumber(), 'maxLoanAmountScore')

    // 贷款期限分数
    const tenorValue = TENOR_MAP.get(tenorKey)?.toString()
    const tenorScore = BigNumber(
      loan_term.find((i) => i.key == tenorValue)?.value || 0,
    ).multipliedBy(z)
    console.log(tenorScore.toNumber(), 'tenorScore')

    // 最大贷款利率分数
    const maxInterestValue =
      Number(RATE_POWER_MAP.get(interestPowerKey)) * 10000
    const maxInterestScore = BigNumber(
      max_loan_interest_rate.find((i) => i.key === maxInterestValue.toString())
        ?.value || 0,
    ).multipliedBy(w)
    console.log(maxInterestScore.toNumber(), 'maxInterestScore')

    // 按贷款比例微调分数
    const ratioValue = (RATIO_POWER_MAP.get(ratioPowerKey) || 0) * 10000
    const ratioScore = BigNumber(
      loan_ratio_adjustment_factor.find((i) => i.key === ratioValue.toString())
        ?.value || 0,
    ).multipliedBy(u)
    console.log(ratioScore.toNumber(), 'ratioScore')

    // 按贷款期限微调分数
    const termValue = (TERM_POWER_MAP.get(termPowerKey) || 0) * 10000
    const termScore = BigNumber(
      loan_term_adjustment_factor.find((i) => i.key === termValue.toString())
        ?.value || 0,
    ).multipliedBy(v)
    console.log(termScore.toNumber(), 'termScore')

    return collateralScore
      .plus(maxLoanAmountScore)
      .plus(tenorScore)
      .plus(maxInterestScore)
      .plus(ratioScore)
      .plus(termScore)
  }, [
    selectCollection,
    collateralKey,
    tenorKey,
    maxSingleLoanAmount,
    floorPrice,
    interestPowerKey,
    termPowerKey,
    ratioPowerKey,
    configData,
  ])

  const currentPoolPoint = useMemo(() => {
    if (!pointData) return
    if (!calculateScore) return
    const { percent } = pointData
    return computePoolPoint(calculateScore, percent)
  }, [calculateScore, pointData])

  useEffect(() => {
    if (!floorPriceData) return
    if (isEmpty(floorPriceData)) return
    setFloorPrice(floorPriceData.floor_price)
  }, [floorPriceData])

  // set initial collection
  useEffect(() => {
    if (!initialCollection) return
    setSelectCollection(initialCollection)
  }, [initialCollection])

  const maxSingleLoanAmountStatus = useMemo(() => {
    if (maxSingleLoanAmount === undefined) return
    const NumberAmount = Number(maxSingleLoanAmount)
    if (NumberAmount <= 0) {
      return {
        status: 'error',
        message: 'You must enter the maximum amount for a single loan',
      }
    }
    if (floorPrice === undefined) return

    if (NumberAmount > floorPrice) {
      return {
        status: 'info',
        message:
          'Single loan amount is recommended to be no greater than the floor price',
      }
    }
  }, [maxSingleLoanAmount, floorPrice])

  // 基础利率
  const baseRate = useMemo(() => {
    const cKey = `${tenorKey}-${collateralKey}`
    return BigNumber(BASE_RATE.get(cKey) as number)
  }, [collateralKey, tenorKey])

  // 基础利率 * power
  const baseRatePower = useMemo(() => {
    return baseRate
      .multipliedBy(RATE_POWER_MAP.get(interestPowerKey) as number)
      .integerValue(BigNumber.ROUND_UP)
  }, [baseRate, interestPowerKey])

  const currentCollaterals = useMemo(
    () => slice(COLLATERAL_VALUES, 0, collateralKey + 1),
    [collateralKey],
  )
  const currentTenors = useMemo(
    () => slice(TENOR_VALUES, 0, tenorKey + 1),
    [tenorKey],
  )

  const tableData = useMemo(() => {
    const rowCount = collateralKey + 1
    const colCount = tenorKey + 1
    const arr = new Array(rowCount)
    const sliderBottomValue = TERM_POWER_MAP.get(termPowerKey) as number
    const sliderRightValue = RATIO_POWER_MAP.get(ratioPowerKey) as number
    for (let i = 0; i < rowCount; i++) {
      const forMapArr = range(colCount)
      arr[i] = forMapArr.map((item) => {
        const powerBottom = colCount - item - 1
        const powerRight = rowCount - i - 1
        const res = baseRatePower
          .multipliedBy(BigNumber(sliderBottomValue).pow(powerBottom))
          .multipliedBy(BigNumber(sliderRightValue).pow(powerRight))

        return res
      })
    }
    return arr
  }, [baseRatePower, termPowerKey, collateralKey, tenorKey, ratioPowerKey])

  const collectionSelectorProps = useMemo(
    () => ({
      placeholder: 'Please select',
      onChange: (e: {
        contractAddress: string
        nftCollection: NftCollection
      }) => {
        setSelectCollection(e)
      },
    }),
    [],
  )
  const [updating, setUpdating] = useState(false)

  const handleUpdatePool = useCallback(() => {
    interceptFn(async () => {
      try {
        if (!state?.poolData) {
          toast({
            status: 'error',
            title: 'pool not exist',
          })
          return
        }
        if (!maxSingleLoanAmount) {
          toast({
            status: 'error',
            title: 'maximum single loan amount id required',
          })
          return
        }
        const {
          poolData: { pool_id, pool_amount },
        } = state
        setUpdating(true)

        await xBankContract.methods
          .updatePool(
            pool_id,
            pool_amount.toString(),
            eth2Wei(maxSingleLoanAmount)?.toString(),
            COLLATERAL_MAP.get(collateralKey)?.toString(),
            TENOR_MAP.get(tenorKey)?.toString(),
            baseRatePower.toString(),
            ((RATIO_POWER_MAP.get(ratioPowerKey) as number) * 10000).toString(),
            ((TERM_POWER_MAP.get(termPowerKey) as number) * 10000).toString(),
          )
          .send({
            from: currentAccount,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
          })

        setTimeout(() => {
          setUpdating(false)
          toast({
            status: 'success',
            title: 'Updated successfully! ',
            id: 'Updated-Successfully-ID',
          })
          navigate('/lending/my-pools')
        }, 2000)
      } catch (error: any) {
        toastError(error)
        setUpdating(false)
      }
    })
  }, [
    state,
    termPowerKey,
    ratioPowerKey,
    baseRatePower,
    maxSingleLoanAmount,
    toast,
    toastError,
    tenorKey,
    collateralKey,
    interceptFn,
    currentAccount,
    navigate,
  ])

  const isChanged = useMemo(() => {
    return !isEqual(initialItems, {
      collateralKey: collateralKey,
      tenorKey: tenorKey,
      ratePowerKey: interestPowerKey,
      rightFlex: ratioPowerKey,
      bottomFlex: termPowerKey,
      maximum_loan_amount: maxSingleLoanAmount,
    })
  }, [
    maxSingleLoanAmount,
    initialItems,
    collateralKey,
    tenorKey,
    interestPowerKey,
    termPowerKey,
    ratioPowerKey,
  ])
  console.log('score', calculateScore?.toNumber())

  if (!params || !['edit', 'create'].includes(params?.action)) {
    return <NotFound />
  }
  if (params.action === 'edit' && (!state || isEmpty(state))) {
    return <NotFound title='pool not found' />
  }
  return (
    <>
      <H5SecondaryHeader />

      <Box
        mb={8}
        mt={{
          md: '60px',
          sm: '10px',
          xs: '10px',
        }}
        position={'relative'}
      >
        <Box
          position={'fixed'}
          top={{
            md: '260px',
            sm: '100px',
            xs: '100px',
          }}
          zIndex={2}
          right={0}
          bg='white'
          borderRadius={8}
          boxShadow={'0px 4px 12px #F3F6F9'}
          py='8px'
          // px='10px'
        >
          <ScoreChart data={currentPoolPoint} />
        </Box>
        <Heading
          fontSize={{
            md: '40px',
            sm: '24px',
            xs: '24px',
          }}
          mb={'8px'}
        >
          {params.action === 'create' ? 'Create New Pool' : 'Manage Pool'}
        </Heading>
        {params.action === 'create' && (
          <Text
            color='gray.3'
            w={{
              md: '65%',
              sm: '95%',
              xs: '95%',
            }}
          >
            Setting up a new pool to lend against borrowers with preferred
            length of duration and collateral factor ratio.
          </Text>
        )}
      </Box>

      <Flex
        borderRadius={24}
        mb='32px'
        flexDir={'column'}
        gap={'30px'}
        position={'relative'}
      >
        {/* collection */}
        <LoadingComponent
          loading={loading || updating || configLoading || poolPointLoading}
          top={0}
        />
        <Wrapper stepIndex={1}>
          <Box>
            <Box
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}
            >
              <AsyncSelectCollection
                {...collectionSelectorProps}
                w='360px'
                disabledArr={collectionAddressWithPool}
                isDisabled={params.action === 'edit'}
                value={selectCollection}
                onChange={(e: {
                  contractAddress: string
                  nftCollection: NftCollection
                }) => {
                  setSelectCollection(e)
                }}
              />
            </Box>

            <Box
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
              mt='24px'
            >
              <AsyncSelectCollection
                {...collectionSelectorProps}
                isDisabled={params.action === 'edit'}
                value={selectCollection}
                disabledArr={collectionAddressWithPool}
                onChange={(e: {
                  contractAddress: string
                  nftCollection: NftCollection
                }) => {
                  setSelectCollection(e)
                }}
              />
            </Box>
            {!isEmpty(selectCollection) && (
              <Flex
                mt='12px'
                justify={'flex-end'}
                alignItems={'center'}
                fontSize={'14px'}
                fontWeight={'700'}
                color='gray.3'
              >
                Current Floor Price
                <SvgComponent svgId='icon-eth' />
                {formatFloat(floorPrice)}
              </Flex>
            )}
          </Box>
        </Wrapper>
        {/* 贷款比例 collateral */}
        <Flex
          justify={'center'}
          flexDir={'column'}
          borderRadius={16}
          mb='24px'
          bg='gray.5'
          p={{
            md: '32px',
            sm: '12px',
            xs: '12px',
          }}
        >
          <StepDescription
            data={{
              step: 2,
              ...STEPS_DESCRIPTIONS[1],
            }}
            mb='16px'
          />
          <SecondaryWrapper
            title='Set maximum collateral factor'
            description={`It will determine the highest percentage of the single loan value against the valuation of the NFT collateral at the time of the transaction.\nIn case of borrower default, you can obtain collateral. It's equivalent to buying NFT at a discounted price based on the loan amount you provide.`}
          >
            <SliderWrapper
              unit='%'
              value={collateralKey}
              svgId='icon-intersect'
              defaultValue={initialItems?.collateralKey}
              data={COLLATERAL_KEYS}
              min={COLLATERAL_KEYS[0]}
              max={COLLATERAL_KEYS[COLLATERAL_KEYS.length - 1]}
              step={1}
              label={`${(COLLATERAL_MAP.get(collateralKey) as number) / 100}`}
              onChange={(target) => {
                setCollateralKey(target)
              }}
            />
          </SecondaryWrapper>

          <SecondaryWrapper
            title='Set maximum single loan amount'
            description={`It will determine the maximum amount of single loan that borrowers can take against this lending offer.\nIn case of borrower default, you can obtain collateral. It's equivalent to buying NFT at a discounted price based on the loan amount you provide.`}
          >
            <Box>
              <Tooltip
                label={!!selectCollection ? '' : 'Please select collection'}
              >
                <InputGroup
                  w={{
                    md: '484px',
                    sm: '100%',
                    xs: '100%',
                  }}
                >
                  <InputLeftElement
                    pointerEvents='none'
                    color='gray.300'
                    fontSize='1.2em'
                    top='12px'
                  >
                    <SvgComponent svgId='icon-eth' fill={'black.1'} />
                  </InputLeftElement>
                  <CustomNumberInput
                    isDisabled={
                      !selectCollection ||
                      !floorPriceData ||
                      isEmpty(floorPriceData)
                    }
                    value={maxSingleLoanAmount || ''}
                    isInvalid={maxSingleLoanAmountStatus?.status === 'error'}
                    // lineHeight='60px'
                    placeholder='Please enter amount...'
                    onSetValue={(v) => setMaxSingleLoanAmount(v)}
                    px={'32px'}
                  />

                  {maxSingleLoanAmountStatus?.status === 'error' && (
                    <InputRightElement top='14px' mr='8px'>
                      <SvgComponent svgId='icon-error' svgSize='24px' />
                    </InputRightElement>
                  )}
                </InputGroup>
              </Tooltip>

              {!!maxSingleLoanAmountStatus && (
                <Text
                  mt='12px'
                  color={
                    maxSingleLoanAmountStatus?.status === 'error'
                      ? 'red.1'
                      : 'orange.1'
                  }
                  fontSize={'14px'}
                >
                  {maxSingleLoanAmountStatus.message}
                </Text>
              )}
            </Box>
          </SecondaryWrapper>

          {/* {isEmpty(params) ? <InputSearch /> : params.collectionId} */}
        </Flex>
        {/* 贷款天数 tenor */}
        <Wrapper stepIndex={3}>
          <SliderWrapper
            unit='days'
            value={tenorKey}
            defaultValue={initialItems?.tenorKey}
            data={TENOR_KEYS}
            svgId='icon-calendar'
            min={TENOR_KEYS[0]}
            max={TENOR_KEYS[TENOR_KEYS.length - 1]}
            step={1}
            label={`${TENOR_MAP.get(tenorKey)}`}
            onChange={(target) => {
              setTenorKey(target)
            }}
          />
        </Wrapper>
        {/* 贷款比率 */}
        <Wrapper stepIndex={4}>
          <SliderWrapper
            unit='%'
            value={interestPowerKey}
            defaultValue={initialItems?.interestPowerKey}
            data={RATE_POWER_KEYS}
            min={RATE_POWER_KEYS[0]}
            max={RATE_POWER_KEYS[RATE_POWER_KEYS.length - 1]}
            step={1}
            label={`${baseRatePower.dividedBy(100).toFixed(2)}`}
            onChange={(target) => {
              setInterestPowerKey(target)
            }}
            svgId='icon-intersect'
          />
        </Wrapper>

        {/* 表格 */}
        <Box
          bg='gray.5'
          p={{
            md: '32px',
            sm: '0',
            xs: '0',
          }}
          borderRadius={16}
          pos={'relative'}
        >
          <Flex
            justify={'center'}
            mb={'46px'}
            fontSize={'18px'}
            fontWeight={'700'}
          >
            Generate the interest rate table for outstanding loans
          </Flex>
          <Box
            bg='white'
            w={{
              md: '90%',
              sm: '100%',
              xs: '10%',
            }}
            borderRadius={16}
            margin={'0 auto'}
          >
            <Flex>
              {[
                'Collateral Factor/ Tenor',
                ...currentTenors.map((i) => `${i} Days`),
              ].map((item, i) => (
                <Flex
                  key={item}
                  w={`${(1 / (tenorKey + 1 || 1)) * 100}%`}
                  alignItems={'center'}
                  justify='center'
                  h={'40px'}
                  borderBottomColor='gray.2'
                  borderBottomWidth={1}
                >
                  <Text
                    textAlign={'center'}
                    fontSize='12px'
                    fontWeight={'bold'}
                    lineHeight='12px'
                    transform={{
                      md: 'none',
                      sm: `scale(${i !== 0 ? 0.83333 : 0.66666})`,
                      xs: `scale(${i !== 0 ? 0.83333 : 0.66666})`,
                    }}
                    transformOrigin='center'
                  >
                    {item}
                  </Text>
                </Flex>
              ))}
            </Flex>
            {tableData.map((row, index) => {
              return (
                <Flex
                  /* eslint-disable */
                  key={index}
                  /* eslint-disable */
                  borderBottom={
                    index !== tableData?.length - 1
                      ? `1px solid var(--chakra-colors-gray-2)`
                      : 'none'
                  }
                >
                  {[currentCollaterals[index], ...row]?.map(
                    (value: BigNumber, i: number) => (
                      <Flex
                        /* eslint-disable */
                        key={i}
                        /* eslint-disable */
                        alignItems={'center'}
                        justify='center'
                        h={{
                          md: '40px',
                          sm: '35px',
                          xs: '35px',
                        }}
                        w={`${(1 / (tenorKey + 1 || 1)) * 100}%`}
                      >
                        {i === 0 ? (
                          <Text
                            textAlign={'center'}
                            fontSize='12px'
                            fontWeight={'bold'}
                            color={'black.1'}
                            transform={{
                              md: 'none',
                              sm: 'scale(0.83333)',
                              xs: 'scale(0.83333)',
                            }}
                            transformOrigin='center'
                          >
                            {Number(value) / 100}%
                          </Text>
                        ) : (
                          <ScrollNumber
                            value={`${value
                              .dividedBy(100)
                              .toFormat(2, BigNumber.ROUND_UP)}%`}
                            color={
                              i === row?.length &&
                              index === tableData?.length - 1
                                ? 'blue.1'
                                : 'gray.3'
                            }
                            fontWeight={
                              i === row?.length &&
                              index === tableData?.length - 1
                                ? '700'
                                : '500'
                            }
                          />
                        )}
                      </Flex>
                    ),
                  )}
                </Flex>
              )
            })}
          </Box>

          <Flex
            flexDir={'column'}
            alignItems='center'
            gap={'4px'}
            hidden={!showFlexibility}
            pos={'absolute'}
            right={{
              md: '32px',
              sm: '12px',
              xs: '12px',
            }}
            top={'50%'}
            transform={'translateY(-50%)'}
          >
            <Slider
              orientation='vertical'
              defaultValue={initialItems?.ratioPowerKey}
              min={RATIO_POWER_KEYS[0]}
              max={RATIO_POWER_KEYS[RATIO_POWER_KEYS.length - 1]}
              h='132px'
              step={1}
              onChange={(target) => {
                setRatioPowerKey(target)
              }}
            >
              <SliderTrack bg={`gray.1`}>
                <SliderFilledTrack bg={`blue.1`} />
              </SliderTrack>
              <SliderThumb
                boxSize={'16px'}
                borderWidth={'2px'}
                borderColor={`blue.1`}
                _focus={{
                  boxShadow: 'none',
                }}
              />
            </Slider>
            <Tooltip
              label={
                'You can use this to adjust how much the interest rate is favorable as the collateral factor goes down.'
              }
              placement='auto-start'
              hasArrow
              bg='white'
              borderRadius={8}
              p='10px'
              fontSize={'14px'}
              lineHeight={'18px'}
              fontWeight={'500'}
              boxShadow={'0px 0px 10px #D1D6DC'}
              color='gray.3'
              whiteSpace={'pre-line'}
            >
              <Box cursor={'pointer'}>
                <SvgComponent
                  svgId='icon-tip'
                  fill='gray.1'
                  fontSize={'20px'}
                />
              </Box>
            </Tooltip>
          </Flex>
          {/* 切换展示微调滑杆 */}
          <Flex
            justify={'center'}
            hidden={showFlexibility}
            onClick={toggleShowFlexibility}
            mt='20px'
          >
            <Button variant={'link'}>Fine-tune interest rates</Button>
          </Flex>

          <Flex hidden={!showFlexibility} justify={'center'} mt='20px'>
            <Slider
              min={TERM_POWER_KEYS[0]}
              max={TERM_POWER_KEYS[TERM_POWER_KEYS.length - 1]}
              w='140px'
              step={1}
              defaultValue={initialItems?.termPowerKey}
              onChange={(target) => {
                setTermPowerKey(target)
              }}
            >
              <SliderTrack bg={`gray.1`}>
                <SliderFilledTrack bg={`blue.1`} />
              </SliderTrack>
              <SliderThumb
                boxSize={'16px'}
                borderWidth={'2px'}
                borderColor={`blue.1`}
                _focus={{
                  boxShadow: 'none',
                }}
              />
            </Slider>
            <Tooltip
              label={
                'You can use this to adjust how much the interest rate is favorable as the loan tenor shortens.'
              }
              placement='auto-start'
              hasArrow
              bg='white'
              borderRadius={8}
              p='10px'
              fontSize={'14px'}
              lineHeight={'18px'}
              fontWeight={'500'}
              boxShadow={'0px 0px 10px #D1D6DC'}
              color='gray.3'
              whiteSpace={'pre-line'}
            >
              <Box cursor={'pointer'}>
                <SvgComponent
                  svgId='icon-tip'
                  fill='gray.1'
                  fontSize={'20px'}
                />
              </Box>
            </Tooltip>
          </Flex>
        </Box>
      </Flex>

      <Flex justify={'center'} mb={'40px'} gap='20px'>
        <Button
          variant={'outline'}
          w='160px'
          h='52px'
          gap='4px'
          onClick={() => {
            navigate(-1)
          }}
        >
          {/* <SvgComponent svgId='icon-arrow' fill='blue.1' /> */}
          Back
        </Button>
        {params.action === 'create' && (
          <CreatePoolButton
            variant={'primary'}
            w='240px'
            h='52px'
            isDisabled={
              isEmpty(selectCollection) ||
              collectionAddressWithPool?.includes(
                selectCollection?.contractAddress?.toLowerCase(),
              ) ||
              !maxSingleLoanAmount ||
              maxSingleLoanAmountStatus?.status === 'error' ||
              !floorPriceData ||
              isEmpty(floorPriceData)
            }
            data={{
              poolMaximumPercentage: COLLATERAL_MAP.get(
                collateralKey,
              ) as number,
              poolMaximumDays: TENOR_MAP.get(tenorKey) as number,
              allowCollateralContract:
                selectCollection?.contractAddress as string,
              floorPrice: floorPrice as number,
              poolMaximumInterestRate: BigNumber(baseRatePower)
                .integerValue()
                .toNumber(),
              loanRatioPreferentialFlexibility: RATIO_POWER_MAP.get(
                ratioPowerKey,
              ) as number,
              loanTimeConcessionFlexibility: TERM_POWER_MAP.get(
                termPowerKey,
              ) as number,
              maxSingleLoanAmount: maxSingleLoanAmount as string,
            }}
          >
            Approve WETH
          </CreatePoolButton>
        )}
        {params.action === 'edit' && (
          <Button
            isDisabled={
              maxSingleLoanAmountStatus?.status === 'error' ||
              !maxSingleLoanAmount ||
              !isChanged ||
              !floorPriceData ||
              isEmpty(floorPriceData)
            }
            variant={'primary'}
            w='240px'
            h='52px'
            isLoading={loading || updating}
            onClick={handleUpdatePool}
          >
            Confirm
          </Button>
        )}
      </Flex>
    </>
  )
}

export default Create

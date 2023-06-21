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

import { apiGetFloorPrice, apiGetPools } from '@/api'
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
  BOTTOM_RATE_POWER_KEYS,
  BOTTOM_RATE_POWER_MAP,
  RIGHT_RATE_POWER_MAP,
  RIGHT_RATE_POWER_KEYS,
} from '@/constants/interest'
import type { NftCollection } from '@/hooks'
import { useCatchContractError, useWallet } from '@/hooks'
import { createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import CreatePoolButton from './components/CreatePoolButton'
import SliderWrapper from './components/SliderWrapper'
import StepDescription from './components/StepDescription'

const xBankContract = createXBankContract()

const getKeyByValue = (map: any, searchValue: string | number) => {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) return key
  }
}

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

  // collection
  const [selectCollection, setSelectCollection] = useState<{
    contractAddress: string
    nftCollection: NftCollection
  }>()
  // 贷款比例 key
  const [selectCollateralKey, setSelectCollateralKey] = useState(4)
  // 单笔最大贷款
  const [maxSingleLoanAmount, setMaxSingleLoanAmount] = useState<string>()
  // 贷款天数 key
  const [selectTenorKey, setSelectTenorKey] = useState(5)
  // 贷款乘法系数
  const [interestPower, setInterestPower] = useState(5)

  const [sliderRightKey, setSliderRightKey] = useState(2)
  const [sliderBottomKey, setSliderBottomKey] = useState(2)

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
    let collateralKey = 4
    let tenorKey = 5
    let ratePowerKey = 5
    let rightFlex = 2
    let bottomFlex = 2
    let maximum_loan_amount

    // 只有编辑进来的 才才需要填入默认值，supply 只需要填入 collection
    if (state && params?.action === 'edit') {
      const { poolData } = state
      collateralKey =
        getKeyByValue(COLLATERAL_MAP, poolData?.pool_maximum_percentage) ?? 4
      tenorKey = getKeyByValue(TENOR_MAP, poolData?.pool_maximum_days) ?? 5
      const res =
        poolData?.pool_maximum_interest_rate /
        (BASE_RATE.get(`${tenorKey}-${collateralKey}`) as number)

      ratePowerKey = getKeyByValue(RATE_POWER_MAP, res) ?? 5
      rightFlex =
        getKeyByValue(
          RIGHT_RATE_POWER_MAP,
          poolData?.loan_ratio_preferential_flexibility / 10000,
        ) ?? 2
      bottomFlex =
        getKeyByValue(
          BOTTOM_RATE_POWER_MAP,
          poolData?.loan_time_concession_flexibility / 10000,
        ) ?? 2
      maximum_loan_amount = wei2Eth(poolData.maximum_loan_amount) ?? 0
    }
    return {
      collateralKey,
      tenorKey,
      ratePowerKey,
      rightFlex,
      bottomFlex,
      maximum_loan_amount,
    }
  }, [state, params])

  useEffect(() => {
    if (!initialItems) return
    setSelectCollateralKey(initialItems.collateralKey)
    setSelectTenorKey(initialItems.tenorKey)
    setInterestPower(initialItems.ratePowerKey)
    setSliderRightKey(initialItems.rightFlex)
    setSliderBottomKey(initialItems.bottomFlex)
    setMaxSingleLoanAmount(
      initialItems?.maximum_loan_amount?.toString() || undefined,
    )
  }, [initialItems])

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
    const cKey = `${selectTenorKey}-${selectCollateralKey}`
    return BigNumber(BASE_RATE.get(cKey) as number)
  }, [selectCollateralKey, selectTenorKey])

  // 基础利率 * power
  const baseRatePower = useMemo(() => {
    return baseRate
      .multipliedBy(RATE_POWER_MAP.get(interestPower) as number)
      .integerValue(BigNumber.ROUND_UP)
  }, [baseRate, interestPower])

  const currentCollaterals = useMemo(
    () => slice(COLLATERAL_VALUES, 0, selectCollateralKey + 1),
    [selectCollateralKey],
  )
  const currentTenors = useMemo(
    () => slice(TENOR_VALUES, 0, selectTenorKey + 1),
    [selectTenorKey],
  )

  const tableData = useMemo(() => {
    const rowCount = selectCollateralKey + 1
    const colCount = selectTenorKey + 1
    const arr = new Array(rowCount)
    const sliderBottomValue = BOTTOM_RATE_POWER_MAP.get(
      sliderBottomKey,
    ) as number
    const sliderRightValue = RIGHT_RATE_POWER_MAP.get(sliderRightKey) as number
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
  }, [
    baseRatePower,
    sliderBottomKey,
    selectCollateralKey,
    selectTenorKey,
    sliderRightKey,
  ])

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
            COLLATERAL_MAP.get(selectCollateralKey)?.toString(),
            TENOR_MAP.get(selectTenorKey)?.toString(),
            baseRatePower.toString(),
            (
              (RIGHT_RATE_POWER_MAP.get(sliderRightKey) as number) * 10000
            ).toString(),
            (
              (BOTTOM_RATE_POWER_MAP.get(sliderBottomKey) as number) * 10000
            ).toString(),
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
    sliderBottomKey,
    sliderRightKey,
    baseRatePower,
    maxSingleLoanAmount,
    toast,
    toastError,
    selectTenorKey,
    selectCollateralKey,
    interceptFn,
    currentAccount,
    navigate,
  ])

  const isChanged = useMemo(() => {
    return !isEqual(initialItems, {
      collateralKey: selectCollateralKey,
      tenorKey: selectTenorKey,
      ratePowerKey: interestPower,
      rightFlex: sliderRightKey,
      bottomFlex: sliderBottomKey,
      maximum_loan_amount: maxSingleLoanAmount,
    })
  }, [
    maxSingleLoanAmount,
    initialItems,
    selectCollateralKey,
    selectTenorKey,
    interestPower,
    sliderBottomKey,
    sliderRightKey,
  ])

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
      >
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
              md: '75%',
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
        <LoadingComponent loading={loading || updating} top={0} />
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
              // extraTip={
              //   !isEmpty(selectCollection) ? (
              //     <Flex
              //       bg='white'
              //       fontSize={'14px'}
              //       borderRadius={2}
              //       justify={'flex-start'}
              //       alignItems={'center'}
              //       fontWeight={'700'}
              //       color='gray.3'
              //       px='12px'
              //       py='10px'
              //       w='max-content'
              //       lineHeight={'18px'}
              //     >
              //       current maximum loan amount:
              //       <SvgComponent svgId='icon-eth' fill='gray.3' />
              //       {(selectCollection.nftCollection.nftCollectionStat
              //         .floorPrice *
              //         (COLLATERAL_MAP.get(selectCollateralKey) as number)) /
              //         10000}
              //     </Flex>
              //   ) : null
              // }
              unit='%'
              value={selectCollateralKey}
              svgId='icon-intersect'
              defaultValue={initialItems?.collateralKey}
              data={COLLATERAL_KEYS}
              min={COLLATERAL_KEYS[0]}
              max={COLLATERAL_KEYS[COLLATERAL_KEYS.length - 1]}
              step={1}
              label={`${
                (COLLATERAL_MAP.get(selectCollateralKey) as number) / 100
              }`}
              onChange={(target) => {
                setSelectCollateralKey(target)
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
        {/* <Wrapper stepIndex={2}>
          <Box>
            <SliderWrapper
              // extraTip={
              //   !isEmpty(selectCollection) ? (
              //     <Flex
              //       bg='white'
              //       fontSize={'14px'}
              //       borderRadius={2}
              //       justify={'flex-start'}
              //       alignItems={'center'}
              //       fontWeight={'700'}
              //       color='gray.3'
              //       px='12px'
              //       py='10px'
              //       w='max-content'
              //       lineHeight={'18px'}
              //     >
              //       current maximum loan amount:
              //       <SvgComponent svgId='icon-eth' fill='gray.3' />
              //       {(selectCollection.nftCollection.nftCollectionStat
              //         .floorPrice *
              //         (COLLATERAL_MAP.get(selectCollateralKey) as number)) /
              //         10000}
              //     </Flex>
              //   ) : null
              // }
              unit='%'
              value={selectCollateralKey}
              svgId='icon-intersect'
              defaultValue={initialItems?.collateralKey}
              data={COLLATERAL_KEYS}
              min={COLLATERAL_KEYS[0]}
              max={COLLATERAL_KEYS[COLLATERAL_KEYS.length - 1]}
              step={1}
              label={`${
                (COLLATERAL_MAP.get(selectCollateralKey) as number) / 100
              }`}
              onChange={(target) => {
                setSelectCollateralKey(target)
              }}
            />

            <Tooltip
              label={!!selectCollection ? '' : 'Please select collection'}
            >
              <InputGroup w='484px' mt='24px'>
                <InputLeftElement
                  pointerEvents='none'
                  color='gray.300'
                  fontSize='1.2em'
                  top='12px'
                >
                  <SvgComponent svgId='icon-eth' fill={'black.1'} />
                </InputLeftElement>
                <CustomNumberInput
                  isDisabled={!selectCollection}
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
        </Wrapper> */}
        {/* 贷款天数 tenor */}
        <Wrapper stepIndex={3}>
          <SliderWrapper
            unit='days'
            value={selectTenorKey}
            defaultValue={initialItems?.tenorKey}
            data={TENOR_KEYS}
            svgId='icon-calendar'
            min={TENOR_KEYS[0]}
            max={TENOR_KEYS[TENOR_KEYS.length - 1]}
            step={1}
            label={`${TENOR_MAP.get(selectTenorKey)}`}
            onChange={(target) => {
              setSelectTenorKey(target)
            }}
          />
        </Wrapper>
        {/* 贷款比率 */}
        <Wrapper stepIndex={4}>
          <SliderWrapper
            unit='%'
            value={interestPower}
            defaultValue={initialItems?.ratePowerKey}
            data={RATE_POWER_KEYS}
            min={RATE_POWER_KEYS[0]}
            max={RATE_POWER_KEYS[RATE_POWER_KEYS.length - 1]}
            step={1}
            label={`${baseRatePower.dividedBy(100).toFixed(2)}`}
            onChange={(target) => {
              setInterestPower(target)
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
                  w={`${(1 / (selectTenorKey + 1 || 1)) * 100}%`}
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
                        w={`${(1 / (selectTenorKey + 1 || 1)) * 100}%`}
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
              defaultValue={initialItems?.rightFlex}
              min={RIGHT_RATE_POWER_KEYS[0]}
              max={RIGHT_RATE_POWER_KEYS[RIGHT_RATE_POWER_KEYS.length - 1]}
              h='132px'
              step={1}
              onChange={(target) => {
                setSliderRightKey(target)
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
              min={BOTTOM_RATE_POWER_KEYS[0]}
              max={BOTTOM_RATE_POWER_KEYS[BOTTOM_RATE_POWER_KEYS.length - 1]}
              w='140px'
              step={1}
              defaultValue={initialItems?.bottomFlex}
              onChange={(target) => {
                setSliderBottomKey(target)
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
                selectCollateralKey,
              ) as number,
              poolMaximumDays: TENOR_MAP.get(selectTenorKey) as number,
              allowCollateralContract:
                selectCollection?.contractAddress as string,
              floorPrice: floorPrice as number,
              poolMaximumInterestRate: BigNumber(baseRatePower)
                .integerValue()
                .toNumber(),
              loanRatioPreferentialFlexibility: RIGHT_RATE_POWER_MAP.get(
                sliderRightKey,
              ) as number,
              loanTimeConcessionFlexibility: BOTTOM_RATE_POWER_MAP.get(
                sliderBottomKey,
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

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  type CardProps,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import { range, slice } from 'lodash-es'
import isEmpty from 'lodash-es/isEmpty'
import { useMemo, useState, type FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'

import { apiGetPools } from '@/api'
import {
  AsyncSelectCollection,
  NotFound,
  H5SecondaryHeader,
  ScrollNumber,
} from '@/components'
import { STEPS_DESCRIPTIONS, RESPONSIVE_MAX_W, UNIT } from '@/constants'
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
import { useWallet } from '@/hooks'

import CreatePoolButton from './components/CreatePoolButton'
import SliderWrapper from './components/SliderWrapper'
import StepDescription from './components/StepDescription'
import UpdatePoolItemsButton from './components/UpdatePoolItemsButton'

const Wrapper: FunctionComponent<
  {
    stepIndex: number
  } & CardProps
> = ({ stepIndex, children }) => {
  return (
    <Flex
      justify={'space-between'}
      alignItems='start'
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
      mb='24px'
      pos='relative'
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

const Create = () => {
  const params = useParams() as {
    action: 'create' | 'edit'
  }
  const { isOpen: showFlexibility, onToggle: toggleShowFlexibility } =
    useDisclosure({
      defaultIsOpen: false,
    })

  const { currentAccount } = useWallet()

  const [collectionAddressWithPool, setCollectionAddressWithPool] = useState<
    string[]
  >([])
  useRequest(apiGetPools, {
    ready: params?.action === 'create',
    debounceWait: 10,
    onError: (error) => {
      console.log('🚀 ~ file: Lend.tsx:123 ~ Lend ~ error:', error)
    },
    onSuccess(data) {
      if (!data) return
      setCollectionAddressWithPool([
        ...new Set(data?.map((i) => i.allow_collateral_contract.toLowerCase())),
      ])
    },
    defaultParams: [
      {
        owner_address: currentAccount,
      },
    ],
  })

  // collection
  const [selectCollection, setSelectCollection] = useState<{
    contractAddress: string
    nftCollection: NftCollection
  }>()
  // 贷款比例 key
  const [selectCollateralKey, setSelectCollateralKey] = useState(4)
  // 贷款天数 key
  const [selectTenorKey, setSelectTenorKey] = useState(5)
  // 贷款乘法系数
  const [interestPower, setInterestPower] = useState(5)

  // 基础利率
  const baseRate = useMemo((): number => {
    const cKey = `${selectTenorKey}-${selectCollateralKey}`
    return BASE_RATE.get(cKey) as number
  }, [selectCollateralKey, selectTenorKey])

  // 基础利率 * power
  const baseRatePower: number = useMemo(() => {
    return baseRate * (RATE_POWER_MAP.get(interestPower) as number)
  }, [baseRate, interestPower])

  const [sliderRightKey, setSliderRightKey] = useState(2)
  const [sliderBottomKey, setSliderBottomKey] = useState(2)

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
        const res =
          baseRatePower *
          Math.pow(sliderBottomValue, powerBottom) *
          Math.pow(sliderRightValue, powerRight)

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

  if (!params || !['edit', 'create'].includes(params?.action)) {
    return <NotFound />
  }
  // if (params.action === 'edit' && (!state || isEmpty(state))) {
  //   return <NotFound title='pool not found' />
  // }
  return (
    <Container
      maxW={{
        ...RESPONSIVE_MAX_W,
        lg: 1024,
        xl: 1024,
      }}
      px={'2px'}
    >
      <H5SecondaryHeader />

      <Box mb={8}>
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
        px='20px'
        py='24px'
        bg='gray.5'
        borderRadius={24}
        mb='24px'
        flexDir={'column'}
        gap={'30px'}
      >
        {/* collection */}
        <Wrapper stepIndex={1}>
          <Box
            display={{
              md: 'block',
              sm: 'none',
              xs: 'none',
            }}
          >
            <AsyncSelectCollection
              {...collectionSelectorProps}
              w='240px'
              disabledArr={collectionAddressWithPool}
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
            <AsyncSelectCollection {...collectionSelectorProps} />
          </Box>
          {!isEmpty(selectCollection) && (
            <Text position={'absolute'} right={0} bottom={'-20px'}>
              Current Floor Price:
              {selectCollection?.nftCollection?.nftCollectionStat?.floorPrice}
              {UNIT}
            </Text>
          )}
        </Wrapper>
        {/* 贷款比例 collateral */}
        <Wrapper stepIndex={2}>
          <SliderWrapper
            defaultValue={4}
            data={COLLATERAL_KEYS}
            min={COLLATERAL_KEYS[0]}
            max={COLLATERAL_KEYS[COLLATERAL_KEYS.length - 1]}
            step={1}
            label={`${
              (COLLATERAL_MAP.get(selectCollateralKey) as number) / 100
            } %`}
            onChange={(target) => {
              setSelectCollateralKey(target)
            }}
            w='340px'
          />
          {!isEmpty(selectCollection) && (
            <Text position={'absolute'} right={0} bottom={'-20px'}>
              Current Maxdmum Loan Amount:
              {(selectCollection?.nftCollection?.nftCollectionStat?.floorPrice *
                (COLLATERAL_MAP.get(selectCollateralKey) as number)) /
                10000}
              {UNIT}
            </Text>
          )}
        </Wrapper>
        {/* 贷款天数 tenor */}
        <Wrapper stepIndex={3}>
          <SliderWrapper
            defaultValue={5}
            data={TENOR_KEYS}
            min={TENOR_KEYS[0]}
            max={TENOR_KEYS[TENOR_KEYS.length - 1]}
            step={1}
            label={`${TENOR_MAP.get(selectTenorKey)} Days`}
            onChange={(target) => {
              setSelectTenorKey(target)
            }}
          />
        </Wrapper>
        {/* 贷款比率 */}
        <Wrapper stepIndex={4}>
          <SliderWrapper
            defaultValue={5}
            data={RATE_POWER_KEYS}
            min={RATE_POWER_KEYS[0]}
            max={RATE_POWER_KEYS[RATE_POWER_KEYS.length - 1]}
            step={1}
            w='340px'
            label={`${(baseRatePower / 100)?.toFixed(2)}%`}
            onChange={(target) => {
              setInterestPower(target)
            }}
          />
        </Wrapper>
        {/* 表格 */}
        <Flex
          alignItems={'center'}
          justify={showFlexibility ? 'space-between' : 'center'}
        >
          <Box bg='white' w={'90%'} borderRadius={16}>
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
                    (value: string, i: number) => (
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
                            value={`${BigNumber(value)
                              .dividedBy(100)
                              .toFormat(2)}%`}
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
          >
            <Slider
              orientation='vertical'
              defaultValue={2}
              min={RIGHT_RATE_POWER_KEYS[0]}
              max={RIGHT_RATE_POWER_KEYS[RIGHT_RATE_POWER_KEYS.length - 1]}
              h='132px'
              step={1}
              onChange={(target) => {
                console.log(target, 'xx')
                // setSliderValue(target)
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
          </Flex>
        </Flex>
        {/* 切换展示微调滑杆 */}
        <Flex
          justify={'center'}
          hidden={showFlexibility}
          onClick={toggleShowFlexibility}
        >
          <Button variant={'link'}>Fine-tune interest rates</Button>
        </Flex>

        <Flex hidden={!showFlexibility} justify={'center'} mt='20px'>
          <Slider
            min={BOTTOM_RATE_POWER_KEYS[0]}
            max={BOTTOM_RATE_POWER_KEYS[BOTTOM_RATE_POWER_KEYS.length - 1]}
            w='140px'
            step={1}
            defaultValue={2}
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
        </Flex>
      </Flex>

      <Flex justify={'center'} mb={'40px'}>
        {params.action === 'create' && (
          <CreatePoolButton
            variant={'primary'}
            w='240px'
            h='52px'
            isDisabled={
              isEmpty(selectCollection) ||
              collectionAddressWithPool?.includes(
                selectCollection?.contractAddress?.toLowerCase(),
              )
            }
            data={{
              poolMaximumPercentage: COLLATERAL_MAP.get(
                selectCollateralKey,
              ) as number,
              poolMaximumDays: TENOR_MAP.get(selectTenorKey) as number,
              allowCollateralContract:
                selectCollection?.contractAddress as string,
              floorPrice: selectCollection?.nftCollection?.nftCollectionStat
                ?.floorPrice as number,
              poolMaximumInterestRate: baseRatePower,
              loanRatioPreferentialFlexibility: RIGHT_RATE_POWER_MAP.get(
                sliderRightKey,
              ) as number,
              loanTimeConcessionFlexibility: BOTTOM_RATE_POWER_MAP.get(
                sliderBottomKey,
              ) as number,
            }}
          >
            Confirm
          </CreatePoolButton>
        )}
        {params.action === 'edit' && (
          <UpdatePoolItemsButton
            data={{
              poolMaximumInterestRate: 1000,
              loanRatioPreferentialFlexibility: 0.98,
              loanTimeConcessionFlexibility: 0.98,
              selectCollateral: COLLATERAL_MAP.get(
                selectCollateralKey,
              ) as number,
              selectTenor: TENOR_MAP.get(selectTenorKey) as number,
            }}
          >
            Confirm
          </UpdatePoolItemsButton>
        )}
      </Flex>
    </Container>
  )
}

export default Create

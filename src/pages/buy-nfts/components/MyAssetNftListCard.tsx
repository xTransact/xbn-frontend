import {
  type ModalHeaderProps,
  Box,
  Card,
  CardBody,
  CardFooter,
  type CardProps,
  Flex,
  Text,
  Button,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  type ImageProps,
  Modal,
  type FlexProps,
  Highlight,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Heading,
  useToast,
  Divider,
} from '@chakra-ui/react'
import useHover from 'ahooks/lib/useHover'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs, { unix } from 'dayjs'
import isEqual from 'lodash-es/isEqual'
import {
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  apiGetCollectionDetail,
  apiGetListings,
  apiGetLoans,
  apiPostListing,
} from '@/api'
import {
  CustomNumberInput,
  ImageWithFallback,
  ListingTag,
  LoadingComponent,
  MortgagedTag,
  Select,
  SvgComponent,
} from '@/components'
import { FORMAT_NUMBER, LIST_DURATION, UNIT, LISTING_TYPE } from '@/constants'
import { useIsMobile, useWallet } from '@/hooks'
import { wei2Eth } from '@/utils/unit-conversion'

const MODEL_HEADER_PROPS: ModalHeaderProps = {
  pt: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  fontSize: '28px',
  fontWeight: '700',
  position: 'sticky',
  top: 0,
  bg: 'white',
  zIndex: 2,
  display: 'flex',
  justifyContent: 'space-between',
  px: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  borderRadius: 16,
}

const DURATION_PROPS = {
  placeholder: 'Please select',
  h: '60px',
  borderColor: 'var(--chakra-colors-gray-4)',
  img: <SvgComponent svgId='icon-calendar' ml='12px' svgSize={'20px'} />,
}

export type ListDataType = {
  assetData?: {
    tokenID?: string
    name?: string
    imagePreviewUrl?: string
  }
  contractData?: MyAssetListItemType
}

type CollectionDataType = {
  name: string
  safelistRequestStatus: string
  floorPrice: number
  creatorEarn: number
  marketPlaceFee: number
}

type LoanDataType = {
  // 未偿贷款本金+利息 wei
  outstandingLoan?: BigNumber
  // 贷款结束的时间
  loanEndedTime?: number
}

export type ListModalType = 'create' | 'cancel' | undefined

const NftInfoBox: FunctionComponent<
  FlexProps & {
    data?: ListDataType['assetData']
    price?: string
    collectionData?: CollectionDataType
  }
> = ({ data, price, collectionData, ...rest }) => {
  return (
    <Flex
      justify={'space-between'}
      py='24px'
      borderBottomColor={'gray.2'}
      borderBottomWidth={1}
      alignItems={'center'}
      w={{
        md: '486px',
        sm: '280px',
        xs: '280px',
      }}
      {...rest}
    >
      <Flex gap={'12px'} alignItems={'center'}>
        <ImageWithFallback
          src={data?.imagePreviewUrl}
          boxSize={'64px'}
          borderRadius={8}
          fit={'contain'}
        />
        <Box
          w={{
            md: '320px',
            sm: '100px',
            xs: '100px',
          }}
        >
          <Text fontSize={'20px'} fontWeight={'700'} noOfLines={1}>
            {data?.name || `#${data?.tokenID || ''}`}
          </Text>
          <Flex alignItems={'center'}>
            <Text fontSize={'14px'}>{collectionData?.name}</Text>
            {collectionData?.safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>
        </Box>
      </Flex>

      <Flex flexDir={'column'} alignItems={'flex-end'}>
        <Text color='gray.3' fontSize={'12px'}>
          Listing price
        </Text>
        <Text fontWeight={'700'}>
          {Number(price) === 0 ? '---' : price}
          {UNIT}
        </Text>
      </Flex>
    </Flex>
  )
}

const Item: FunctionComponent<
  FlexProps & {
    label: string
    value: string | ReactNode
  }
> = ({ label, value, color = 'gray.3', fontWeight = '500', ...rest }) => {
  return (
    <Flex justify={'space-between'} {...rest}>
      <Text color={color} fontWeight={fontWeight}>
        {label}
      </Text>
      <Flex gap={'8px'}>
        {typeof value === 'string' ? (
          <Text color={color} fontWeight={fontWeight} noOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
      </Flex>
    </Flex>
  )
}

// 目前还不知道怎么获取
const gas = 0

const MyAssetNftListCard: FunctionComponent<
  {
    data: ListDataType
    imageSize: ImageProps['boxSize']
    onRefreshList: () => void
  } & CardProps
> = ({ data, onRefreshList, imageSize, ...rest }) => {
  const { assetData, contractData } = data
  const { currentAccount } = useWallet()
  const navigate = useNavigate()

  const ish5 = useIsMobile()

  // loan_status: 0 表示资产的贷款还未还清，1 表示完全拥有的（贷款已还清或者通过其它途径购买的）
  const isMortgaged = useMemo(() => contractData?.mortgaged, [contractData])

  const isListing = useMemo(
    () => contractData?.listed_with_mortgage,
    [contractData],
  )

  const title = useMemo(() => {
    const unFormatName = assetData?.name || `#${contractData?.token_id || ''}`
    if (ish5) {
      const isLonger = unFormatName?.length > 20
      return isLonger ? `${unFormatName.substring(0, 20)}...` : unFormatName
    }
    return `${unFormatName}`
  }, [contractData, assetData, ish5])

  const [type, setType] = useState<ListModalType>()
  const closeModal = useCallback(() => setType(undefined), [])

  const [price, setPrice] = useState<string>()

  const [durationValue, setDurationValue] = useState<number>()
  const [collectionData, setCollectionData] = useState<CollectionDataType>()
  const [loanData, setLoanData] = useState<LoanDataType>()
  const [lastCancelDiffTime, setLastCancelDiffTime] = useState<number>(Infinity)

  useEffect(() => {
    if (type === 'cancel') return
    setPrice(undefined)
    setDurationValue(undefined)
  }, [type])
  const { loading: getListingLoading } = useRequest(apiGetListings, {
    ready: type === 'cancel' && !!contractData,
    onSuccess(lData) {
      if (!lData || !lData?.length) {
        setLastCancelDiffTime(Infinity)
        return
      }
      const latestCancelDate = lData[0].updated_at
      const diff = dayjs().diff(dayjs(latestCancelDate), 'minutes')
      setLastCancelDiffTime(diff)
    },
    onError() {
      setLastCancelDiffTime(Infinity)
    },
    defaultParams: [
      {
        borrower_address: currentAccount,
        token_id: contractData?.token_id || '',
        contract_address: contractData?.asset_contract_address || '',
      },
    ],
    refreshDeps: [currentAccount, contractData],
  })

  const {
    loading: collectionLoading,
    error: collectionError,
    refresh: refreshCollection,
  } = useRequest(apiGetCollectionDetail, {
    defaultParams: [
      {
        assetContractAddresses: [contractData?.asset_contract_address || ''],
      },
    ],
    ready: !!assetData && !!type,
    onSuccess({ data: cData }) {
      const { nftCollectionsByContractAddresses } = cData

      if (!nftCollectionsByContractAddresses?.length) return
      const currentCollection = nftCollectionsByContractAddresses[0]
      const {
        nftCollection: {
          name,
          safelistRequestStatus,
          nftCollectionStat: { floorPrice },
          fees,
        },
      } = currentCollection
      const sellerFee = fees?.find((i) => i.name === 'seller_fees')?.value || 0
      const marketPlaceFee =
        fees?.find((i) => i.name === 'opensea_fees')?.value || 0
      setCollectionData({
        name,
        safelistRequestStatus,
        floorPrice,
        creatorEarn: sellerFee / 10000,
        marketPlaceFee: marketPlaceFee / 10000,
      })
    },
  })

  const {
    loading: loanLoading,
    error: loanError,
    refresh: refreshLoan,
  } = useRequest(apiGetLoans, {
    ready: !!assetData && type === 'create',
    defaultParams: [
      {
        borrower_address: currentAccount,
        nft_collateral_contract: contractData?.asset_contract_address,
        nft_collateral_id: contractData?.token_id,
      },
    ],
    debounceWait: 100,
    onSuccess(lData) {
      if (!lData || !lData?.length) {
        setLoanData(undefined)
        return
      }
      const {
        loan_start_time,
        loan_duration,
        repaid_principal,
        number_of_installments,
        installment,
      } = lData[0]
      const loanWei = BigNumber(installment)
        .multipliedBy(number_of_installments)
        .minus(repaid_principal)
      const unFormatLoanEth = wei2Eth(loanWei)

      setLoanData({
        outstandingLoan:
          !!unFormatLoanEth && unFormatLoanEth !== '--'
            ? BigNumber(unFormatLoanEth)
            : BigNumber(0),
        loanEndedTime: loan_start_time + loan_duration,
      })
    },
  })
  const fetchInfoLoading = useMemo(
    () => collectionLoading || loanLoading || getListingLoading,
    [collectionLoading, loanLoading, getListingLoading],
  )

  const durationOptions = useMemo(() => {
    if (type !== 'create') return LIST_DURATION
    if (!loanData?.loanEndedTime) return LIST_DURATION
    const { loanEndedTime } = loanData
    // 计算贷款结束时间距离当前的天数差，可选 duration 只能小于等于这个天数差
    // const diff = round(
    //   (loanEndedTime - dayjs(new Date()).unix()) / 60 / 60 / 24,
    // )
    const loanEnded = unix(loanEndedTime)
    const diff = loanEnded.diff(dayjs(), 'days', true)
    if (diff < 0) return []
    const index = LIST_DURATION.findIndex((i) => {
      return i > diff
    })
    return LIST_DURATION.slice(0, index)
  }, [loanData, type])

  /**
   *
   * 拉取当前最低地板价、最高地板价，给用户作为输入的参考
   * 可输入的最小金额： 这个抵押品对应 loan 的“未偿贷款本金+利息”/(1-服务费-用户输入的版税）+ 预估清算所需的 gas 费
   * 输入的金额低于地板价，但是不低于可输入的最小金额，给与橙色提醒
   * 输入的金额低于可输入的最小金额，按钮置灰，不可提交挂单
   * 用户挂单需要支付gas费，挂单之后修改条件或撤销挂单，需要再次支付gas费
   */
  const minInput = useMemo(() => {
    if (type !== 'create') return
    if (!loanData?.outstandingLoan) return
    if (!collectionData) return
    const { outstandingLoan } = loanData

    const { creatorEarn, marketPlaceFee } = collectionData
    const res =
      outstandingLoan
        .dividedBy(BigNumber(1).minus(marketPlaceFee).minus(creatorEarn))
        .plus(gas) || BigNumber(0)

    return res
  }, [loanData, collectionData, type])

  // list amount 需要大于最小可输入值
  const isAmountError = useMemo(
    () => !!price && !!minInput && minInput?.gt(price),
    [minInput, price],
  )

  // total potential earning
  const potentialEarns = useMemo(() => {
    if (type !== 'create') return
    if (!price || !collectionData || !loanData?.outstandingLoan) return
    const { outstandingLoan } = loanData
    const listPrice = BigNumber(price)
    return listPrice
      .multipliedBy(
        1 -
          Number(collectionData?.creatorEarn) -
          Number(collectionData?.marketPlaceFee),
      )
      .minus(outstandingLoan)
      .toFormat(8)
  }, [price, collectionData, loanData, type])

  const ref = useRef(null)
  const isHovering = useHover(ref)

  const show = useMemo(() => isHovering || ish5, [ish5, isHovering])

  const isChanged = useMemo(() => {
    if (type === 'cancel') return true
    return !isEqual(
      {},
      {
        price,
        durationValue,
      },
    )
  }, [price, durationValue, type])

  const { runAsync, loading: listingLoading } = useRequest(apiPostListing, {
    manual: true,
  })

  const handleListing = useCallback(async () => {
    try {
      if (!contractData || !durationValue || !price || !currentAccount) return
      const expiration_time = dayjs().add(durationValue, 'days').unix()
      // create list
      const POST_PARAMS = {
        type: LISTING_TYPE.LISTING,
        platform: 'opensea',
        contract_address: contractData?.asset_contract_address,
        token_id: contractData?.token_id,
        network: 'eth',
        currency: 'eth',
        qty: Number(contractData?.qty),
        price,
        expiration_time,
        borrower_address: currentAccount,
      }
      await runAsync(POST_PARAMS)
      navigate('/xlending/buy-nfts/complete', {
        state: {
          imageUrl: assetData?.imagePreviewUrl,
        },
      })
    } catch (error) {
      console.log(
        '🚀 ~ file: MyAssetNftListCard.tsx:464 ~ handleListing ~ error:',
        error,
      )
    }
  }, [
    contractData,
    runAsync,
    durationValue,
    price,
    currentAccount,
    assetData,
    navigate,
  ])

  const toast = useToast()
  const handleCancelList = useCallback(async () => {
    try {
      if (!contractData || !currentAccount) return
      // create list
      const POST_PARAMS = {
        type: LISTING_TYPE.CANCEL,
        platform: 'opensea',
        contract_address: contractData?.asset_contract_address,
        token_id: contractData?.token_id,
        network: 'eth',
        currency: 'eth',
        qty: Number(contractData?.qty),
        borrower_address: currentAccount,
      }
      await runAsync(POST_PARAMS)
      closeModal()
      onRefreshList()
      toast({
        status: 'success',
        title: 'Cancel successfully',
      })
    } catch (error) {
      console.log(
        '🚀 ~ file: MyAssetNftListCard.tsx:464 ~ handleListing ~ error:',
        error,
      )
    }
  }, [runAsync, onRefreshList, contractData, currentAccount, toast, closeModal])

  return (
    <>
      <Card
        _hover={{
          boxShadow: `var(--chakra-colors-gray-2) 0px 0px 3px`,
        }}
        cursor='pointer'
        borderRadius={16}
        w='100%'
        h={'100%'}
        boxShadow='none'
        borderColor={'gray.2'}
        borderWidth='1px'
        ref={ref}
        {...rest}
      >
        <CardBody p={0} border='none'>
          <Box
            bg={'white'}
            borderTopRadius={16}
            overflow='hidden'
            pos={'relative'}
            w='100%'
          >
            <ImageWithFallback
              src={assetData?.imagePreviewUrl}
              borderRadius={0}
              alt={title}
              boxSize={imageSize}
              fit='contain'
              transition='all 0.6s'
              _hover={{
                transform: `scale(1.2)`,
              }}
            />
            {isListing && (
              <ListingTag
                title={
                  contractData?.list_price
                    ? `${BigNumber(contractData?.list_price || '').toFormat(
                        4,
                      )} ${UNIT}`
                    : ''
                }
              />
            )}
          </Box>

          <Flex
            h={'68px'}
            justify='space-between'
            px='16px'
            alignItems={'center'}
            flexWrap={{
              md: 'nowrap',
              sm: 'wrap',
              xs: 'wrap',
            }}
            pos={'relative'}
          >
            <Text
              fontSize={{
                lg: '18px',
                md: '16px',
                sm: '16px',
                xs: '16px',
              }}
              fontWeight={'bold'}
              w={
                !isMortgaged
                  ? '100%'
                  : { xl: '70%', lg: '55%', md: '40%', sm: '100%', xs: '100%' }
              }
              noOfLines={2}
              lineHeight={'22px'}
            >
              {title}
            </Text>

            {isMortgaged && (
              <MortgagedTag
                pos={{
                  md: 'static',
                  sm: 'absolute',
                  xs: 'absolute',
                }}
                right={0}
                bottom={'6px'}
              />
            )}
          </Flex>
        </CardBody>

        <Button
          borderRadius={16}
          hidden={!isMortgaged}
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          bg='blue.1'
          color='white'
          _hover={{
            opacity: 1,
            bg: 'blue.1',
            color: 'white',
          }}
          h={
            show
              ? {
                  lg: '56px',
                  md: '48px',
                  sm: '36px',
                  xs: '36px',
                }
              : '0'
          }
          position='absolute'
          bottom={0}
          right={0}
          left={0}
          transition='all 0.15s'
          onClick={() => {
            if (isListing) {
              // 正在 listing 中
              setType('cancel')
              return
            }
            setType('create')
          }}
        >
          {show && !isListing && 'List for sale'}
          {show && isListing && 'Cancel'}
        </Button>

        <CardFooter
          h={{
            lg: '56px',
            md: '48px',
            sm: '36px',
            xs: '36px',
          }}
          justify={'center'}
          alignItems='center'
          borderBottomRadius={16}
        />
      </Card>
      {/* create & cancel list modal */}
      <Modal
        onClose={closeModal}
        isOpen={!!type}
        isCentered
        scrollBehavior='inside'
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            md: '576px',
            sm: '326px',
            xs: '326px',
          }}
          maxH={'calc(100% - 5.5rem)'}
          borderRadius={16}
        >
          <LoadingComponent
            loading={fetchInfoLoading}
            top={0}
            borderRadius={0}
          />

          <ModalHeader {...MODEL_HEADER_PROPS}>
            {type === 'create' && 'List item'}
            {type === 'cancel' && 'Cancel Listing'}
            <SvgComponent
              svgId='icon-close'
              onClick={closeModal}
              cursor={'pointer'}
            />
          </ModalHeader>
          {/* 获取失败，阻止进行下一步 */}
          {type === 'cancel' && (
            <ModalBody
              m={0}
              p={0}
              px={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
            >
              <NftInfoBox
                data={assetData}
                price={
                  contractData?.list_price
                    ? BigNumber(contractData?.list_price).toFormat(8)
                    : '--'
                }
                collectionData={collectionData}
              />
              <Divider />
              <Text my='24px' fontWeight={'700'}>
                You can only cancel the list once within 10 minutes
              </Text>
              {/* button */}
              <Flex
                pt='12px'
                px={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
                pb={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
                position={'sticky'}
                bottom={'0px'}
                bg='white'
                mt='8px'
              >
                <Button
                  w='100%'
                  h='52px'
                  isDisabled={lastCancelDiffTime < 10}
                  isLoading={listingLoading}
                  variant='primary'
                  px='30px'
                  onClick={handleCancelList}
                >
                  Cancel
                  {lastCancelDiffTime < 10 &&
                    `(after ${10 - lastCancelDiffTime} minutes)`}
                </Button>
              </Flex>
            </ModalBody>
          )}
          {type === 'create' && (
            <ModalBody
              m={0}
              p={0}
              px={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
            >
              {!!loanError ||
              !!collectionError ||
              (!loanData && !fetchInfoLoading) ? (
                <Flex px='40px' pb='40px'>
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
                      Error, the current loan does not exist
                    </AlertTitle>
                    <Flex>
                      <AlertDescription maxWidth='sm'>
                        Please refresh and try again.
                      </AlertDescription>
                      <SvgComponent
                        svgId='icon-refresh'
                        onClick={() => {
                          if (fetchInfoLoading) return
                          refreshCollection()
                          refreshLoan()
                        }}
                        animation={
                          fetchInfoLoading ? 'loading 1s linear infinite' : ''
                        }
                        cursor={'pointer'}
                        svgSize='20px'
                      />
                    </Flex>
                  </Alert>
                </Flex>
              ) : (
                <Box hidden={!fetchInfoLoading && !loanData}>
                  {/* nft info */}
                  <NftInfoBox
                    data={assetData}
                    price={price}
                    collectionData={collectionData}
                  />
                  {/* inputs */}
                  <Flex
                    flexDir={'column'}
                    py='24px'
                    borderBottomColor={'gray.2'}
                    borderBottomWidth={1}
                  >
                    {/* Set a price */}
                    <Box>
                      <Text fontWeight={'700'} mb='16px'>
                        Set a price
                      </Text>
                      {/* 快速填充 */}
                      {!!collectionData && (
                        <Flex
                          gap={'8px'}
                          mb='16px'
                          flexWrap={{
                            md: 'nowrap',
                            sm: 'wrap',
                            xs: 'wrap',
                          }}
                        >
                          {[
                            collectionData?.floorPrice,
                            // collectionData?.maxFloorPrice,
                          ].map((item, index) => (
                            <Flex
                              justify={'center'}
                              key={item}
                              bg={
                                price === item.toString() ? 'gray.5' : 'white'
                              }
                              borderColor={'rgba(0, 0, 0, 0.2)'}
                              borderWidth={1}
                              borderRadius={8}
                              py='20px'
                              w='100%'
                              lineHeight={'18px'}
                              cursor={'pointer'}
                              _hover={{
                                bg: 'gray.5',
                              }}
                              onClick={() => setPrice(item.toString())}
                            >
                              <Highlight
                                query={['Floor', 'Top attribute']}
                                styles={{
                                  color: 'blue.1',
                                  fontWeight: '700',
                                  marginRight: '8px',
                                }}
                              >
                                {`${
                                  index === 0 ? 'Floor' : 'Top attribute'
                                } ${item} ${UNIT}`}
                              </Highlight>
                            </Flex>
                          ))}
                        </Flex>
                      )}

                      {/* input */}
                      <InputGroup mb='20px'>
                        <CustomNumberInput
                          onSetValue={(v) => setPrice(v)}
                          value={price}
                          isInvalid={isAmountError}
                        />

                        {isAmountError && (
                          <InputRightElement mr='110px' h='60px'>
                            <SvgComponent
                              svgId='icon-info'
                              svgSize='24px'
                              fill={'red.1'}
                            />
                          </InputRightElement>
                        )}
                        <InputRightElement
                          bg='gray.5'
                          h='57px'
                          borderRightRadius={8}
                          borderColor={isAmountError ? 'red.1' : 'gray.4'}
                          borderWidth={0}
                          pr='70px'
                          pl='32px'
                          top={'1.5px'}
                          right={'1px'}
                          fontWeight={'700'}
                        >
                          {UNIT}
                        </InputRightElement>
                      </InputGroup>

                      {isAmountError && !!minInput && (
                        <Text
                          my='16px'
                          flexDir={'column'}
                          color='red.1'
                          fontSize={'14px'}
                          fontWeight={'500'}
                        >
                          Minimum input:&nbsp;
                          {minInput.toFormat(FORMAT_NUMBER)}
                          <br />
                          Price cannot be less than the outstanding loan amount
                        </Text>
                      )}
                      {!!collectionData &&
                        Number(price) < collectionData?.floorPrice &&
                        !isAmountError && (
                          <Flex
                            mt='16px'
                            color='orange.1'
                            fontSize={'14px'}
                            fontWeight={'500'}
                            alignItems={'center'}
                            lineHeight={'24px'}
                          >
                            <SvgComponent
                              svgId='icon-info'
                              fill={'orange.1'}
                              svgSize='16px'
                            />
                            Price is below collection floor price of&nbsp;
                            {collectionData?.floorPrice}
                            {UNIT}
                          </Flex>
                        )}
                    </Box>
                    {/* Duration */}
                    <Box>
                      <Text fontWeight={'700'} mb='16px'>
                        Duration
                      </Text>
                      <Select
                        {...DURATION_PROPS}
                        noOptionsMessage={() => (
                          <Box>
                            <Heading fontSize={'16px'}>
                              No options available
                            </Heading>
                            <Text fontSize={'12px'} mt='10px'>
                              Loan ends &nbsp;
                              {unix(loanData?.loanEndedTime || 0).format(
                                'YYYY/MM/DD',
                              )}
                            </Text>
                          </Box>
                        )}
                        onChange={(e: any) =>
                          setDurationValue(e?.value as number)
                        }
                        options={durationOptions?.map((item) => ({
                          label: `${item} Days`,
                          value: item,
                        }))}
                      />
                      {/* 换算美元 */}
                      {/* <Text
                fontSize={'14px'}
                fontWeight={'500'}
                mt='12px'
                color='gray.3'
              >
                $10000 Total
              </Text> */}
                    </Box>
                  </Flex>

                  {/* price summary */}
                  <Flex flexDir={'column'} gap={'12px'} py='24px'>
                    <Item
                      label='Listing price'
                      value={`${
                        !price || Number(price) === 0 ? '---' : price
                      } ${UNIT}`}
                    />
                    <Item
                      label='Creator earnings'
                      value={`${
                        collectionData
                          ? collectionData?.creatorEarn * 100
                          : '---'
                      }%`}
                    />
                    <Item
                      label='Market Place Fee'
                      value={
                        Number(collectionData?.marketPlaceFee) === 0 ? (
                          <Text color={'green.1'} fontWeight={'700'}>
                            <Highlight
                              query={`${
                                Number(collectionData?.marketPlaceFee) * 100
                              }%`}
                              styles={{
                                color: 'black.1',
                                textDecoration: 'line-through',
                              }}
                            >{`${
                              Number(collectionData?.marketPlaceFee) * 100
                            }% 0%`}</Highlight>
                          </Text>
                        ) : (
                          <Text color={'black.1'} fontWeight={'700'}>
                            {Number(collectionData?.marketPlaceFee || 0) * 100}%
                          </Text>
                        )
                      }
                    />
                    <Item
                      label='Total potential earnings'
                      value={`${
                        !potentialEarns || isAmountError
                          ? '---'
                          : potentialEarns
                      } ${UNIT}`}
                      color={'black.1'}
                      fontWeight={'700'}
                    />
                  </Flex>

                  {/* button */}
                  <Flex
                    pt='12px'
                    px={{
                      md: '40px',
                      sm: '20px',
                      xs: '20px',
                    }}
                    pb={{
                      md: '40px',
                      sm: '20px',
                      xs: '20px',
                    }}
                    position={'sticky'}
                    bottom={'0px'}
                    bg='white'
                  >
                    <Button
                      onClick={handleListing}
                      variant={'primary'}
                      w='100%'
                      h='52px'
                      isDisabled={
                        !durationValue || !isChanged || !price || isAmountError
                      }
                      isLoading={listingLoading}
                    >
                      Complete listing
                    </Button>
                  </Flex>
                </Box>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default MyAssetNftListCard

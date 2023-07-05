import {
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Button,
  ModalHeader,
  FormControl,
  FormLabel,
  Text,
  type ButtonProps,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Flex,
  Tooltip,
  Box,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import isEmpty from 'lodash-es/isEmpty'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
} from 'react'

import { apiGetFloorPrice } from '@/api'
import {
  ConnectWalletModal,
  CustomNumberInput,
  LoadingComponent,
  SvgComponent,
} from '@/components'
import { useCatchContractError, useWallet } from '@/hooks'
import { createWethContract, createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import AmountItem from './AmountItem'

/**
 * update pool amount
 * use updatePool
 */
const UpdatePoolAmountButton: FunctionComponent<
  ButtonProps & {
    poolData: PoolsListItemType
    collectionSlug: string
    onSuccess: () => void
  }
> = ({ children, poolData, collectionSlug, onSuccess, ...rest }) => {
  const {
    pool_used_amount,
    pool_id,
    pool_amount,
    maximum_loan_amount,
    pool_maximum_percentage,
    pool_maximum_days,
    pool_maximum_interest_rate,
    loan_ratio_preferential_flexibility,
    loan_time_concession_flexibility,
  } = poolData

  const { toast, toastError } = useCatchContractError()
  const { currentAccount, interceptFn, isOpen, onClose } = useWallet()
  const {
    isOpen: isOpenUpdate,
    onOpen: onOpenUpdate,
    onClose: onCloseUpdate,
  } = useDisclosure()

  const [floorPrice, setFloorPrice] = useState<number>()

  const { loading } = useRequest(apiGetFloorPrice, {
    ready: !!collectionSlug && isOpenUpdate,
    // cacheKey: 'staleTime-floorPrice',
    // staleTime: 1000 * 60,
    defaultParams: [
      {
        slug: collectionSlug,
      },
    ],
    refreshDeps: [collectionSlug, isOpenUpdate],
    onSuccess(data) {
      if (isEmpty(data)) return
      setFloorPrice(data.floor_price)
    },
    onError: () => {
      toast({
        title: 'Network problems, please refresh and try again',
        status: 'error',
        duration: 3000,
      })
    },
  })

  const [updateLoading, setUpdateLoading] = useState(false)

  const [amount, setAmount] = useState('')

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const [errorMsg, setErrorMsg] = useState('')
  const fetchLatestWethBalance = useCallback(async () => {
    const wethContract = createWethContract()
    return await wethContract.methods.balanceOf(currentAccount).call()
  }, [currentAccount])

  const { loading: refreshLoading, data: wethData } = useRequest(
    fetchLatestWethBalance,
    {
      retryCount: 5,
      ready: !!currentAccount,
    },
  )

  /**
   * Your balance = LP设定的数值
   * Has been lent = 这个pool当前进行中的贷款，尚未归还的本金金额
   * Can ben lent=Your balance - Has been lent （如果相减结果为负数，则显示0）
   */
  const AmountDataItems = useMemo(
    () => [
      {
        data: formatFloat(wei2Eth(pool_amount)),
        label: 'Pool Size',
        loading: false,
      },
      {
        data: pool_used_amount ? formatFloat(wei2Eth(pool_used_amount)) : 0,
        label: 'Has Been Lent',
        loading: false,
      },
      {
        data: formatFloat(wei2Eth(pool_amount - pool_used_amount)),
        label: 'Can Be Lent',
        loading: false,
      },
    ],
    [pool_used_amount, pool_amount],
  )

  const isError = useMemo(() => {
    if (!floorPrice) return false
    if (!amount) return false
    /**
     * 校验逻辑：Has been lent + Available in wallet 需要大于等于 Your balance
     * 如果两者相加小于 Your balance，则点击Approve/Comfirm按钮用toast报错：Insufficient Max input：xxx
     * xxx = Has been lent + Available in wallet
     *     = poolUsedAmount + latest weth
     */
    const NumberAmount = Number(amount)
    const maxAmount = wei2Eth(Number(pool_used_amount) + Number(wethData))
    if (maxAmount === undefined) {
      setErrorMsg(`Insufficient funds: 0 WETH`)
      return true
    }
    if (NumberAmount > maxAmount) {
      setErrorMsg(
        `Insufficient funds: still need to deposit ${formatFloat(
          NumberAmount - maxAmount,
        )} WETH`,
      )
      return true
    }
    if (NumberAmount < (floorPrice * pool_maximum_percentage) / 10000) {
      setErrorMsg(
        `Insufficient funds, Min input: ${formatFloat(
          (floorPrice * pool_maximum_percentage) / 10000,
        )}`,
      )
      return true
    }
    return false
  }, [amount, floorPrice, pool_used_amount, wethData, pool_maximum_percentage])

  const onConfirm = useCallback(() => {
    interceptFn(async () => {
      /**
       * 平均总耗时：
       * 1676961248463 - 1676961180777 =  67686 ms ≈ 1min
       */
      if (amount === wei2Eth(pool_amount)?.toString()) {
        toast({
          status: 'info',
          title: `The pool size is already ${wei2Eth(pool_amount)}`,
        })
        return
      }
      try {
        const parsedWeiAmount = eth2Wei(amount)?.toString()
        setUpdateLoading(true)

        const xBankContract = createXBankContract()
        await xBankContract.methods
          .updatePool(
            pool_id,
            parsedWeiAmount,
            maximum_loan_amount.toString(),
            pool_maximum_percentage.toString(),
            pool_maximum_days.toString(),
            pool_maximum_interest_rate.toString(),
            loan_ratio_preferential_flexibility.toString(),
            loan_time_concession_flexibility.toString(),
          )
          .send({
            from: currentAccount,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
          })
        setTimeout(() => {
          setUpdateLoading(false)
          onCloseUpdate()
          if (toast.isActive('Updated-Successfully-ID')) {
            // toast.closeAll()
          } else {
            toast({
              status: 'success',
              title: 'Updated successfully! ',
              id: 'Updated-Successfully-ID',
            })
          }
          onSuccess()
        }, 1000)
      } catch (error: any) {
        toastError(error)
        setUpdateLoading(false)
      }
    })
  }, [
    onSuccess,
    pool_amount,
    amount,
    toast,
    currentAccount,
    interceptFn,
    onCloseUpdate,
    pool_id,
    toastError,
    maximum_loan_amount,
    pool_maximum_percentage,
    pool_maximum_days,
    pool_maximum_interest_rate,
    loan_ratio_preferential_flexibility,
    loan_time_concession_flexibility,
  ])

  const handleClose = useCallback(() => {
    if (updateLoading) return
    onCloseUpdate()
  }, [onCloseUpdate, updateLoading])

  const defaultAmount = useMemo(() => {
    if (!floorPrice || !pool_maximum_percentage) return ''
    return `${(floorPrice * pool_maximum_percentage) / 10000}`
  }, [floorPrice, pool_maximum_percentage])

  const expectedLoanCount = useMemo(() => {
    const res = BigNumber(amount)
      .dividedBy(defaultAmount)
      .integerValue(BigNumber.ROUND_DOWN)
    if (res.isNaN()) return 0
    return res.toString()
  }, [defaultAmount, amount])
  return (
    <>
      <Button onClick={() => interceptFn(() => onOpenUpdate())} {...rest}>
        {children}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpenUpdate}
        onClose={handleClose}
        isCentered
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            xl: '576px',
            lg: '576px',
            md: '400px',
            sm: '326px',
            xs: '326px',
          }}
          px={{ md: '40px', sm: '20px', xs: '20px' }}
          borderRadius={16}
        >
          <ModalHeader
            pt={'40px'}
            px={0}
            alignItems='center'
            display={'flex'}
            justifyContent='space-between'
          >
            <Text
              fontSize={{ md: '28px', sm: '24px', xs: '24px' }}
              fontWeight='700'
              noOfLines={1}
            >
              Reset Pool Size
            </Text>
            <SvgComponent
              svgId='icon-close'
              onClick={handleClose}
              cursor='pointer'
              svgSize='16px'
            />
          </ModalHeader>
          <ModalBody pb={'24px'} px={0} position={'relative'}>
            <LoadingComponent loading={loading} top={2} />
            {/* 数值们 */}
            <Flex
              py={{ md: '32px', sm: '20px', xs: '20px' }}
              px={{ md: '36px', sm: '10px', xs: '10px' }}
              bg={'gray.5'}
              borderRadius={16}
              justify='space-between'
              mb='32px'
            >
              {AmountDataItems.map((item) => (
                <AmountItem key={item.label} {...item} />
              ))}
            </Flex>
            <FormControl>
              <FormLabel
                fontWeight={'700'}
                display={'flex'}
                justifyContent={'space-between '}
              >
                Set pool size
                <Text fontWeight={'500'} fontSize={'14px'} color='gray.3'>
                  Min input:
                  {formatFloat(
                    ((floorPrice || 0) * pool_maximum_percentage) / 10000,
                  )}
                </Text>
              </FormLabel>
              <InputGroup>
                <InputLeftElement
                  pointerEvents='none'
                  color='gray.300'
                  fontSize='1.2em'
                  top='14px'
                >
                  <SvgComponent svgId='icon-eth' fill={'black.1'} />
                </InputLeftElement>
                <CustomNumberInput
                  w='100%'
                  value={amount}
                  onSetValue={(v) => {
                    setAmount(v)
                  }}
                  isInvalid={isError}
                  isDisabled={updateLoading || floorPrice === undefined}
                  top={'2px'}
                  px='32px'
                  placeholder='Enter amount...'
                />
              </InputGroup>

              {isError && (
                <Text mt={'8px'} color={'red.1'}>
                  {errorMsg}
                </Text>
              )}
              {!isError && !!amount && (
                <Flex mt={'8px'} color={'gray.3'}>
                  <Text fontSize={'14px'} color='blue.1' fontWeight={'700'}>
                    Expected to lend&nbsp;
                    {expectedLoanCount}
                    &nbsp;loans
                  </Text>
                  <Tooltip
                    whiteSpace={'pre-line'}
                    label={`Based on the loan amount you have set, number of loans = amount deposited / set loan amount , \nFor example: ${amount}/${formatFloat(
                      defaultAmount,
                    )} = ${expectedLoanCount}`}
                    placement='auto'
                    hasArrow={false}
                    bg='white'
                    borderRadius={8}
                    p='10px'
                    fontSize={'12px'}
                    lineHeight={'18px'}
                    fontWeight={'400'}
                    color='gray.4'
                  >
                    <Box cursor={'pointer'} ml='16px'>
                      <SvgComponent
                        svgId='icon-tip'
                        fill='gray.1'
                        fontSize={'20px'}
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              )}
            </FormControl>
          </ModalBody>

          <Button
            variant='primary'
            mr={'12px'}
            mt={'8px'}
            mb={'40px'}
            mx={{
              md: '40px',
              sm: '23px',
              xs: '23px',
            }}
            h='52px'
            isDisabled={isError || !Number(amount)}
            onClick={onConfirm}
            loadingText={'updating'}
            fontSize='16px'
            isLoading={updateLoading || refreshLoading}
          >
            Confirm
          </Button>
          {/* </ModalFooter> */}
        </ModalContent>
      </Modal>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </>
  )
}

export default UpdatePoolAmountButton

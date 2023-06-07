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
  InputRightElement,
  useDisclosure,
  Flex,
  Tooltip,
  Box,
} from '@chakra-ui/react'
import { useRequest } from 'ahooks'
import BigNumber from 'bignumber.js'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import Web3 from 'web3/dist/web3.min.js'

import {
  ConnectWalletModal,
  CustomNumberInput,
  SvgComponent,
} from '@/components'
import { WETH_CONTRACT_ADDRESS, XBANK_CONTRACT_ADDRESS } from '@/constants'
import { useCatchContractError, useWallet } from '@/hooks'
import { createWethContract, createXBankContract } from '@/utils/createContract'
import { formatFloat } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

/**
 * create pool
 * use createPool
 */
const CreatePoolButton: FunctionComponent<
  ButtonProps & {
    data: {
      poolMaximumPercentage: number
      poolMaximumDays: number
      poolMaximumInterestRate: number
      loanTimeConcessionFlexibility: number
      loanRatioPreferentialFlexibility: number
      allowCollateralContract: string
      floorPrice: number
      maxSingleLoanAmount: string
    }
  }
> = ({ children, data, ...rest }) => {
  const {
    poolMaximumPercentage,
    poolMaximumDays,
    poolMaximumInterestRate,
    loanTimeConcessionFlexibility,
    loanRatioPreferentialFlexibility,
    allowCollateralContract,
    floorPrice,
    maxSingleLoanAmount,
  } = data
  const { toast, toastError } = useCatchContractError()
  const timer = useRef<NodeJS.Timeout>()
  const navigate = useNavigate()
  const { currentAccount, interceptFn, isOpen, onClose } = useWallet()
  const {
    isOpen: isOpenApprove,
    onOpen: onOpenApprove,
    onClose: onCloseApprove,
  } = useDisclosure()

  const [approveLoading, setApproveLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)

  // useEffect(() => {
  //   const web3 = createWeb3Provider()
  //   web3.eth.clearSubscriptions()
  //   return () => {
  //     web3.eth.clearSubscriptions()
  //   }
  // }, [])

  const [amount, setAmount] = useState('')
  const defaultAmount = useMemo(() => {
    if (!floorPrice || !poolMaximumPercentage) return ''
    return `${(floorPrice * poolMaximumPercentage) / 10000}`
  }, [floorPrice, poolMaximumPercentage])

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
   * Your balance = LP 设定的数值
   * Has been lent = 这个 pool 当前进行中的贷款，尚未归还的本金金额
   * Can ben lent = Your balance - Has been lent （如果相减结果为负数，则显示0）
   */

  const isError = useMemo(() => {
    //  amount < balance + Has been lent
    if (!amount) return false
    const wethNum = wei2Eth(wethData)
    if (!wethNum) {
      setErrorMsg(` Insufficient wallet balance: 0 WETH`)
      return true
    }
    const NumberAmount = Number(amount)
    if (NumberAmount > wethNum) {
      setErrorMsg(` Insufficient wallet balance: ${formatFloat(wethNum)} WETH`)
      return true
    }
    if (NumberAmount < floorPrice * 0.1) {
      setErrorMsg(
        `Insufficient funds, Minimum input: ${formatFloat(
          (floorPrice * poolMaximumPercentage) / 10000,
        )}`,
      )
      return true
    }
    return false
  }, [amount, wethData, floorPrice, poolMaximumPercentage])

  const onConfirm = useCallback(() => {
    interceptFn(async () => {
      /**
       * 平均总耗时：
       * 1676961248463 - 1676961180777 =  67686 ms ≈ 1min
       */
      // 预计算
      const UNIT256MAX =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      try {
        const parsedWeiAmount = eth2Wei(amount)?.toString()
        const parsedWeiMaximumLoanAmount =
          eth2Wei(maxSingleLoanAmount)?.toString()

        const wethContract = createWethContract()
        setApproveLoading(true)
        const _allowance = await wethContract.methods
          .allowance(currentAccount, XBANK_CONTRACT_ADDRESS)
          .call()

        const allowanceHex = Web3.utils.toHex(_allowance)
        if (allowanceHex !== UNIT256MAX) {
          console.log('approve 阶段')

          await wethContract.methods
            .approve(XBANK_CONTRACT_ADDRESS, UNIT256MAX)
            .send({
              from: currentAccount,
            })
        }
        setApproveLoading(false)
        setCreateLoading(true)

        // const supportERC20Denomination = approveHash?.to
        const supportERC20Denomination = WETH_CONTRACT_ADDRESS
        const xBankContract = createXBankContract()
        const createBlock = await xBankContract.methods
          .createPool(
            // supportERC20Denomination
            supportERC20Denomination,
            // allowCollateralContract
            allowCollateralContract,
            // poolAmount
            parsedWeiAmount,
            parsedWeiMaximumLoanAmount,
            // poolMaximumPercentage,
            poolMaximumPercentage,
            // uint32 poolMaximumDays,
            poolMaximumDays,
            // uint32 poolMaximumInterestRate,
            poolMaximumInterestRate,
            // uint32 loanTimeConcessionFlexibility,
            loanTimeConcessionFlexibility * 10000,
            // uint32 loanRatioPreferentialFlexibility
            loanRatioPreferentialFlexibility * 10000,
          )
          .send({
            from: currentAccount,
          })
        console.log(createBlock, 'createBlock')
        setCreateLoading(false)
        setSubscribeLoading(true)
        // 监听 pool 有 bug，排期修复
        // 监听 pool 是否生成
        // xBankContract.events
        //   .PoolCreated(
        //     {
        //       filter: {
        //         poolOwnerAddress: currentAccount,
        //       },
        //       fromBlock: createBlock?.BlockNumber || 'latest',
        //     },
        //     (error: any, event: any) => {
        //       console.log(event, error, 'aaaaa')
        //     },
        //   )
        //   .on('data', function (event: any) {
        //     console.log(event, 'on data') // same results as the optional callback above
        //     if (toast.isActive('Created-Successfully-ID')) {
        //       // toast.closeAll()
        //     } else {
        //       toast({
        //         status: 'success',
        //         title: 'Created successfully! ',
        //         id: 'Created-Successfully-ID',
        //       })
        //     }
        //     setSubscribeLoading(false)
        //     onCloseApprove()
        //     navigate('/lending/my-pools')
        //   })
        //   .on('changed', console.log)
        //   .on('error', console.error)

        // 如果一直监听不到
        timer.current = setTimeout(() => {
          // toast({
          //   status: 'info',
          //   title: 'The pool is being generated, please wait and refresh later',
          // })
          toast({
            status: 'success',
            title: 'Created successfully! ',
            id: 'Created-Successfully-ID',
          })
          navigate('/lending/my-pools')
        }, 5 * 1000)
      } catch (error: any) {
        toastError(error)
        setCreateLoading(false)
        setApproveLoading(false)
      }
    })
  }, [
    amount,
    toastError,
    toast,
    poolMaximumPercentage,
    poolMaximumDays,
    poolMaximumInterestRate,
    loanRatioPreferentialFlexibility,
    loanTimeConcessionFlexibility,
    allowCollateralContract,
    currentAccount,
    interceptFn,
    navigate,
    maxSingleLoanAmount,
  ])

  const handleClose = useCallback(() => {
    if (approveLoading || createLoading) return
    onCloseApprove()
  }, [onCloseApprove, approveLoading, createLoading])

  return (
    <>
      <Button onClick={() => interceptFn(() => onOpenApprove())} {...rest}>
        {children}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpenApprove}
        onClose={handleClose}
        isCentered
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          borderRadius={16}
          maxW={{
            xl: '576px',
            lg: '576px',
            md: '400px',
            sm: '326px',
            xs: '326px',
          }}
          px={{ md: '40px', sm: '20px', xs: '20px' }}
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
            >
              Approve WETH
            </Text>
            <SvgComponent
              svgId='icon-close'
              onClick={handleClose}
              cursor='pointer'
              svgSize='16px'
            />
          </ModalHeader>
          <ModalBody pb={'24px'} px={0}>
            {/* 数值们 */}
            {/* <Flex
              py={{ md: '32px', sm: '20px', xs: '20px' }}
              px={{ md: '36px', sm: '12px', xs: '12px' }}
              bg={`var(--chakra-colors-gray-5)`}
              borderRadius={16}
              justify='space-between'
              mb='32px'
            >
              {AmountDataItems.map((item) => (
                <AmountItem key={item.label} {...item} />
              ))}
            </Flex> */}
            <FormControl>
              <FormLabel
                fontWeight={'700'}
                display={'flex'}
                justifyContent={'space-between '}
              >
                Amount
                <Text fontWeight={'500'} fontSize={'14px'} color='gray.3'>
                  Minimum input:
                  {formatFloat((floorPrice * poolMaximumPercentage) / 10000)}
                </Text>
              </FormLabel>

              <InputGroup>
                <InputLeftElement
                  pointerEvents='none'
                  color='gray.300'
                  fontSize='1.2em'
                  top='12px'
                >
                  <SvgComponent svgId='icon-eth' fill={'black.1'} />
                </InputLeftElement>
                <CustomNumberInput
                  value={amount}
                  isInvalid={isError}
                  // lineHeight='60px'
                  placeholder='Enter the approve ETH amount...'
                  isDisabled={
                    approveLoading ||
                    createLoading ||
                    refreshLoading ||
                    subscribeLoading
                  }
                  onSetValue={(v) => setAmount(v)}
                  px={'32px'}
                />

                {isError && (
                  <InputRightElement top='14px' mr='8px'>
                    <SvgComponent svgId='icon-error' svgSize='24px' />
                  </InputRightElement>
                )}
              </InputGroup>

              {isError && (
                <Text mt={'8px'} color={'red.1'}>
                  {errorMsg}
                </Text>
              )}
              {!isError && !!amount && (
                <Flex mt={'8px'} color={'gray.3'} alignItems={'center'}>
                  <Text fontSize={'14px'} color='blue.1' fontWeight={'700'}>
                    Expected to lend&nbsp;
                    {BigNumber(amount)
                      .dividedBy(defaultAmount)
                      .integerValue(BigNumber.ROUND_DOWN)
                      .toNumber()}
                    &nbsp;loans
                  </Text>
                  <Tooltip
                    whiteSpace={'pre-line'}
                    label={`Based on the loan amount you have set, number of loans = amount deposited / set loan amount , \nFor example: ${amount}/${formatFloat(
                      defaultAmount,
                    )} = ${BigNumber(amount)
                      .dividedBy(defaultAmount)
                      .integerValue(BigNumber.ROUND_DOWN)
                      .toNumber()}`}
                    placement='bottom-start'
                    hasArrow={false}
                    bg='white'
                    borderRadius={8}
                    p='10px'
                    fontSize={'12px'}
                    lineHeight={'18px'}
                    fontWeight={'400'}
                    color='gray.4'
                    boxShadow={'0px 0px 10px #D1D6DC'}
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
            <Text
              fontSize={'12px'}
              color='gray.4'
              textAlign={'center'}
              px={'32px'}
              mt={'20px'}
            >
              This is a Georli based demo, you may need to swap your GeorliETH
              into GoerliWETH with the “Deposit” function of this DEX contract:
              {import.meta.env.VITE_WETH_CONTRACT_ADDRESS}
            </Text>
          </ModalBody>

          {/* <ModalFooter justifyContent={'center'}> */}
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
            // isDisabled={isError || !Number(amount)}
            onClick={onConfirm}
            loadingText={
              approveLoading
                ? 'approving'
                : createLoading || subscribeLoading
                ? 'creating'
                : ''
            }
            fontSize='16px'
            isLoading={
              approveLoading ||
              createLoading ||
              refreshLoading ||
              subscribeLoading
            }
          >
            Approve
          </Button>
          {/* </ModalFooter> */}
        </ModalContent>
      </Modal>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </>
  )
}

export default CreatePoolButton

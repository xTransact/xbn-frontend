import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Image,
  Box,
} from '@chakra-ui/react'
import { range } from 'lodash-es'
import { useState, type FunctionComponent, useMemo } from 'react'

import buy11 from '@/assets/buy1-1.png'
import buy12 from '@/assets/buy1-2.png'
import buy13 from '@/assets/buy1-3.png'
import buy2 from '@/assets/buy2.gif'
import buy31 from '@/assets/buy3-1.png'
import buy32 from '@/assets/buy3-2.png'
import buy42 from '@/assets/buy4-2.png'
import imgEthRound from '@/assets/eth-round.png'
import arrowImg from '@/assets/guide-arrow.png'
import { MODEL_HEADER_PROPS } from '@/pages/buy-nfts/components/MyAssetNftListCard'

import icon from '@/assets/icon-guide.svg'

export type StepItemType = {
  index: number
  title: string
  description: string
}

const StepImageComponent: FunctionComponent<{ order: number }> = ({
  order,
}) => {
  switch (order) {
    case 1:
      return (
        <Flex alignItems={'center'} w='100%' justify={'center'}>
          <Box position={'relative'} w='30%'>
            <Image src={buy11} w='160px' />

            <Text fontWeight={'500'}>Lend WETH to NFTs</Text>
          </Box>

          <Image src={arrowImg} w='64px' />
          <Flex
            w='40%'
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
          >
            <Image src={buy12} w='154px' />
            <Box transform={'rotate(90deg)'}>
              <Image src={arrowImg} w='40px' />
            </Box>
            <Image src={buy13} w='150px' h='54px' />

            <Text fontWeight={'500'} color='blue.1'>
              Get Interest on your ETH and Mystery Box
            </Text>
          </Flex>
        </Flex>
      )

    case 2:
      return (
        <Flex gap='10px' alignItems={'center'} justify={'space-between'}>
          <Image src={buy2} w='475px' h='100%' />
        </Flex>
      )

    case 3:
      return (
        <Flex justify={'center'} w='100%' alignItems={'center'}>
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w='25%'
          >
            <Image src={buy31} w='168px' />
            <Text>Borrowers locks their NFT</Text>
          </Flex>
          <Flex
            flexDir={'column'}
            justify={'center'}
            w='25%'
            alignItems={'center'}
          >
            <Image src={imgEthRound} boxSize={'54px'} />
            <Image src={arrowImg} w='64px' h='48px' />
          </Flex>
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w='25%'
          >
            <Image src={buy32} w='150px' h='180px' />
            <Text color={'blue.1'} fontWeight={'500'}>
              Once repaid the loan you got interest
            </Text>
          </Flex>
        </Flex>
      )
    case 4:
      return (
        <Flex justify={'center'} w='100%' alignItems={'center'}>
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w='30%'
          >
            <Image src={buy31} w='168px' />
            <Text>Borrower fails to repay the loan on time</Text>
          </Flex>
          <Image src={arrowImg} w='64px' h='48px' />
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w='30%'
          >
            <Image src={buy42} w='150px' h='180px' />
            <Text color={'blue.1'}>You can claim NFT to your wallet</Text>
          </Flex>
        </Flex>
      )
    default:
      return null
  }
}

export const LENDER_GUIDES: StepItemType[] = [
  {
    index: 1,
    title: 'Earning Yield by Lending on xBank',
    description:
      'Create a collection pool and set the preferred term and collateral factor ratio to provide loans to borrowers. Also adjust and set a reasonable APR so that you can lend money quickly.',
  },
  {
    index: 2,
    title: 'Create Collection Pools and Set APY',
    description:
      'Sell your NFT at any time and Enjoying price appreciation of your collection.',
  },
  {
    index: 3,
    title: 'Start Earning Interest',
    description:
      'Create a collection pool and set the preferred term and collateral factor ratio to provide loans to borrowers. Also adjust and set a reasonable APR so that you can lend money quickly.',
  },
  {
    index: 4,
    title: 'Overcollateralized with Safety',
    description:
      'If the borrower does not repay on time, you can immediately claim the NFT into your wallet and liquidate it for funds.',
  },
]

const LenderGuideModal: FunctionComponent<{
  onClose: () => void
  isOpen: boolean
}> = ({ onClose, ...rest }) => {
  const [step, setStep] = useState<number>(1)
  const { title, index, description } = useMemo(() => {
    return LENDER_GUIDES[step - 1]
  }, [step])
  return (
    <Modal
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
      scrollBehavior='inside'
      {...rest}
    >
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          xl: '900px',
          lg: '900px',
          md: '576px',
          sm: '326px',
          xs: '326px',
        }}
        maxH={'600px'}
        borderRadius={16}
        key={index}
      >
        <ModalHeader {...MODEL_HEADER_PROPS}>
          <Flex alignItems={'center'} gap='4px' fontWeight={'700'}>
            <Image src={icon} />
            {title}
          </Flex>
          {/* <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          /> */}
        </ModalHeader>
        <ModalBody
          m={0}
          p={0}
          px={{
            md: '40px',
            sm: '20px',
            xs: '20px',
          }}
        >
          <Text color='gray.4' mb='20px'>
            {description}
          </Text>
          <Flex bg='gray.5' h='300px' alignItems={'center'} justify={'center'}>
            <StepImageComponent order={index} />
          </Flex>

          {/* button */}
          <Flex
            pt='12px'
            px={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
            position={'sticky'}
            bottom={'0px'}
            bg='white'
            mt='8px'
            justify={'center'}
          >
            <Button
              w='158px'
              h='40px'
              variant={step === LENDER_GUIDES.length ? 'primary' : 'outline'}
              px='30px'
              onClick={() => {
                if (step === LENDER_GUIDES.length) {
                  setStep(1)
                  onClose()
                }
                setStep((prev) => prev + 1)
              }}
            >
              {step < LENDER_GUIDES.length ? 'Next' : 'Continue'}
            </Button>
          </Flex>
          <Flex
            pb={{
              md: '12px',
              sm: '4px',
              xs: '4px',
            }}
            gap={'8px'}
            justify={'center'}
            mt='25px'
          >
            {range(LENDER_GUIDES.length).map((i) => (
              <Box
                key={i}
                w={i + 1 === step ? '24px' : '16px'}
                h='6px'
                borderRadius={8}
                borderColor={'blue.4'}
                borderWidth={1}
                bg={i + 1 === step ? 'blue.1' : 'white'}
                onClick={() => {
                  setStep(i + 1)
                }}
                cursor={'pointer'}
              />
            ))}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default LenderGuideModal

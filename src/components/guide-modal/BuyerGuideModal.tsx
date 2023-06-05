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

import arrowImg from '@/assets/guide-arrow.png'
import lp1 from '@/assets/lp1.png'
import lp21 from '@/assets/lp2-1.png'
import lp22 from '@/assets/lp2-2.png'
import lp23 from '@/assets/lp2-3.png'
import lp31 from '@/assets/lp3-1.png'
import lp32 from '@/assets/lp3-2.png'
import { MODEL_HEADER_PROPS } from '@/pages/buy-nfts/components/MyAssetNftListCard'

import icon from '@/assets/icon-guide.svg'

import SvgComponent from '../svg-component/SvgComponent'

import type { FlexProps } from '@chakra-ui/react'

const EthComponent: FunctionComponent<
  FlexProps & { num: number; isPrimary?: boolean }
> = ({ num, isPrimary, ...rest }) => (
  <Flex alignItems={'center'} gap='2px' {...rest}>
    <SvgComponent
      svgId={isPrimary ? 'icon-eth-color' : 'icon-eth'}
      fontSize={'32px'}
    />
    <Text fontSize={'32px'} fontWeight={'900'}>
      {num}
    </Text>
  </Flex>
)

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
        <Flex>
          <Image src={lp1} w='630px' h='211px' />
        </Flex>
      )

    case 2:
      return (
        <Flex gap='10px' alignItems={'center'} justify={'space-between'}>
          <Box position={'relative'} w='30%'>
            <Image src={lp21} w='190px' />
            <EthComponent
              num={60}
              isPrimary
              position={'absolute'}
              right={'20px'}
              top={'20px'}
            />
            <Text fontWeight={'500'}>
              You can sell at anytime including the loan is outstanding{' '}
            </Text>
          </Box>
          <Box
            w='48px'
            h='16px'
            borderRadius={2}
            bg='conic-gradient(from 11.86deg at 46.81% 64.71%, #6865FF 0deg, rgba(120, 117, 255, 0) 360deg), linear-gradient(200.52deg, #F5F3FF 8.81%, #A494FF 70.86%, #FFFFFF 90.41%)'
          />
          <Flex
            w='30%'
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
          >
            <EthComponent num={50} />
            <Image src={lp22} w='140px' />
            <Text fontWeight={'500'}>Automatically repaid upon sale</Text>
          </Flex>
          <Image src={arrowImg} w='64px' />
          <Flex
            w='30%'
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
          >
            <EthComponent num={10} isPrimary />
            <Image src={lp23} w='140px' />
            <Text fontWeight={'500'}>You got profits</Text>
          </Flex>
        </Flex>
      )

    case 3:
      return (
        <Flex justify={'space-around'} w='100%' alignItems={'center'}>
          <Flex flexDir={'column'} justify={'center'} alignItems={'center'}>
            <Image src={lp31} w='160px' />
            <Text>You can settle your loan anytime</Text>
          </Flex>
          <Image src={arrowImg} w='64px' h='48px' />
          <Flex flexDir={'column'} justify={'center'} alignItems={'center'}>
            <Image src={lp32} w='200px' />
            <Text>You owned</Text>
          </Flex>
        </Flex>
      )
    default:
      return null
  }
}

export const BUYER_GUIDES: StepItemType[] = [
  {
    index: 1,
    title: 'Buy NFT Pay Later, No Hiking Interest',
    description:
      'Buy Top NFTs with only a fraction of the cost up front. The rest is borrowed. Pay back your borrow later or sell your NFT and get mystery boxs.',
  },
  {
    index: 2,
    title: 'Collateral Selling',
    description:
      'Sell your NFT at any time and Enjoying price appreciation of your collection.',
  },
  {
    index: 3,
    title: 'Repay to Take Full Ownership of NFT.',
    description:
      'You can repay your loan in multiple instalments, or you can settle early in one go. Depending on the changing dynamics of the NFT market, you can be flexible and close the loan to own the NFT completely.',
  },
]

const BuyerGuideModal: FunctionComponent<{
  onClose: () => void
  isOpen: boolean
}> = ({ onClose, ...rest }) => {
  const [step, setStep] = useState<number>(1)
  const { title, index, description } = useMemo(() => {
    return BUYER_GUIDES[step - 1]
  }, [step])
  return (
    <Modal onClose={onClose} isCentered scrollBehavior='inside' {...rest}>
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
          <Flex
            bg='gray.5'
            px='30px'
            h='300px'
            alignItems={'center'}
            justify={'center'}
          >
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
              variant={step === BUYER_GUIDES.length ? 'primary' : 'outline'}
              px='30px'
              onClick={() => {
                if (step === BUYER_GUIDES.length) {
                  setStep(1)
                  onClose()
                }
                setStep((prev) => prev + 1)
              }}
            >
              {step < BUYER_GUIDES.length ? 'Next' : 'Continue'}
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
            {range(BUYER_GUIDES.length).map((i) => (
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

export default BuyerGuideModal

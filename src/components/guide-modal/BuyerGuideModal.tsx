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
import range from 'lodash-es/range'
import { useState, type FunctionComponent, useMemo } from 'react'

import arrowImg from '@/assets/guide-arrow.png'
import lp11 from '@/assets/lp1-1.png'
import lp12 from '@/assets/lp1-2.png'
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
      fontSize={{ md: '32px', sm: '16px', xs: '16px' }}
    />
    <Text
      fontSize={{
        md: '32px',
        sm: '18px',
        xs: '18px',
      }}
      fontWeight={'900'}
      color={isPrimary ? 'blue.1' : 'black.1'}
    >
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
        <Flex
          justify={{
            md: 'space-between',
            sm: 'center',
            xs: 'center',
          }}
          w='100%'
          alignItems={'center'}
          flexWrap={{
            md: 'nowrap',
            sm: 'wrap',
            xs: 'wrap',
          }}
          px={{
            md: '30px',
            sm: '10px',
            xs: '10px',
          }}
          rowGap={'10px'}
        >
          <Image
            src={lp11}
            h={{
              md: '211px',
              sm: '128px',
              xs: '128px',
            }}
          />
          <Box
            w={{
              md: 'auto',
              sm: '100%',
              xs: '100%',
            }}
          >
            <Image
              src={arrowImg}
              w={{
                md: '64px',
                sm: '32px',
                xs: '32px',
              }}
              margin={'0 auto'}
              h={{
                md: '48px',
                sm: '24px',
                xs: '24px',
              }}
              transform={{
                md: 'none',
                sm: 'rotate(90deg)',
              }}
            />
          </Box>

          <Image
            src={lp12}
            h={{
              md: '211px',
              sm: '128px',
              xs: '128px',
            }}
          />
        </Flex>
      )

    case 2:
      return (
        <Flex
          gap='10px'
          alignItems={'center'}
          justify={{
            md: 'space-between',
            sm: 'center',
            xs: 'center',
          }}
          flexWrap={{
            md: 'nowrap',
            sm: 'wrap',
            xs: 'wrap',
          }}
          px={{
            md: '30px',
            sm: '10px',
            xs: '10px',
          }}
        >
          <Box
            position={'relative'}
            w={{
              md: '30%',
              sm: '40%',
              xs: '40%',
            }}
          >
            <Image
              src={lp21}
              w={{
                md: '190px',
                sm: '80px',
                xs: '80px',
              }}
            />
            <EthComponent
              num={60}
              isPrimary
              position={'absolute'}
              right={{
                md: '-10px',
                sm: '70px',
                xs: '70px',
              }}
              top={{
                md: '0px',
                sm: '-16px',
                xs: '-16px',
              }}
            />
            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                xs: '12px',
                sm: '12px',
              }}
              transform={{
                md: 'none',
                sm: `scale(0.83333)`,
                xs: `scale(0.83333)`,
              }}
              transformOrigin='center'
            >
              You can sell at anytime including the loan is outstanding{' '}
            </Text>
          </Box>
          <Box
            w={{
              md: '48px',
              sm: '10%',
              xs: '10%',
            }}
            h={{
              md: '16px',
              sm: '12px',
              xs: '12px',
            }}
            borderRadius={2}
            bg='conic-gradient(from 11.86deg at 46.81% 64.71%, #6865FF 0deg, rgba(120, 117, 255, 0) 360deg), linear-gradient(200.52deg, #F5F3FF 8.81%, #A494FF 70.86%, #FFFFFF 90.41%)'
          />
          <Flex
            w={{
              md: '30%',
              sm: '40%',
              xs: '40%',
            }}
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
          >
            <EthComponent num={50} />
            <Image
              src={lp22}
              w={{
                md: '180px',
                sm: '84px',
                xs: '84px',
              }}
            />
            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                xs: '12px',
                sm: '12px',
              }}
              transform={{
                md: 'none',
                sm: `scale(0.83333)`,
                xs: `scale(0.83333)`,
              }}
              transformOrigin='center'
            >
              Automatically repaid upon sale
            </Text>
          </Flex>
          <Image
            src={arrowImg}
            w={'64px'}
            display={{
              md: 'block',
              sm: 'none',
              xs: 'none',
            }}
          />
          <Flex
            w={{
              md: '30%',
              sm: '50%',
              xs: '50%',
            }}
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
            pos={'relative'}
          >
            <Image
              src={arrowImg}
              w={'32px'}
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
              transform={'rotate(90deg)'}
              mb='16px'
            />
            <EthComponent
              num={10}
              isPrimary
              pos={'absolute'}
              top={{
                md: '0',
                sm: '30px',
                xs: '30px',
              }}
            />
            <Image
              src={lp23}
              w={{
                md: '140px',
                sm: '84px',
                xs: '84px',
              }}
            />
            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                xs: '12px',
                sm: '12px',
              }}
              transform={{
                md: 'none',
                sm: `scale(0.83333)`,
                xs: `scale(0.83333)`,
              }}
              transformOrigin='center'
            >
              You got profits
            </Text>
          </Flex>
        </Flex>
      )

    case 3:
      return (
        <Flex
          justify={{
            md: 'space-around',
            sm: 'space-between',
            xs: 'space-between',
          }}
          w='100%'
          alignItems={'center'}
          px={{
            md: '30px',
            sm: '10px',
            xs: '10px',
          }}
        >
          <Flex flexDir={'column'} justify={'center'} alignItems={'center'}>
            <Image
              src={lp31}
              w={{
                md: '160px',
                sm: '86px',
                xs: '86px',
              }}
            />
            <Text
              fontSize={{
                md: '16px',
                xs: '12px',
                sm: '12px',
              }}
              transform={{
                md: 'none',
                sm: `scale(0.83333)`,
                xs: `scale(0.83333)`,
              }}
              transformOrigin='center'
            >
              You can settle your loan anytime
            </Text>
          </Flex>
          <Image
            src={arrowImg}
            w={{
              md: '64px',
              sm: '32px',
              xs: '32px',
            }}
            h={{
              md: '48px',
              sm: '24px',
              xs: '24px',
            }}
          />
          <Flex flexDir={'column'} justify={'center'} alignItems={'center'}>
            <Image
              src={lp32}
              w={{
                md: '200px',
                sm: '182px',
                xs: '182px',
              }}
            />
            <Text
              fontSize={{
                md: '16px',
                xs: '12px',
                sm: '12px',
              }}
              transform={{
                md: 'none',
                sm: `scale(0.83333)`,
                xs: `scale(0.83333)`,
              }}
              transformOrigin='center'
            >
              You owned
            </Text>
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
    <Modal
      onClose={onClose}
      isCentered
      scrollBehavior='inside'
      closeOnOverlayClick={false}
      closeOnEsc={false}
      {...rest}
    >
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          xl: '900px',
          lg: '900px',
          md: '576px',
          sm: '350px',
          xs: '326px',
        }}
        maxH={{
          md: '600px',
          sm: '700px',
          xs: '700px',
        }}
        borderRadius={16}
        key={index}
        bg={{
          md: 'white',
          sm: 'transparent',
          xs: 'transparent',
        }}
        boxShadow={'none'}
      >
        <ModalHeader
          {...MODEL_HEADER_PROPS}
          borderBottomRadius={0}
          px={{
            md: '40px',
            sm: '10px',
            xs: '10px',
          }}
        >
          <Flex
            alignItems={'center'}
            gap='4px'
            fontWeight={'700'}
            lineHeight={'32px'}
          >
            <Image src={icon} />
            {title}
          </Flex>
          {/* <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          /> */}
        </ModalHeader>
        <ModalBody m={0} p={0}>
          <Box
            bg='white'
            borderBottomRadius={16}
            px={{
              md: '40px',
              sm: '10px',
              xs: '10px',
            }}
          >
            <Text
              color='gray.4'
              mb={{
                md: '20px',
                sm: index === 3 ? 0 : '20px',
                xs: index === 3 ? 0 : '20px',
              }}
              fontSize={{
                md: '16px',
                xs: '14px',
                sm: '14px',
              }}
              lineHeight={{
                md: '24px',
                sm: '20px',
                xs: '20px',
              }}
              px={0}
            >
              {description}
            </Text>
            <Flex
              bg='gray.5'
              h={{
                md: '300px',
                sm: '350px',
                xs: '350px',
              }}
              alignItems={'center'}
              justify={'center'}
              borderBottomRadius={20}
              mt={{
                md: 0,
                sm: index === 2 ? '90px' : index === 1 ? '40px' : 0,
                xs: index === 2 ? '90px' : index === 1 ? '40px' : 0,
              }}
            >
              <StepImageComponent order={index} />
            </Flex>
          </Box>

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
            mt='8px'
            bg={{
              md: 'white',
              sm: 'transparent',
              xs: 'transparent',
            }}
            justify={'center'}
          >
            <Button
              w='158px'
              h='40px'
              variant={{
                md: step === BUYER_GUIDES.length ? 'primary' : 'outline',
                sm: step === BUYER_GUIDES.length ? 'primary' : 'outlineOther',
                xs: step === BUYER_GUIDES.length ? 'primary' : 'outlineOther',
              }}
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
                borderColor={{
                  md: 'blue.4',
                  sm: i + 1 === step ? 'blue.1' : 'white',
                  xs: i + 1 === step ? 'blue.1' : 'white',
                }}
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

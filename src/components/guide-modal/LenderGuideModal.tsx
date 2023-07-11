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
        <Flex
          alignItems={'center'}
          w='100%'
          justify={'center'}
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
              src={buy11}
              w={{
                md: '160px',
                sm: '70px',
                xs: '70px',
              }}
            />

            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              Lend WETH to NFTs
            </Text>
          </Box>

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
          <Flex
            w='40%'
            textAlign={'center'}
            flexDir={'column'}
            alignItems={'center'}
            justify={'center'}
          >
            <Image
              src={buy12}
              w={{
                md: '154px',
                sm: '90px',
                xs: '90px',
              }}
            />
            <Box transform={'rotate(90deg)'}>
              <Image
                src={arrowImg}
                w={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
              />
            </Box>
            <Image
              src={buy13}
              w={{
                md: '150px',
                sm: '84px',
                xs: '84px',
              }}
              h={{
                md: '54px',
                sm: '30px',
                xs: '30px',
              }}
            />

            <Text
              fontWeight={{
                md: 500,
                sm: 400,
                xs: 400,
              }}
              color='blue.1'
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              Get Interest on your ETH and Mystery Box
            </Text>
          </Flex>
        </Flex>
      )

    case 2:
      return (
        <Flex
          gap={{
            md: '10px',
            sm: 0,
            xs: 0,
          }}
          alignItems={'center'}
          justify={'space-between'}
        >
          <Image
            src={buy2}
            w={{
              md: '475px',
              sm: '330px',
              xs: '320px',
            }}
            h={{
              md: '100%',
              sm: '200px',
              xs: '200px',
            }}
          />
        </Flex>
      )

    case 3:
      return (
        <Flex
          justify={'center'}
          w='100%'
          alignItems={'center'}
          px={{
            md: '30px',
            sm: '10px',
            xs: '10px',
          }}
        >
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={{
              md: 'center',
              xs: 'flex-start',
              sm: 'flex-start',
            }}
            w={{
              md: '40%',
              sm: '30%',
              xs: '30%',
            }}
          >
            <Image
              src={buy31}
              w={{
                md: '168px',
                sm: '75px',
                xs: '75px',
              }}
            />
            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              Borrowers locks their NFT
            </Text>
          </Flex>
          <Flex
            flexDir={'column'}
            justify={'center'}
            w='25%'
            alignItems={'center'}
            gap={'10px'}
          >
            <Image
              src={imgEthRound}
              boxSize={{
                md: '54px',
                sm: '28px',
                xs: '28px',
              }}
            />
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
          </Flex>
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w={{
              md: '48%',
              sm: '40%',
              xs: '40%',
            }}
          >
            <Image
              src={buy32}
              w={{
                md: '150px',
                sm: '70px',
                xs: '70px',
              }}
              h={{
                md: '180px',
                sm: '100px',
                xs: '100px',
              }}
            />
            <Text
              color={'blue.1'}
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              Once repaid the loan you got interest
            </Text>
          </Flex>
        </Flex>
      )
    case 4:
      return (
        <Flex
          justify={'center'}
          w='100%'
          alignItems={'center'}
          px={{
            md: '30px',
            sm: '10px',
            xs: '10px',
          }}
        >
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={{
              md: 'center',
              sm: 'flex-start',
              xs: 'flex-start',
            }}
            w='40%'
          >
            <Image
              src={buy31}
              w={{
                md: '168px',
                sm: '78px',
                xs: '78px',
              }}
            />
            <Text
              fontWeight={'500'}
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              Borrower fails to repay the loan on time
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
          <Flex
            flexDir={'column'}
            justify={'center'}
            alignItems={'center'}
            w='40%'
          >
            <Image
              src={buy42}
              w={{
                md: '150px',
                sm: '70px',
                xs: '70px',
              }}
              h={{
                md: '180px',
                sm: '100px',
                xs: '100px',
              }}
            />
            <Text
              color={'blue.1'}
              fontSize={{
                md: '16px',
                sm: '12px',
                xs: '12px',
              }}
            >
              You can claim NFT to your wallet
            </Text>
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
          sm: '350px',
          xs: '326px',
        }}
        boxShadow={'none'}
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
            bg={'white'}
            borderBottomRadius={16}
            px={{
              md: '40px',
              sm: '10px',
              xs: '10px',
            }}
          >
            <Text
              color='gray.4'
              mb='20px'
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
            // bg='white'
            mt='8px'
            justify={'center'}
            bg={{
              md: 'white',
              sm: 'transparent',
              xs: 'transparent',
            }}
          >
            <Button
              w='158px'
              h='40px'
              variant={{
                md: step === LENDER_GUIDES.length ? 'primary' : 'outline',
                sm: step === LENDER_GUIDES.length ? 'primary' : 'outlineOther',
                xs: step === LENDER_GUIDES.length ? 'primary' : 'outlineOther',
              }}
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

export default LenderGuideModal

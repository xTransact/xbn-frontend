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

import { MODEL_HEADER_PROPS } from '@/pages/buy-nfts/components/MyAssetNftListCard'

import icon from '@/assets/icon-guide.svg'

export type StepItemType = {
  index: number
  title: string
  description: string
}

const GuideModal: FunctionComponent<{
  steps: StepItemType[]
  onClose: () => void
  isOpen: boolean
}> = ({ steps, onClose, ...rest }) => {
  const [step, setStep] = useState<number>(1)
  const { title, index, description } = useMemo(() => {
    return steps[step - 1]
  }, [step, steps])
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
          <Flex alignItems={'center'} gap='4px'>
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
          <Flex bg='gray.5' px='30px' h='300px' />

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
              variant={step === steps.length ? 'primary' : 'outline'}
              px='30px'
              onClick={() => {
                console.log('aaaaaaaa')
                if (step === steps.length) {
                  setStep(1)
                  onClose()
                }
                setStep((prev) => prev + 1)
              }}
            >
              {step < steps.length ? 'Next' : 'Continue'}
            </Button>
          </Flex>
          <Flex
            pb={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
            gap={'8px'}
            justify={'center'}
            mt='24px'
          >
            {range(steps.length).map((i) => (
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

export default GuideModal

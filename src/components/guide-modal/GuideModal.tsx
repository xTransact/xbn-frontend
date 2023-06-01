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
} from '@chakra-ui/react'
import { useState, type FunctionComponent, useMemo } from 'react'
import {
  BigPlayButton,
  ControlBar,
  PlaybackRateMenuButton,
  Player,
} from 'video-react'

import { MODEL_HEADER_PROPS } from '@/pages/buy-nfts/components/MyAssetNftListCard'

import icon from '@/assets/icon-guide.svg'

import { SvgComponent } from '../'

export type StepItemType = {
  index: number
  title: string
  description: string
  img?: string
  video?: string
}

const GuideModal: FunctionComponent<{
  steps: StepItemType[]
  onClose: () => void
  isOpen: boolean
}> = ({ steps, onClose, ...rest }) => {
  const [step, setStep] = useState<number>(1)
  const { title, index, description, img, video } = useMemo(() => {
    return steps[step - 1]
  }, [step, steps])
  return (
    <Modal onClose={onClose} isCentered scrollBehavior='inside' {...rest}>
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          md: '576px',
          sm: '326px',
          xs: '326px',
        }}
        maxH={'calc(100% - 5.5rem)'}
        borderRadius={16}
        key={index}
        // hidden={index !== step}
      >
        <ModalHeader {...MODEL_HEADER_PROPS}>
          <Flex alignItems={'center'} gap='4px'>
            <Image src={icon} />
            {title}
          </Flex>
          <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          />
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
          <Text>{description}</Text>
          {img && <Image src={img} alt='' />}
          {video && (
            <Player autoPlay={false}>
              <source src={video} />
              <BigPlayButton position='center' />
              <ControlBar>
                <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} />
              </ControlBar>
            </Player>
          )}
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
              variant='primary'
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
              {step < steps.length ? 'Next' : 'Continue'}({step}/{steps.length})
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default GuideModal

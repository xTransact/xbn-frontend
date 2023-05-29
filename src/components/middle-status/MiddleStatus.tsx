import { Box, Container, Flex, Button, Spinner, Text } from '@chakra-ui/react'
import Lottie from 'lottie-react'
import { type FunctionComponent } from 'react'

import uiSuccessJson from '@/assets/ui-sucess.json'
import { H5SecondaryHeader, NftMedia, SvgComponent } from '@/components'

const MiddleStatus: FunctionComponent<{
  step: 'loading' | 'success'
  imagePreviewUrl?: string
  animationUrl?: string
  onLoadingBack?: () => void
  onSuccessBack?: () => void
  successTitle?: string
  successDescription?: string
  isShowBack?: boolean
}> = ({
  step,
  imagePreviewUrl,
  onLoadingBack,
  onSuccessBack,
  animationUrl,
  successDescription,
  successTitle,
  isShowBack = true,
}) => {
  return (
    <Container px={0}>
      <H5SecondaryHeader />
      <Flex
        justify={{
          md: 'space-between',
          sm: 'center',
          xs: 'center',
        }}
        mt={{
          md: '44px',
          sm: '32px',
          xs: '32px',
        }}
      >
        <Button
          hidden={!isShowBack}
          leftIcon={<SvgComponent svgId='icon-arrow-left' />}
          onClick={() => {
            if (step === 'loading' && onLoadingBack) {
              onLoadingBack()
              return
            }
            if (step === 'success' && onSuccessBack) {
              onSuccessBack()
              return
            }
          }}
          display={{
            md: 'flex',
            sm: 'none',
            xs: 'none',
          }}
        >
          Back
        </Button>
        <Flex
          mr={{
            xl: '290px',
            lg: '200px',
            md: '100px',
            sm: 0,
            xs: 0,
          }}
          flexDir='column'
          justifyContent={'center'}
          alignItems='center'
        >
          <Flex
            position={'relative'}
            mb={{ md: '40px', sm: '28px', xs: '28px' }}
            w={{ md: '285px', sm: '244px', xs: '244px' }}
            alignItems={'center'}
            justify='center'
          >
            <NftMedia
              data={{
                imagePreviewUrl,
                animationUrl,
              }}
              borderRadius={16}
              boxSize={{
                md: '240px',
                sm: '160px',
                xs: '160px',
              }}
              fit='contain'
            />
            {step === 'success' && (
              <Flex
                pos='absolute'
                bottom={{
                  md: '-20px',
                  sm: '-10px',
                  xs: '-10px',
                }}
                right={{ md: '6px', sm: '30px', xs: '30px' }}
                bg='white'
                borderRadius={'100%'}
                boxSize={{
                  md: '64px',
                  sm: '40px',
                  xs: '40px',
                }}
                zIndex={10}
              >
                <Lottie animationData={uiSuccessJson} loop={false} />
              </Flex>
            )}
          </Flex>
          {step === 'loading' && (
            <Spinner
              color='blue.1'
              boxSize={'52px'}
              thickness='3px'
              speed='0.6s'
            />
          )}
          {step === 'success' && (
            <Box textAlign={'center'}>
              <Text
                fontWeight={'700'}
                fontSize={{
                  md: '28px',
                  sm: '24px',
                  xs: '24px',
                }}
              >
                {successTitle}
              </Text>
              <Text
                color={'gray.3'}
                fontSize={{
                  md: '16px',
                  xs: '14px',
                  sm: '14px',
                }}
                mt={{
                  md: '16px',
                  sm: '8px',
                  xs: '8px',
                }}
                fontWeight={'500'}
              >
                {successDescription}
              </Text>
            </Box>
          )}
        </Flex>
      </Flex>
    </Container>
  )
}

export default MiddleStatus

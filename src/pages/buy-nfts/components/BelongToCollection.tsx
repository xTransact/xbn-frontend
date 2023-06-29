import { Box, type BoxProps, Heading, Flex, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { ImageWithFallback, SvgComponent } from '@/components'
import { UNIT } from '@/constants'
import { formatFloat } from '@/utils/format'

const BelongToCollection: FunctionComponent<
  BoxProps & {
    data: {
      name?: string
      imagePreviewUrl?: string
      safelistRequestStatus?: string
      floorPrice?: number
    }
  }
> = ({
  data: { name = '', imagePreviewUrl = '', safelistRequestStatus, floorPrice },
  ...rest
}) => {
  return (
    <Box
      {...rest}
      mt='60px'
      w={{
        xl: '500px',
        lg: '400px',
        sm: '100%',
        xs: '100%',
      }}
    >
      <Heading size={'lg'} mb='16px'>
        Collection
      </Heading>
      <Flex
        alignItems={'center'}
        p='16px'
        borderRadius={16}
        bg='gray.5'
        gap='16px'
      >
        <ImageWithFallback
          src={imagePreviewUrl}
          w='72px'
          h='72px'
          borderRadius={8}
        />
        <Box>
          <Flex>
            <Text fontSize={'18px'} fontWeight='bold'>
              {name}
            </Text>
            {safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>

          <Text fontSize={'18px'} fontWeight='bold'>
            {formatFloat(floorPrice)}
            &nbsp;
            {UNIT}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default BelongToCollection

import { Box, type BoxProps, Heading, Flex, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { ImageWithFallback, SvgComponent } from '@/components'
import { UNIT } from '@/constants'
import type { NftCollection } from '@/hooks'

const BelongToCollection: FunctionComponent<
  BoxProps & {
    data: NftCollection
  }
> = ({
  data: {
    name = '',
    imagePreviewUrl = '',
    safelistRequestStatus,
    nftCollectionStat: { floorPrice },
  },
  ...rest
}) => {
  return (
    <Box
      {...rest}
      mt='60px'
      w={{
        xl: '500px',
        lg: '380px',
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
            {floorPrice}
            &nbsp;
            {UNIT}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default BelongToCollection

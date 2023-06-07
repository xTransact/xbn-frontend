import { Flex, Text } from '@chakra-ui/react'
import { useMemo, type FunctionComponent } from 'react'

import imgBlur from '@/assets/blur-logo.png'
import imgOpensea from '@/assets/opensea-logo.png'

import ImageWithFallback from '../image-with-fallback/ImageWithFallback'

import type { FlexProps } from '@chakra-ui/react'

export enum MARKET_TYPE_ENUM {
  OPENSEA,
  BLUR,
}

const NftOrigin: FunctionComponent<
  { type?: MARKET_TYPE_ENUM; isHideName?: boolean } & FlexProps
> = ({ type, isHideName, ...rest }) => {
  const { img, name } = useMemo(() => {
    switch (type) {
      case MARKET_TYPE_ENUM.BLUR:
        return { img: imgBlur, name: 'Blur' }

      case MARKET_TYPE_ENUM.OPENSEA:
        return { img: imgOpensea, name: 'OpenSea' }

      default:
        return {}
    }
  }, [type])
  return (
    <Flex alignItems={'center'} gap='4px'>
      <ImageWithFallback src={img} alt='market' boxSize='20px' {...rest} />
      {!isHideName && (
        <Text fontSize={'14px'} fontWeight={'500'} color='gray.3'>
          {name}
        </Text>
      )}
    </Flex>
  )
}

export default NftOrigin

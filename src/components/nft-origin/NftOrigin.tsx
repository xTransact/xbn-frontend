import { useMemo, type FunctionComponent } from 'react'

import imgBlur from '@/assets/blur-logo.png'
import imgOpensea from '@/assets/opensea-logo.png'

import ImageWithFallback from '../image-with-fallback/ImageWithFallback'

import type { ImageProps } from '@chakra-ui/react'

export enum MarketType {
  OPENSEA,
  BLUR,
}

const NftOrigin: FunctionComponent<{ type?: MarketType } & ImageProps> = ({
  type,
  ...rest
}) => {
  const img = useMemo(() => {
    switch (type) {
      case MarketType.BLUR:
        return imgBlur

      case MarketType.OPENSEA:
        return imgOpensea

      default:
        return ''
    }
  }, [type])
  return <ImageWithFallback src={img} alt='market' h='20px' {...rest} />
}

export default NftOrigin

import { useMemo, type FunctionComponent } from 'react'

import imgBlur from '@/assets/blur-logo.png'
import imgOpensea from '@/assets/opensea-logo.png'

import ImageWithFallback from '../image-with-fallback/ImageWithFallback'

import type { ImageProps } from '@chakra-ui/react'

export enum MARKET_TYPE_ENUM {
  OPENSEA,
  BLUR,
}

const NftOrigin: FunctionComponent<
  { type?: MARKET_TYPE_ENUM } & ImageProps
> = ({ type, ...rest }) => {
  const img = useMemo(() => {
    switch (type) {
      case MARKET_TYPE_ENUM.BLUR:
        return imgBlur

      case MARKET_TYPE_ENUM.OPENSEA:
        return imgOpensea

      default:
        return ''
    }
  }, [type])
  return <ImageWithFallback src={img} alt='market' h='20px' {...rest} />
}

export default NftOrigin

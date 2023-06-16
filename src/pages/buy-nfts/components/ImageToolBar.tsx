import { Flex, IconButton, Text } from '@chakra-ui/react'
import numeral from 'numeral'
import { PhotoView } from 'react-photo-view'

import { SvgComponent } from '@/components'
import type { AssetQuery } from '@/hooks'
import downloadRemoteImg from '@/utils/downloadRemoteImg'
import { judgeNftMediaType, NFT_MEDIA_TYPE } from '@/utils/judgeNftMediaType'

import type { FunctionComponent } from 'react'

type ImageToolBarProps = {
  data?: AssetQuery
}
const ImageToolBar: FunctionComponent<ImageToolBarProps> = ({ data }) => {
  if (!data) return null
  const {
    asset: {
      imagePreviewUrl,
      imageOriginalUrl,
      name,
      tokenID,
      imageUrl,
      animationUrl,
      nftAssetMetaData: { likeCount },
    },
  } = data
  return (
    <Flex
      h='40px'
      mt='24px'
      alignItems='center'
      justify={!!likeCount ? 'space-between' : 'flex-end'}
      w={{
        xl: '500px',
        lg: '400px',
        sm: '100%',
        xs: '100%',
      }}
    >
      {!!likeCount && (
        <Flex alignItems={'center'} gap={'4px'}>
          <SvgComponent svgId='icon-like' fontSize={'20px'} />
          <Text fontWeight={'700'} color='black.1'>
            {numeral(likeCount).format('0.00 a')}
          </Text>
        </Flex>
      )}

      {judgeNftMediaType(animationUrl) === NFT_MEDIA_TYPE.IMAGE_MEDIA && (
        <Flex gap={'8px'}>
          <IconButton
            icon={<SvgComponent svgId='icon-download' />}
            aria-label='download'
            alignItems={'center'}
            bg='gray.5'
            onClick={() => {
              try {
                downloadRemoteImg(imageOriginalUrl, name || tokenID, imageUrl)
              } catch (error) {
                console.log(error)
              }
            }}
          />
          <PhotoView src={imagePreviewUrl}>
            <IconButton
              icon={<SvgComponent svgId='icon-expand' />}
              aria-label='download'
              alignItems={'center'}
              bg='gray.5'
            />
          </PhotoView>
        </Flex>
      )}
    </Flex>
  )
}

export default ImageToolBar

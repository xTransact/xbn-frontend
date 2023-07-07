import { Flex, Text } from '@chakra-ui/react'

import { ImageWithFallback, SvgComponent } from '@/components'

import type { FlexProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const CollectionListItem: FunctionComponent<
  {
    data?: Record<string, any>
    onClick?: () => void
    isActive?: boolean
    count?: number
    iconSize?: number | string
    rightIconId?: string
  } & FlexProps
> = ({
  data,
  onClick,
  isActive,
  count,
  iconSize = 6,
  rightIconId = 'icon-checked',
  ...rest
}) => {
  return (
    <Flex
      key={`${data?.contractAddress}-${data?.nftCollection?.id}`}
      px='16px'
      py='12px'
      alignItems={'center'}
      justifyContent='space-between'
      border={`1px solid var(--chakra-colors-gray-2)`}
      borderRadius={8}
      _hover={{
        bg: 'blue.2',
      }}
      cursor='pointer'
      bg={isActive ? 'blue.2' : 'white'}
      onClick={onClick}
      {...rest}
    >
      <Flex alignItems={'center'} gap='16px' w='80%'>
        <ImageWithFallback
          src={
            data?.nftCollection?.imagePreviewUrl ||
            data?.nftCollection?.image_url
          }
          w={iconSize}
          h={iconSize}
          borderRadius={8}
          fit='cover'
        />
        <Text
          fontSize='14px'
          display='inline-block'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
        >
          {data?.nftCollection?.name || '--'}
          &nbsp;
        </Text>
        {data?.nftCollection?.safelistRequestStatus === 'verified' && (
          <SvgComponent svgId='icon-verified-fill' />
        )}
      </Flex>
      {isActive ? (
        <SvgComponent svgId={rightIconId} />
      ) : (
        !!count && <Text fontSize='14px'>{count}</Text>
      )}
    </Flex>
  )
}

export default CollectionListItem

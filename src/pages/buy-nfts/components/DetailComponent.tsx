import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Text,
  type BoxProps,
  chakra,
} from '@chakra-ui/react'

import type { MARKET_TYPE_ENUM } from '@/components'
import { NftOrigin, SvgComponent } from '@/components'
import { formatFloat } from '@/utils/format'

import type { FunctionComponent } from 'react'

const DetailComponent: FunctionComponent<
  BoxProps & {
    data: {
      name1?: string
      name2?: string
      price?: number
      verified: boolean
      usdPrice?: string
      platform?: MARKET_TYPE_ENUM
      collectionId?: string
    }
    loading?: boolean
    onRefreshPrice?: () => void
    refreshLoading?: boolean
  }
> = ({
  data: { name1, name2, price, verified, usdPrice, platform, collectionId },
  loading,
  onRefreshPrice,
  refreshLoading,
  ...rest
}) => {
  if (loading) {
    return (
      <Skeleton
        h={200}
        borderRadius={16}
        startColor='rgba(27, 34, 44, 0.1)'
        endColor='rgba(27, 34, 44, 0.2)'
        mt={8}
      />
    )
  }
  return (
    <Box mt={8} {...rest}>
      {/* 名称*/}
      <Flex alignItems={'baseline'}>
        <chakra.a href={`/buy-nfts/market/${collectionId}`}>
          <Text
            fontWeight={'500'}
            noOfLines={1}
            color={'black.1'}
            _hover={{ color: 'gray.3' }}
          >
            {name1 || '--'}
          </Text>
        </chakra.a>

        {verified && <SvgComponent svgId='icon-verified-fill' />}
      </Flex>
      <Heading fontSize={'40px'} noOfLines={1}>
        {name2}
      </Heading>
      {/* 价格 */}
      <Flex
        bg='gray.5'
        alignItems='end'
        borderRadius={16}
        p={'20px'}
        justify='space-between'
        mt='24px'
      >
        <Box>
          <Text>Price</Text>
          <Flex alignItems={'end'} mt={1} gap={'4px'}>
            <SvgComponent svgId='icon-eth' svgSize='32px' />
            <Heading fontSize={'32px'} lineHeight='30px'>
              {formatFloat(price)}
            </Heading>
            <SvgComponent
              svgId='icon-refresh'
              onClick={() => {
                if (refreshLoading || !onRefreshPrice) return
                onRefreshPrice()
              }}
              animation={refreshLoading ? 'loading 1s linear infinite' : ''}
              cursor={'pointer'}
              svgSize='20px'
            />
            {!!usdPrice && (
              <Text fontSize='12px' lineHeight='14px'>
                &nbsp;$ {usdPrice}
              </Text>
            )}
          </Flex>
        </Box>
        <NftOrigin type={platform} />
      </Flex>
    </Box>
  )
}

export default DetailComponent

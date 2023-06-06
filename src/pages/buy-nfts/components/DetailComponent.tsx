import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Text,
  type BoxProps,
} from '@chakra-ui/react'

import type { MARKET_TYPE_ENUM } from '@/components'
import { NftOrigin, SvgComponent } from '@/components'

import type { FunctionComponent } from 'react'

const DetailComponent: FunctionComponent<
  BoxProps & {
    data: {
      name1: string
      name2?: string
      price?: string
      verified: boolean
      usdPrice?: string
      platform?: MARKET_TYPE_ENUM
    }
    loading?: boolean
    onRefreshPrice?: () => void
    refreshLoading?: boolean
  }
> = ({
  data: { name1, name2, price, verified, usdPrice, platform },
  loading,
  onRefreshPrice,
  refreshLoading,
  ...rest
}) => {
  if (loading) {
    return <Skeleton h={200} borderRadius={16} />
  }
  return (
    <Box mt={8} {...rest}>
      {/* 名称*/}
      <Flex alignItems={'baseline'}>
        <Text fontWeight={'500'} noOfLines={1}>
          {name1}
        </Text>
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
              {price}
            </Heading>
            <SvgComponent
              svgId='icon-refresh'
              onClick={onRefreshPrice}
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

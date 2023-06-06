import {
  Flex,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  type FlexProps,
  Button,
} from '@chakra-ui/react'
import { type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'

import { SvgComponent } from '@/components'
import type { NftCollection } from '@/hooks'

import UpdatePoolAmountButton from './UpdatePoolAmountButton'

const BUTTON_PROPS = {
  variant: 'unstyled',
  p: '8px',
  fontWeight: '500',
  fontSize: '14px',
  _hover: {
    color: 'blue.1',
  },
}

/**
 * pool actions component
 */
const MyPoolActionRender: FunctionComponent<
  FlexProps & {
    poolData: PoolsListItemType
    collectionData: NftCollection
    onClickDetail: () => void
    onRefresh: () => void
  }
> = ({ poolData, collectionData, onClickDetail, onRefresh }) => {
  const navigate = useNavigate()
  return (
    <Flex alignItems='center' gap={'24px'}>
      <Text
        color='gray.3'
        onClick={() => {
          navigate('/xlending/lending/loans')
          onClickDetail()
        }}
        cursor='pointer'
      >
        Details
      </Text>
      <Popover trigger='hover' placement='bottom-start'>
        {({ isOpen: visible }) => (
          <>
            <PopoverTrigger>
              <Flex
                alignItems={'center'}
                gap={'8px'}
                py='12px'
                cursor={'pointer'}
                borderRadius={8}
                bg='white'
                px='16px'
                borderColor={visible ? 'blue.1' : 'white'}
                borderWidth={1}
              >
                <Text fontWeight='700' color='blue.1' lineHeight={'16px'}>
                  Manage
                </Text>
                <SvgComponent
                  svgId='icon-arrow-down'
                  transform={`rotate(${visible ? '180' : '0'}deg)`}
                  transition='all 0.15s'
                  fill={'blue.1'}
                  mt='2px'
                />
              </Flex>
            </PopoverTrigger>
            <Portal>
              <PopoverContent
                borderRadius={8}
                boxShadow='0px 2px 8px rgba(28, 60, 100, 0.1)'
                w='200px'
              >
                <PopoverBody>
                  <Flex
                    flexDir={'column'}
                    alignItems='flex-start'
                    gap={'10px'}
                    py='10px'
                  >
                    <Button
                      {...BUTTON_PROPS}
                      onClick={() => {
                        navigate('/xlending/lending/edit', {
                          state: {
                            contractAddress: poolData.allow_collateral_contract,
                            nftCollection: collectionData,
                            poolData,
                          },
                        })
                      }}
                      // hidden
                    >
                      Modify loan terms
                    </Button>
                    <UpdatePoolAmountButton
                      poolData={poolData}
                      collectionSlug={collectionData?.slug}
                      onSuccess={onRefresh}
                      {...BUTTON_PROPS}
                    >
                      Modify the ETH amount
                    </UpdatePoolAmountButton>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </Flex>
  )
}

export default MyPoolActionRender

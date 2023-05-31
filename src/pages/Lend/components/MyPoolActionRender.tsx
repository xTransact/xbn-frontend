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
import omit from 'lodash-es/omit'
import { type FunctionComponent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { SvgComponent } from '@/components'

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
    data: any
    onClickDetail: () => void
    onRefresh: () => void
  }
> = ({ data, onClickDetail, onRefresh }) => {
  const floorPrice = useMemo(
    () => data?.nftCollection?.nftCollectionStat?.floorPrice || 0,
    [data],
  )
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
                            contractAddress: data.allow_collateral_contract,
                            nftCollection: data?.nftCollection,
                            poolData: {
                              ...omit(data, ['nftCollection']),
                              // loan_ratio_preferential_flexibility: 10000,
                              // loan_time_concession_flexibility: 9800,
                              // pool_maximum_days: 3,
                              // pool_maximum_percentage: 2000,
                              // pool_maximum_interest_rate: 2290,
                            },
                          },
                        })
                      }}
                      hidden
                    >
                      Modify loan terms
                    </Button>
                    <UpdatePoolAmountButton
                      data={{
                        poolID: data.pool_id,
                        poolUsedAmount: data.pool_used_amount || 0,
                        floorPrice,
                        poolAmount: data.pool_amount,
                      }}
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

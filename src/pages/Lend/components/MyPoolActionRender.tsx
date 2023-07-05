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
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Modal,
  ModalCloseButton,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import {
  useCallback,
  type FunctionComponent,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetConfig, apiGetFloorPrice, apiGetPoolPoints } from '@/api'
import { LoadingComponent, SvgComponent } from '@/components'
import type { NftCollection } from '@/hooks'
import { MODEL_HEADER_PROPS } from '@/pages/buy-nfts/components/MyAssetNftListCard'
import { computePoolPoint, computePoolScore } from '@/utils/calculation'

import ScoreChart from './ScoreChart'
import UpdatePoolAmountButton from './UpdatePoolAmountButton'

import type BigNumber from 'bignumber.js'

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
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [score, setScore] = useState<BigNumber>()

  const { loading: poolPointLoading, data: pointData } = useRequest(
    () =>
      apiGetPoolPoints({
        contract_address: poolData?.allow_collateral_contract,
      }),
    {
      ready: isOpen,
      refreshDeps: [poolData?.allow_collateral_contract],
    },
  )

  const { loading: configLoading, data: configData } = useRequest(
    apiGetConfig,
    {
      ready: isOpen,
      staleTime: 1000 * 60 * 60,
      cacheKey: 'config-cache-key',
    },
  )

  const { loading: floorPriceLoading, data: floorPriceData } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: collectionData?.slug,
      }),
    {
      ready: isOpen,
      refreshDeps: [collectionData?.slug],
      // cacheKey: `staleTime-floorPrice-${selectCollection?.nftCollection?.slug}`,
      // staleTime: 1000 * 60,
    },
  )

  useEffect(() => {
    if (!isOpen) {
      setScore(undefined)
      return
    }
    if (!configData) return
    if (!floorPriceData?.floor_price) return
    const { config } = configData

    const _score = computePoolScore(
      poolData,
      config,
      floorPriceData?.floor_price,
    )
    setScore(_score)
  }, [configData, poolData, floorPriceData, isOpen])

  const point = useMemo(() => {
    if (score === undefined) return
    console.log(
      '🚀 ~ file: MyPoolActionRender.tsx:114 ~ point ~ score:',
      score.toNumber(),
    )
    if (!pointData) return
    const { percent } = pointData
    return computePoolPoint(score, percent)
  }, [score, pointData])

  const handleClose = useCallback(() => {
    setScore(undefined)
    onClose()
  }, [onClose])

  return (
    <Flex alignItems='center' gap={'16px'}>
      <Flex alignItems={'center'} gap='1'>
        <SvgComponent svgId='icon-gauge' fill={'blue.1'} fontSize={'24px'} />
        <Text
          color='blue.1'
          cursor='pointer'
          fontWeight={'500'}
          onClick={onOpen}
          fontSize={'14px'}
        >
          My Pool Score
        </Text>
      </Flex>

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
                        navigate('/lending/edit', {
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
                      Reset Pool Size
                    </UpdatePoolAmountButton>

                    <Button
                      {...BUTTON_PROPS}
                      onClick={() => {
                        navigate('/lending/loans')
                        onClickDetail()
                      }}
                      // hidden
                    >
                      Details
                    </Button>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>

      <Modal
        onClose={handleClose}
        isCentered
        scrollBehavior='inside'
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isOpen={isOpen}
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            md: '400px',
            sm: '326px',
            xs: '326px',
          }}
          maxH={'600px'}
          borderRadius={16}
        >
          <LoadingComponent
            loading={poolPointLoading || configLoading || floorPriceLoading}
            top={0}
            spinnerProps={{
              mt: '100px',
            }}
          />

          <ModalHeader {...MODEL_HEADER_PROPS}>
            <ModalCloseButton />
            {/* <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          /> */}
          </ModalHeader>
          <ModalBody
            m={0}
            px={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
            pb={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
            pt={0}
          >
            <Flex alignItems={'center'} justify={'center'}>
              <ScoreChart
                data={point}
                labelStyle={{
                  fontSize: point !== undefined ? '28px' : '18px',
                  fontWeight: point !== undefined ? '500' : '400',
                  lineHeight: '20px',
                  w: '160%',
                  mt: '-10px',
                }}
                boxProps={{
                  boxSize: {
                    md: '145px',
                    sm: '104px',
                    xs: '104px',
                  },
                }}
                innerBoxProps={{
                  top: {
                    md: '33px',
                    sm: '26px',
                    xs: '22px',
                  },
                  left: {
                    md: '33px',
                    sm: '22px',
                    xs: '22px',
                  },
                  boxSize: '80px',
                }}
              />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default MyPoolActionRender

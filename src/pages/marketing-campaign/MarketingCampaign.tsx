import {
  Box,
  Card,
  CardBody,
  Image,
  Container,
  SimpleGrid,
  Text,
  HStack,
  Button,
  Center,
  Flex,
  Link,
  useClipboard,
  AlertDialog,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  useDisclosure,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useAsyncEffect, useRequest, useSetState } from 'ahooks'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetLoans } from '@/api'
import {
  apiGalxeRedeem,
  apiGalxeStatus,
  apiGetBoxes,
  apiGetInviteCode,
  apiGetRanking,
  apiRewardExists,
} from '@/api/marketing-campaign'
// import BannerImg from '@/assets/marketing/banner-4x.png'
import ImgH5LeaderBoard from '@/assets/marketing/ROLLING 24H LEADERBOARD.png'
import ImgDialogBanner from '@/assets/marketing/banner-dialog.png'
import BannerImg from '@/assets/marketing/banner.png'
import BoxShadow from '@/assets/marketing/box-shadow.png'
import Box1 from '@/assets/marketing/box1.png'
import Box2 from '@/assets/marketing/box2.png'
import Box3 from '@/assets/marketing/box3.png'
import Box4 from '@/assets/marketing/box4.png'
import IconCopied from '@/assets/marketing/copied.png'
import ImgH5Prize from '@/assets/marketing/h5-price.png'
import IconInviteFriend from '@/assets/marketing/icon-box-check-line.png'
import IconCopy from '@/assets/marketing/icon-copy.png'
import ImgQuestionBox from '@/assets/marketing/icon-win-box.png'
import ImgLeaderBoardIcon from '@/assets/marketing/leader-board-icon.png'
import ImgLeaderBoardTitle from '@/assets/marketing/leader-board-title.png'
import ImgNo1 from '@/assets/marketing/no1.png'
import ImgNo2 from '@/assets/marketing/no2.png'
import ImgNo3 from '@/assets/marketing/no3.png'
import IconTelegram from '@/assets/marketing/telegram.png'
import IconTwitter from '@/assets/marketing/twitter.png'
import IconLogo from '@/assets/marketing/xbank-logo.png'
import { Header, LoadingComponent } from '@/components'
import { useWallet } from '@/hooks'
import { getUserToken } from '@/utils/auth'

import Icon0 from '@/assets/marketing/icon-0.svg'
import Icon1 from '@/assets/marketing/icon-1.svg'
import Icon2 from '@/assets/marketing/icon-2.svg'
import Icon3 from '@/assets/marketing/icon-3.svg'
import Icon4 from '@/assets/marketing/icon-4.svg'
import ImgBrowser from '@/assets/marketing/icon-browser.svg'
import ImgCoinInBox from '@/assets/marketing/icon-coin-in-box.svg'
import ImgPlusWallet from '@/assets/marketing/icon-plus-wallet.svg'
import ImgWalletOk from '@/assets/marketing/icon-wallet-ok.svg'

import type { FlexProps, TextProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const { VITE_APP_GALXE_TAKS_LINK } = import.meta.env
const SHARE_TELEGRAM_TEXT = `Buy NFT pay later with 0% down payment, win Boxdrop`
const SHARE_TWITTER_TEXT = `xBank is An NFT Open Money Market Powering Web3 Adopters with Onboarding Leverage with NFT BNPL and Improving Money Efficiency for Holders\nJoin @xBank_Official, buy top NFTs pay later, with 0% downpayment, and earn Boxdrop`
const INITIAL_TEXT_PROPS: TextProps = {
  color: 'white',
  fontFamily: 'HarmonyOS Sans SC',
  textAlign: 'center',
  fontSize: {
    xl: '20px',
    lg: '18px',
    md: '14px',
    sm: '12px',
    xs: '12px',
  },
  transform: {
    md: 'none',
    sm: 'scale(0.83333)',
    xs: 'scale(0.83333)',
  },
  transformOrigin: 'center',
  lineHeight: {
    md: '20px',
    sm: 'normal',
    xs: 'normal',
  },
}

const RankPercentage: FunctionComponent<{
  data: RankItemType
  total?: number
}> = ({ data, total }) => {
  const percentageData = useMemo(() => {
    if (!data) return
    const { box_bronze_num, box_gold_num, box_silver_num } = data

    if (!total) return

    const res = [
      {
        percentage: !box_gold_num
          ? 0
          : BigNumber(box_gold_num).dividedBy(total).toNumber(),
        colorScheme: 'gold',
      },
      {
        percentage: !box_silver_num
          ? 0
          : BigNumber(box_silver_num).dividedBy(total).toNumber(),
        colorScheme: 'silver',
      },
      {
        percentage: !box_bronze_num
          ? 0
          : BigNumber(box_bronze_num).dividedBy(total).toNumber(),
        colorScheme: 'bronze',
      },
    ]
    return res.filter((i) => !!i.percentage)
  }, [data, total])
  if (!data) return null

  return (
    <Flex
      w='100%'
      gap={'2px'}
      bg='transparent'
      borderRadius={{ md: '16px', sm: 0, xs: 0 }}
      overflow={'hidden'}
    >
      {!!percentageData &&
        percentageData?.map((item) => (
          <Box
            w={`${item.percentage * 100}%`}
            key={item.colorScheme}
            h={{ md: '18px', sm: '4px', xs: '4px' }}
            // bg={item.colorScheme}
            bgSize={'20px 20px'}
            bgImage={
              'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)'
            }
            bgColor={item.colorScheme}
          />
        ))}
    </Flex>
  )
}

const INITIAL_WIDTH = {
  xl: '156px',
  lg: '120px',
  md: '98px',
  sm: '44px',
  xs: '44px',
}
const RankItem: FunctionComponent<{
  data: RankItemType
  isHighlight?: boolean
}> = ({ data, isHighlight }) => {
  const INITIAL_RANK_BOX_PROPS: FlexProps = useMemo(() => {
    return {
      p: {
        md: '12px',
        sm: '2px',
        xs: '2px',
      },
      h: {
        xl: '80px',
        lg: '60px',
        md: '60px',
        sm: isHighlight ? '40px' : '44px',
        xs: isHighlight ? '40px' : '44px',
      },
      w: INITIAL_WIDTH,
      alignItems: 'center',
      justify: 'center',
    }
  }, [isHighlight])
  const rankData = useMemo(() => {
    if (!data) return '--'
    const { rank } = data
    switch (rank) {
      case undefined:
        return <Text {...INITIAL_TEXT_PROPS}>unranked</Text>
      case 1:
        return (
          <Image
            src={ImgNo1}
            w={{
              xl: '60px',
              lg: '48px',
              md: '32px',
              sm: '18px',
              xs: '18px',
            }}
          />
        )
      case 2:
        return (
          <Image
            src={ImgNo2}
            w={{
              xl: '60px',
              lg: '48px',
              md: '32px',
              sm: '18px',
              xs: '18px',
            }}
          />
        )
      case 3:
        return (
          <Image
            src={ImgNo3}
            w={{
              xl: '60px',
              lg: '48px',
              md: '32px',
              sm: '18px',
              xs: '18px',
            }}
          />
        )

      default:
        return (
          <Text {...INITIAL_TEXT_PROPS}>
            {rank < 10 ? `0${rank}` : rank?.toString()}
          </Text>
        )
    }
  }, [data])
  const { rank, address, box_bronze_num, box_gold_num, box_silver_num } =
    data || {}

  const totalBoxNum = useMemo(() => {
    if (
      box_bronze_num === undefined &&
      box_gold_num === undefined &&
      box_silver_num === undefined
    )
      return
    return (box_bronze_num || 0) + (box_gold_num || 0) + (box_silver_num || 0)
  }, [box_bronze_num, box_gold_num, box_silver_num])
  if (!data) return null

  return (
    <Flex
      w='100%'
      borderRadius={{
        md: 8,
        sm: 4,
        xs: 4,
      }}
      mt={{
        md: '8px',
        sm: '4px',
        xs: '4px',
      }}
      bg={
        isHighlight
          ? rank && rank < 4
            ? 'linear-gradient(313deg, #00F 0%, rgba(39, 180, 255, 0.00) 100%), #051B34'
            : 'linear-gradient(270deg, rgba(0, 23, 147, 0.60) 0%, rgba(0, 60, 150, 0.00) 100%), linear-gradient(180deg, #17AFFF 0%, #0048DA 100%)'
          : 'linear-gradient(180deg, #05356F 0%, rgba(2, 38, 80, 0.00) 100%)'
      }
      backgroundBlendMode={
        isHighlight && rank && rank < 4 ? 'hard-light, normal' : 'lighten'
      }
    >
      {/* rank */}
      <Flex {...INITIAL_RANK_BOX_PROPS}>{rankData}</Flex>
      {/* user */}
      <Flex {...INITIAL_RANK_BOX_PROPS}>
        <Text {...INITIAL_TEXT_PROPS} color={isHighlight ? 'red.1' : 'white'}>
          {address}
        </Text>
      </Flex>
      {[
        box_gold_num ?? '--',
        box_silver_num ?? '--',
        box_bronze_num ?? '--',
      ].map((i) => (
        <Flex {...INITIAL_RANK_BOX_PROPS} key={`${i}-${Math.random()}`}>
          <Text {...INITIAL_TEXT_PROPS}>{i}</Text>
        </Flex>
      ))}

      {/* Total */}
      <Flex {...INITIAL_RANK_BOX_PROPS}>
        <Text {...INITIAL_TEXT_PROPS}>{totalBoxNum ?? '--'}</Text>
      </Flex>
      {/* 百分比 */}
      <Flex
        {...INITIAL_RANK_BOX_PROPS}
        flex={1}
        px={{
          lg: '30px',
          md: 0,
          sm: 0,
          xs: 0,
        }}
      >
        <RankPercentage data={data} total={totalBoxNum} />
      </Flex>
    </Flex>
  )
}
const CusCard = (props: {
  title?: string
  children?: React.ReactNode
  titleHidden?: boolean
}) => {
  return (
    <Box>
      {!props.titleHidden && (
        <Box
          display={'inline-block'}
          bgGradient={
            'linear-gradient(272.41deg, #0000FF 0.82%, #FFFFFF 87.36%)'
          }
          borderTopLeftRadius={16}
          borderTopRightRadius={48}
          overflow={'hidden'}
          p={'1px'}
          marginBottom={'-7px'}
        >
          <Box
            display={'inline-block'}
            p={{
              md: '10px 60px 10px 20px',
              sm: '0 32px 4px 8px',
              xs: '0 32px 4px 8px',
            }}
            borderTopLeftRadius={16}
            borderTopRightRadius={48}
            bgGradient={
              'linear-gradient(272.41deg, #0000FF 0.82%, #071E38 87.36%)'
            }
          >
            <Text
              display={'inline-block'}
              fontFamily={'HarmonyOS Sans SC Bold'}
              fontSize={{
                md: 28,
                sm: '16px',
                xs: '16px',
              }}
              color={'#ffffff'}
            >
              {props.title}
            </Text>
          </Box>
        </Box>
      )}
      <Box
        bgGradient={'linear-gradient(0deg, #32E8FC 0.82%, #FFFFFF 87.36%)'}
        padding={'1.5px'}
        borderRadius={props.titleHidden ? '10px' : '0 10px 10px 10px'}
        boxShadow='0px 3px 1px #32E8FC'
        overflow={'hidden'}
      >
        <Card
          variant={'outline'}
          borderWidth={0}
          dropShadow={'base'}
          bgColor={'#022650'}
          color={'#FFFFFF'}
          borderRadius={props.titleHidden ? '10px' : '0 10px 10px 10px'}
        >
          {props.children}
        </Card>
      </Box>
    </Box>
  )
}
const TitleWithQuestionBox = (props: { title: string; src?: any }) => {
  return (
    <HStack>
      <Image
        src={props.src || ImgQuestionBox}
        boxSize={{
          md: '84px',
          sm: '24px',
          xs: '24px',
        }}
      />
      <Text
        display={'inline-block'}
        fontSize={{
          md: '64px',
          sm: '24px',
          xs: '24px',
        }}
        // lineHeight={'74px'}
        fontFamily={'HarmonyOS Sans SC Black'}
        bgGradient={
          'linear-gradient(45deg, #1CFEF0 23%, #458FFF 46%, #FFBADB 90%)'
        }
        bgClip='text'
      >
        {props.title}
      </Text>
    </HStack>
  )
}

enum TAB_KEY {
  WIN_BOX,
  LEADER_BOARD,
}
export default function MarketingCampaign() {
  const [tabKey, setTabKey] = useState<TAB_KEY>(TAB_KEY.WIN_BOX)
  const navigate = useNavigate()
  const toast = useToast()
  const isLogin = getUserToken()?.address
  const { currentAccount: address, connectWallet } = useWallet()
  const [state, setState] = useSetState({
    hasClaimed: false,
    hasCompleted: false,
    expired: getUserToken()
      ? moment(new Date()).isAfter(moment(getUserToken()?.expires))
      : true,
    hasUsedXBN: false,
  })
  const [boxAmounts, setBoxAmounts] = useSetState({
    box_bronze: 0,
    box_diamond: 0,
    box_gold: 0,
    box_platinum: 0,
    box_silver: 0,
  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<any>()
  const {
    onCopy,
    hasCopied,
    value: invitationLink,
    setValue: setInvitationLink,
  } = useClipboard('')

  const [inviteCode, setInviteCode] = useState('')
  // 盒子排行榜
  const { data: rankData, loading: rankLoading } = useRequest(apiGetRanking, {
    debounceWait: 100,
    refreshDeps: [isLogin],
  })

  useAsyncEffect(async () => {
    if (!state.expired && isLogin) {
      // 查询用户盒子数量
      const boxResp = await apiGetBoxes()
      setBoxAmounts({
        box_bronze: boxResp?.box_bronze || 0,
        box_diamond: boxResp?.box_diamond || 0,
        box_gold: boxResp?.box_gold || 0,
        box_platinum: boxResp?.box_platinum || 0,
        box_silver: boxResp?.box_silver || 0,
      })
    }
  }, [state.expired, isLogin])
  useAsyncEffect(async () => {
    // 查询用户是否使用过 XBN
    if (!state.expired && isLogin) {
      const list = await apiGetLoans({
        lender_address: address,
        borrower_address: address,
      })
      setState({
        hasUsedXBN: list.length > 0,
      })
    }
  }, [state.expired, address, isLogin])
  useAsyncEffect(async () => {
    if (!state.expired && state.hasUsedXBN && isLogin) {
      const data = await apiGetInviteCode()
      setInviteCode(data.code)
      setInvitationLink(
        window.location.host + `/buy-nfts/market?invitation_code=${data.code}`,
      )
    }
  }, [state.expired, state.hasUsedXBN, isLogin])
  useAsyncEffect(async () => {
    if (state.expired) {
      // 过期了，需要连钱包
      await connectWallet()
      const tokenInfo = getUserToken()
      if (tokenInfo === null) {
        setState({
          expired: true,
        })
      } else {
        const now = moment(new Date())
        const expired = now.isAfter(tokenInfo?.expires)
        setState({
          expired,
        })
      }
    } else if (isLogin) {
      // 查询用户是否做过任务
      const galxeStatusData = await apiGalxeStatus()
      if (galxeStatusData.status) {
        // 做过任务，查询是否拿到过奖励
        const rewardExistsData = await apiRewardExists()
        if (!rewardExistsData.status) {
          // 没有拿到过奖励，激活奖励
          const resp = await apiGalxeRedeem()
          if (resp?.status) {
            console.log('奖励已激活')
            toast({
              title: 'Claim Success',
              status: 'success',
              isClosable: true,
              position: 'top',
            })
            setState({
              hasClaimed: true,
            })
          } else {
            console.log('奖励激活失败')
          }
        } else {
          // 拿到过奖励，设置已经领取
          setState({
            hasClaimed: true,
          })
        }
      }
    }
  }, [state.expired, isLogin])
  return (
    <Box bgGradient={'linear-gradient(0deg, #071E38, #071E38), #F9F9FF;'}>
      <Header />
      <Box
        marginBottom={{
          md: '68px',
          sm: '16px',
          xs: '16px',
        }}
        bgImage={BannerImg}
        w={'100%'}
        aspectRatio={'2.2'}
        bgSize={{
          md: 'cover',
          sm: 'cover',
          xs: 'contain',
        }}
        position={'relative'}
        px={{
          md: '66px',
          sm: '16px',
          xs: '16px',
        }}
        pt={{
          md: '40px',
          sm: '',
          xs: '',
        }}
      >
        <Flex
          alignItems={'center'}
          gap={'16px'}
          color={'white'}
          fontSize='36px'
          display={{
            md: 'flex',
            sm: 'none',
            xs: 'none',
          }}
        >
          <Image src={IconLogo} h='100%' />
          xBank
        </Flex>

        <Flex
          flexDir={'column'}
          fontWeight={'900'}
          color={'white'}
          maxW={{
            md: '70%',
            sm: '100%',
            xs: '100%',
          }}
          fontFamily={'HarmonyOS Sans SC'}
          lineHeight={{
            xl: '90px',
            lg: '80px',
            md: '48px',
            sm: '30px',
            xs: '30px',
          }}
          mt={{
            '2xl': '250px',
            xl: '120px',
            lg: '90px',
            md: '50px',
            xs: 0,
            sm: 0,
          }}
          pt={{
            md: 0,
            sm: '28px',
            xs: '24px',
          }}
        >
          <Text
            fontSize={{
              xl: '72px',
              lg: '60px',
              md: '36px',
              sm: '24px',
              xs: '24px',
            }}
            fontFamily={'HarmonyOS Sans SC Bold'}
          >
            Unboxing Top
          </Text>
          <Text
            bg={
              'linear-gradient(256.81deg, #FF82BE 15.15%, #69A5FF 53.12%, #1CFEF0 90.31%)'
            }
            bgClip='text'
            fontSize={{
              xl: '84px',
              lg: '72px',
              md: '48px',
              sm: '24px',
              xs: '24px',
            }}
            fontWeight={'900'}
            fontFamily={'HarmonyOS Sans SC Bold'}
          >
            Collection Season 1!
          </Text>
          <Text
            fontWeight={{
              md: '700',
              sm: '400',
              xs: '400',
            }}
            fontSize={{
              xl: '24px',
              lg: '24px',
              md: '16px',
              sm: '12px',
              xs: '12px',
            }}
            lineHeight={'normal'}
          >
            Trade or Lend via xBank Open Money Market to Earn Boxdrop Rewards
          </Text>
        </Flex>
        {/* <BannerImg /> */}
        {/* <ReactSVG src={BannerImg} wrapper='div' width={'100%'} /> */}
        {/* <Image src={BannerImg} width='100%' /> */}
      </Box>
      {/* 两个 tab */}
      <Container width={'100%'} maxW='1440px'>
        <Box>
          {/* 渐变色头 */}
          <Box
            borderRadius={{
              md: '16px 16px 0px 0px',
              sm: '4px 4px 0px 0px',
              xs: '4px 4px 0px 0px',
            }}
            background='linear-gradient(212deg, #FFBADB 0%, #458FFF 47.92%, #1CFEF0 100%)'
            w='100%'
            h={{
              md: '24px',
              sm: '6px',
              xs: '6px',
            }}
          />
          {/* 两个 tab */}
          <Flex
            px={{
              md: '38px',
              sm: '10px',
              xs: '10px',
            }}
            py={{
              md: '30px',
              sm: '8px',
              xs: '10px',
            }}
            w='100%'
            background='#022650'
            boxShadow={'0px 0.5px 0px 0px #1DE4FE'}
            borderBottomRadius={{
              md: '16px',
              xs: '4px',
              sm: '4px',
            }}
            gap={{
              md: '20px',
              sm: '4px',
              xs: '4px',
            }}
          >
            <Flex
              justify={'center'}
              flex={1}
              alignItems={'center'}
              borderRadius={{
                md: '16px',
                sm: '4px',
                xs: '4px',
              }}
              onClick={() => {
                if (tabKey === TAB_KEY.WIN_BOX) return
                setTabKey(TAB_KEY.WIN_BOX)
              }}
              bg={
                tabKey === TAB_KEY.WIN_BOX
                  ? 'linear-gradient(212deg, #FFBADB 0%, #458FFF 47.92%, #1CFEF0 100%)'
                  : '#021E3F'
              }
              cursor={'pointer'}
            >
              <Image
                src={ImgQuestionBox}
                boxSize={{
                  lg: '84px',
                  md: '56px',
                  sm: '20px',
                  xs: '20px',
                }}
              />
              <Text
                display={'inline-block'}
                fontSize={{
                  lg: '48px',
                  md: '36px',
                  sm: '14px',
                  xs: '14px',
                }}
                // lineHeight={'74px'}
                fontFamily={'HarmonyOS Sans SC Black'}
                bgGradient={
                  tabKey === TAB_KEY.WIN_BOX
                    ? 'unset'
                    : 'linear-gradient(45deg, #1CFEF0 23%, #458FFF 46%, #FFBADB 90%)'
                }
                color='white'
                bgClip={tabKey === TAB_KEY.WIN_BOX ? 'unset' : 'text'}
              >
                Win Boxs
              </Text>
            </Flex>
            <Flex
              justify={'center'}
              flex={1}
              alignItems={'center'}
              cursor={'pointer'}
              onClick={() => {
                if (tabKey === TAB_KEY.LEADER_BOARD) return
                setTabKey(TAB_KEY.LEADER_BOARD)
              }}
              borderRadius={{
                md: '16px',
                sm: '4px',
                xs: '4px',
              }}
              bg={
                tabKey === TAB_KEY.LEADER_BOARD
                  ? 'linear-gradient(212deg, #FFBADB 0%, #458FFF 47.92%, #1CFEF0 100%)'
                  : '#021E3F'
              }
            >
              <Image
                src={ImgLeaderBoardIcon}
                boxSize={{
                  lg: '84px',
                  md: '56px',
                  sm: '20px',
                  xs: '20px',
                }}
              />
              <Text
                display={'inline-block'}
                fontSize={{
                  lg: '48px',
                  md: '36px',
                  sm: '14px',
                  xs: '14px',
                }}
                // lineHeight={'74px'}
                fontFamily={'HarmonyOS Sans SC Black'}
                bgGradient={
                  tabKey === TAB_KEY.LEADER_BOARD
                    ? 'unset'
                    : 'linear-gradient(45deg, #1CFEF0 23%, #458FFF 46%, #FFBADB 90%)'
                }
                color='white'
                bgClip={tabKey === TAB_KEY.LEADER_BOARD ? 'unset' : 'text'}
              >
                Leader Board
              </Text>
            </Flex>
          </Flex>
          {/* 底部阴影 */}
          <Box
            bgImage={'linear-gradient(to right, #38E9FC 2.99%, #0000FF 98.3%)'}
            h={{
              md: '20px',
              sm: '4px',
              xs: '4px',
            }}
            transformOrigin={'50% 100% 0'}
            transform={{
              md: 'perspective(400px) rotateX(135deg)',
              sm: 'perspective(200px) rotateX(135deg)',
              xs: 'perspective(200px) rotateX(135deg)',
            }}
            position={'relative'}
            top={{
              md: '-20px',
              sm: '-4px',
              xs: '-4px',
            }}
            w={{
              md: '98%',
              sm: '99%',
              xs: '99%',
            }}
            margin='0 auto'
          />
        </Box>
      </Container>

      <Box hidden={tabKey !== TAB_KEY.WIN_BOX}>
        <Container width={'100%'} maxW='1440px'>
          <Box
            bgGradient={'linear-gradient(0deg, #071E38, #071E38)'}
            color={'#FFFFFF'}
          >
            <Box
              marginBottom={{
                md: '72px',
                sm: '20px',
                xs: '20px',
              }}
              marginTop={{
                md: '34.5px',
                sm: '10px',
                xs: '10px',
              }}
            >
              <CusCard title='My Boxdrops'>
                <CardBody
                  padding={{
                    md: '16px',
                    sm: 2,
                    xs: 2,
                  }}
                >
                  {!!rankData?.data?.info && (
                    <Flex
                      display={{ md: 'flex', sm: 'none', xs: 'none' }}
                      justifyContent={'center'}
                      mb='30px'
                    >
                      <Flex
                        fontFamily={'HarmonyOS Sans SC Bold'}
                        gap='10px'
                        alignItems={'center'}
                        borderRadius={16}
                        bg='#021E3F'
                        padding='4px 0px 4px 16px'
                      >
                        You are now ranked {rankData?.data?.info?.rank}
                        <Button
                          variant={'linear'}
                          w='192px'
                          h='39px'
                          borderRadius={12}
                          onClick={() => setTabKey(TAB_KEY.LEADER_BOARD)}
                        >
                          check leadboard
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                  <Flex
                    justifyContent={'space-around'}
                    alignItems={'center'}
                    flexWrap={{
                      md: 'nowrap',
                      sm: 'wrap',
                      xs: 'wrap',
                    }}
                  >
                    {!state.expired &&
                      !state.hasCompleted &&
                      !state.hasClaimed && (
                        <Flex
                          alignItems={{
                            md: 'flex-start',
                            sm: 'center',
                            xs: 'center',
                          }}
                          justifyContent={{
                            md: 'space-around',
                            sm: 'space-between',
                            xs: 'space-between',
                          }}
                          flexDirection={{
                            md: 'column',
                            sm: 'row',
                            xs: 'row',
                          }}
                          w={{
                            md: '335px',
                            sm: '100%',
                            xs: '100%',
                          }}
                          mr={{
                            md: '35px',
                            sm: 0,
                            xs: 0,
                          }}
                          borderBottom={{
                            md: 'none',
                            sm: '0.5px solid white',
                            xs: '0.5px solid white',
                          }}
                        >
                          <Box>
                            <Text
                              fontSize={{
                                md: 28,
                                sm: '14px',
                                xs: '14px',
                              }}
                              fontFamily={'HarmonyOS Sans SC Bold'}
                            >
                              Welcome Rewards
                            </Text>
                            <Text
                              color='#566E8C'
                              fontSize={{
                                md: 16,
                                sm: '12px',
                                xs: '12px',
                              }}
                              marginBottom={{
                                md: 19,
                                sm: '10px',
                                xs: '10px',
                              }}
                              whiteSpace={{
                                md: 'break-spaces',
                                sm: 'normal',
                                xs: 'normal',
                              }}
                            >
                              {`Follow Twitter @xBankOfficial\nand retweet the Pin post`}
                            </Text>
                          </Box>

                          <Button
                            w={{
                              md: '240px',
                              sm: '80px',
                              xs: '24px',
                            }}
                            h={{
                              md: '55px',
                              sm: '24px',
                              xs: '24px',
                            }}
                            fontSize={{
                              md: '20px',
                              sm: '14px',
                              xs: '14px',
                            }}
                            fontFamily={'HarmonyOS Sans SC Black'}
                            variant={'linear'}
                            textShadow={'0px 1px 0px #0000FF'}
                            onClick={() => {
                              window.open(VITE_APP_GALXE_TAKS_LINK, '_blank')
                            }}
                          >
                            Claim
                          </Button>
                        </Flex>
                      )}
                    {!state.expired &&
                      !state.hasCompleted &&
                      !state.hasClaimed && (
                        <Box
                          borderRight={'1px solid white'}
                          h='200px'
                          display={{
                            md: 'block',
                            sm: 'none',
                            xs: 'none',
                          }}
                        />
                      )}
                    <Flex
                      justify={'space-around'}
                      w='100%'
                      mt={{
                        sm: '20px',
                        xs: '20px',
                      }}
                    >
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={Box1}
                          w={{
                            md: '214px',
                            sm: '80px',
                            xs: '80px',
                          }}
                          zIndex={1}
                        />
                        <Image
                          src={BoxShadow}
                          w={{
                            md: '165px',
                            sm: '60px',
                            xs: '60px',
                          }}
                          mt={{
                            md: '-55px',
                            sm: '-16px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '20px',
                            xs: '12px',
                            sm: '12px',
                          }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                          mt={{
                            md: '-25px',
                            sm: '-10px',
                            xs: '-10px',
                          }}
                        >
                          Bronze
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={{ md: '36px', sm: '20px', xs: '24px' }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_bronze).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={Box2}
                          w={{
                            md: '214px',
                            sm: '80px',
                            xs: '80px',
                          }}
                          zIndex={1}
                        />
                        <Image
                          src={BoxShadow}
                          w={{
                            md: '165px',
                            sm: '60px',
                            xs: '60px',
                          }}
                          mt={{
                            md: '-55px',
                            sm: '-16px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '20px',
                            xs: '12px',
                            sm: '12px',
                          }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                          mt={{
                            md: '-25px',
                            sm: '-10px',
                            xs: '-10px',
                          }}
                        >
                          Silver
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={{ md: '36px', sm: '20px', xs: '24px' }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_silver).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={Box3}
                          w={{
                            md: '214px',
                            sm: '80px',
                            xs: '80px',
                          }}
                          zIndex={1}
                        />
                        <Image
                          src={BoxShadow}
                          w={{
                            md: '165px',
                            sm: '60px',
                            xs: '60px',
                          }}
                          mt={{
                            md: '-55px',
                            sm: '-16px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '20px',
                            xs: '12px',
                            sm: '12px',
                          }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                          mt={{
                            md: '-25px',
                            sm: '-10px',
                            xs: '-10px',
                          }}
                        >
                          Gold
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={{ md: '36px', sm: '20px', xs: '24px' }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_gold).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={Box4}
                          w={{
                            md: '214px',
                            sm: '80px',
                            xs: '80px',
                          }}
                          zIndex={1}
                        />
                        <Image
                          src={BoxShadow}
                          w={{
                            md: '165px',
                            sm: '60px',
                            xs: '60px',
                          }}
                          mt={{
                            md: '-55px',
                            sm: '-16px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '20px',
                            xs: '12px',
                            sm: '12px',
                          }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                          mt={{
                            md: '-25px',
                            sm: '-10px',
                            xs: '-10px',
                          }}
                        >
                          Platinum
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={{ md: '36px', sm: '20px', xs: '24px' }}
                          fontFamily={{
                            md: 'HarmonyOS Sans SC Bold',
                            sm: 'HarmonyOS Sans SC',
                            xs: 'HarmonyOS Sans SC',
                          }}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_platinum).toFormat()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </CardBody>
              </CusCard>
            </Box>
            <Box
              marginBottom={{
                md: '80.5px',
                sm: '20px',
                xs: '20px',
              }}
            >
              <SimpleGrid
                columns={{
                  md: 2,
                  sm: 1,
                  xs: 1,
                }}
                spacing={{
                  md: 10,
                  sm: '20px',
                  xs: '20px',
                }}
              >
                <CusCard title='Buy NFT'>
                  <CardBody
                    padding={{
                      md: '20px',
                      sm: '20px 8px 8px 8px',
                    }}
                  >
                    <Text
                      fontSize={{
                        md: '18px',
                        sm: '12px',
                        xs: '12px',
                      }}
                      fontFamily={{
                        md: 'HarmonyOS Sans SC Medium',
                        sm: 'HarmonyOS Sans SC',
                        xs: 'HarmonyOS Sans SC',
                      }}
                      h={{
                        md: '36px',
                        sm: 'auto',
                        xs: 'auto',
                      }}
                      lineHeight={{
                        md: '18px',
                        sm: 'normal',
                        xs: 'normal',
                      }}
                      mb={{
                        md: '4px',
                      }}
                    >
                      {`Pick up your favor NFT on “Buy NFT” -> “Market” and unlock it with xBank get boxdrop rewards as you made a purchase. `}
                    </Text>
                    <Text
                      fontSize={{
                        md: '16px',
                        sm: '14px',
                        xs: '14px',
                      }}
                      color='#FF0066'
                      fontFamily={{
                        md: 'HarmonyOS Sans SC Medium',
                        sm: 'HarmonyOS Sans SC',
                        xs: 'HarmonyOS Sans SC',
                      }}
                    >
                      <Link
                        href='https://xbankdocs.gitbook.io/product-docs/overview/buyer-guide'
                        target='_blank'
                      >
                        Learn More
                      </Link>
                    </Text>
                    <Flex
                      justifyContent={'space-around'}
                      mt={{
                        sm: '10px',
                        xs: '10px',
                      }}
                    >
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={ImgWalletOk}
                          w={{
                            md: 88,
                            sm: '44px',
                            xs: '44px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '14px',
                            xs: '14px',
                          }}
                          textAlign={'center'}
                        >
                          Loan rewards
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={ImgBrowser}
                          w={{
                            md: 88,
                            sm: '44px',
                            xs: '44px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '14px',
                            xs: '14px',
                          }}
                          textAlign={'center'}
                        >
                          Repayment rewards
                        </Text>
                      </Flex>
                    </Flex>
                    <Center
                      pt={{
                        md: '30px',
                        sm: '20px',
                        xs: '20px',
                      }}
                    >
                      <Button
                        w={{
                          md: '300px',
                          sm: '130px',
                          xs: '130px',
                        }}
                        textShadow={'0px 1px 0px #0000FF'}
                        variant='linear'
                        fontFamily={'HarmonyOS Sans SC Black'}
                        fontSize={{
                          md: '24px',
                          sm: '14px',
                          xs: '14px',
                        }}
                        h={{
                          md: '60px',
                          sm: '32px',
                          xs: '32px',
                        }}
                        onClick={() => {
                          navigate('/buy-nfts/market')
                        }}
                      >
                        Get Gold Box
                      </Button>
                    </Center>
                  </CardBody>
                </CusCard>
                <CusCard title='Offer loans'>
                  <CardBody
                    padding={{
                      md: '20px',
                      sm: '20px 8px 8px 8px',
                    }}
                  >
                    <Text
                      fontSize={{
                        md: '18px',
                        sm: '12px',
                        xs: '12px',
                      }}
                      fontFamily={{
                        md: 'HarmonyOS Sans SC Medium',
                        sm: 'HarmonyOS Sans SC',
                        xs: 'HarmonyOS Sans SC',
                      }}
                      h={{
                        md: '36px',
                        sm: 'auto',
                        xs: 'auto',
                      }}
                      lineHeight={{
                        md: '18px',
                        sm: 'normal',
                        xs: 'normal',
                      }}
                      mb={{
                        md: '4px',
                      }}
                    >
                      Create fund pool to offer loans to other users, get boxes
                      rewards.
                    </Text>
                    <Text
                      fontSize='18px'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      {`\n`}
                    </Text>
                    <Text
                      fontSize={{
                        md: '16px',
                        sm: '14px',
                        xs: '14px',
                      }}
                      color='#FF0066'
                      fontFamily={{
                        md: 'HarmonyOS Sans SC Medium',
                        sm: 'HarmonyOS Sans SC',
                        xs: 'HarmonyOS Sans SC',
                      }}
                    >
                      <Link
                        href='https://xbankdocs.gitbook.io/product-docs/overview/lender-guide'
                        target='_blank'
                      >
                        Learn More
                      </Link>
                    </Text>
                    <Flex
                      justifyContent={'space-around'}
                      mt={{
                        sm: '10px',
                        xs: '10px',
                      }}
                    >
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={ImgPlusWallet}
                          w={{
                            md: 88,
                            sm: '44px',
                            xs: '44px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '14px',
                            xs: '14px',
                          }}
                          textAlign={'center'}
                        >
                          Create collection pool rewards
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image
                          src={ImgCoinInBox}
                          w={{
                            md: 88,
                            sm: '44px',
                            xs: '44px',
                          }}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '14px',
                            xs: '14px',
                          }}
                          textAlign={'center'}
                        >
                          Reward for successful lending of funds
                        </Text>
                      </Flex>
                    </Flex>
                    <Center
                      pt={{
                        md: '30px',
                        sm: '20px',
                        xs: '20px',
                      }}
                    >
                      <Button
                        w={{
                          md: '300px',
                          sm: '130px',
                          xs: '130px',
                        }}
                        textShadow={'0px 1px 0px #0000FF'}
                        variant='linear'
                        fontFamily={'HarmonyOS Sans SC Black'}
                        fontSize={{
                          md: '24px',
                          sm: '14px',
                          xs: '14px',
                        }}
                        h={{
                          md: '60px',
                          sm: '32px',
                          xs: '32px',
                        }}
                        onClick={() => {
                          navigate('/lending/collections')
                        }}
                      >
                        Get Gold Box
                      </Button>
                    </Center>
                  </CardBody>
                </CusCard>
              </SimpleGrid>
            </Box>

            <TitleWithQuestionBox
              title='Invite Friends'
              src={IconInviteFriend}
            />
            <Text
              fontSize={{
                md: '14px',
                sm: '12px',
                xs: '12px',
              }}
              lineHeight={{
                md: '18px',
                sm: 'normal',
                xs: 'normal',
              }}
              color='#566E8C'
            >
              {`Invite friends to join xBank protocol using your unique referral
              link and you'll both receive mystery boxes rewards.`}
            </Text>
            <Box
              borderBottomWidth={'1px'}
              borderBottomColor={'#32E8FC'}
              marginTop={'11px'}
              marginBottom={'69px'}
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}
            />
            <Box>
              <Flex
                justifyContent={{
                  md: 'space-between',
                  sm: 'center',
                  xs: 'center',
                }}
                mb={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
                flexWrap={{
                  md: 'nowrap',
                  sm: 'wrap',
                  xs: 'wrap',
                }}
                rowGap={'16px'}
                mt={{
                  sm: '16px',
                  xs: '16px',
                }}
              >
                <Flex direction={'column'} alignItems={'center'} w='30%'>
                  <Image
                    width={{
                      md: '88px',
                      sm: '44px',
                      xs: '44px',
                    }}
                    src={Icon0}
                    mb={{
                      md: '15px',
                      sm: '8px',
                      xs: '8px',
                    }}
                  />
                  <Text
                    fontSize={{
                      md: '16px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={{
                      md: 'HarmonyOS Sans SC Medium',
                      sm: 'HarmonyOS Sans SC',
                      xs: 'HarmonyOS Sans SC',
                    }}
                    w={{
                      md: '141px',
                      sm: 'auto',
                      xs: 'auto',
                    }}
                    textAlign={'center'}
                  >
                    Wallet Connect xBank Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'} w='30%'>
                  <Image
                    width={{
                      md: '88px',
                      sm: '44px',
                      xs: '44px',
                    }}
                    src={Icon1}
                    mb={{
                      md: '15px',
                      sm: '8px',
                      xs: '8px',
                    }}
                  />
                  <Text
                    fontSize={{
                      md: '16px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={{
                      md: 'HarmonyOS Sans SC Medium',
                      sm: 'HarmonyOS Sans SC',
                      xs: 'HarmonyOS Sans SC',
                    }}
                    w={{
                      md: '141px',
                      sm: 'auto',
                      xs: 'auto',
                    }}
                    textAlign={'center'}
                  >
                    Friend Borrowing Success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'} w='30%'>
                  <Image
                    width={{
                      md: '88px',
                      sm: '44px',
                      xs: '44px',
                    }}
                    src={Icon2}
                    mb={{
                      md: '15px',
                      sm: '8px',
                      xs: '8px',
                    }}
                  />
                  <Text
                    fontSize={{
                      md: '16px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={{
                      md: 'HarmonyOS Sans SC Medium',
                      sm: 'HarmonyOS Sans SC',
                      xs: 'HarmonyOS Sans SC',
                    }}
                    w={{
                      md: '141px',
                      sm: 'auto',
                      xs: 'auto',
                    }}
                    textAlign={'center'}
                  >
                    Friend repayment success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'} w='30%'>
                  <Image
                    width={{
                      md: '88px',
                      sm: '44px',
                      xs: '44px',
                    }}
                    src={Icon3}
                    mb={{
                      md: '15px',
                      sm: '8px',
                      xs: '8px',
                    }}
                  />
                  <Text
                    fontSize={{
                      md: '16px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={{
                      md: 'HarmonyOS Sans SC Medium',
                      sm: 'HarmonyOS Sans SC',
                      xs: 'HarmonyOS Sans SC',
                    }}
                    w={{
                      md: '141px',
                      sm: 'auto',
                      xs: 'auto',
                    }}
                    textAlign={'center'}
                  >
                    Friend creat pool success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'} w='30%'>
                  <Image
                    width={{
                      md: '88px',
                      sm: '44px',
                      xs: '44px',
                    }}
                    src={Icon4}
                    mb={{
                      md: '15px',
                      sm: '8px',
                      xs: '8px',
                    }}
                  />
                  <Text
                    fontSize={{
                      md: '16px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={{
                      md: 'HarmonyOS Sans SC Medium',
                      sm: 'HarmonyOS Sans SC',
                      xs: 'HarmonyOS Sans SC',
                    }}
                    w={{
                      md: '141px',
                      sm: 'auto',
                      xs: 'auto',
                    }}
                    textAlign={'center'}
                  >
                    Friend lending success Rewards
                  </Text>
                </Flex>
              </Flex>
              {state.expired ? (
                <Flex justifyContent={'center'} mb='205px' pt='27px'>
                  <Button
                    color='#FFFFFF'
                    bgColor={'rgba(80, 176, 248, 1)'}
                    _hover={{
                      bgColor: 'rgba(80, 176, 248, 0.9)',
                    }}
                    w='100%'
                    maxW='600px'
                    fontSize={{
                      md: '20px',
                      sm: '12px',
                      xs: '12px',
                    }}
                    h={{
                      md: '54px',
                      xs: '12px',
                      sm: '12px',
                    }}
                    fontFamily={'HarmonyOS Sans SC Bold'}
                    onClick={async () => {
                      await connectWallet()
                      const tokenInfo = getUserToken()
                      if (tokenInfo === null) {
                        setState({
                          expired: true,
                        })
                      } else {
                        const now = moment(new Date())
                        const expired = now.isAfter(tokenInfo?.expires)
                        setState({
                          expired,
                        })
                      }
                    }}
                  >
                    Connect Wallet
                  </Button>
                </Flex>
              ) : (
                <>
                  {!state.hasUsedXBN ? (
                    <Flex
                      justifyContent={'center'}
                      mb={{ md: '205px', sm: '40px', xs: '40px' }}
                      pt={{
                        md: '27px',
                        sm: 0,
                        xs: 0,
                      }}
                    >
                      <Button
                        color='#FFFFFF'
                        bgColor={'rgba(80, 176, 248, 1)'}
                        _hover={{
                          bgColor: 'rgba(80, 176, 248, 0.9)',
                        }}
                        w='100%'
                        h={{
                          md: '54px',
                          sm: '28px',
                          xs: '28px',
                        }}
                        maxW='600px'
                        fontSize={{
                          md: 20,
                          sm: '12px',
                          xs: '12px',
                        }}
                        fontFamily={'HarmonyOS Sans SC Bold'}
                        onClick={() => {
                          navigate('/buy-nfts/market')
                        }}
                        noOfLines={{
                          md: 2,
                          sm: 1,
                          xs: 1,
                        }}
                      >
                        Unlock invitations by completing a lending or borrowing
                      </Button>
                    </Flex>
                  ) : (
                    <Box
                      mb={{
                        md: '86px',
                        sm: '20px',
                        xs: '20px',
                      }}
                      bgColor={'#022650'}
                      border='1px solid #32E8FC'
                      padding={{
                        md: '24px 28px',
                        sm: '16px 12px',
                        xs: '16px 12px',
                      }}
                      borderRadius={{
                        md: '16px',
                        sm: '8px',
                        xs: '8px',
                      }}
                    >
                      <Flex
                        mb={{
                          md: '40px',
                          sm: '20px',
                          xs: '20px',
                        }}
                        alignItems={'center'}
                        flexWrap={{
                          md: 'nowrap',
                          sm: 'wrap',
                          xs: 'wrap',
                        }}
                        rowGap={'4px'}
                      >
                        <Text
                          fontSize={{
                            md: '24px',
                            sm: '14px',
                            xs: '14px',
                          }}
                          fontWeight={{
                            md: 900,
                            sm: 700,
                            xs: 700,
                          }}
                          fontFamily={'HarmonyOS Sans SC Black'}
                          // w='200px'???
                          flexBasis={'200px'}
                          display={'inline-block'}
                          flexShrink={0}
                        >
                          Invitation Link:
                        </Text>
                        <Box
                          border={{
                            md: '1px solid #B3B3FF',
                            sm: '0.5px solid #B3B3FF',
                            xs: '0.5px solid #B3B3FF',
                          }}
                          borderRadius={{
                            md: '28px',
                            sm: '4px',
                            xs: '4px',
                          }}
                          w={{
                            sm: '100%',
                          }}
                          // w='733px'
                        >
                          <Flex
                            padding={{
                              md: '3px 2px',
                              sm: 0,
                              xs: 0,
                            }}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                          >
                            <Flex alignItems={'center'}>
                              <Text
                                color='#B5C4D7'
                                fontSize={{
                                  md: '24px',
                                  sm: '12px',
                                  xs: '12px',
                                }}
                                lineHeight={{
                                  md: '24px',
                                  sm: '10px',
                                  xs: '10px',
                                }}
                                fontWeight={400}
                                fontFamily={'HarmonyOS Sans SC Regular'}
                                px={{
                                  md: '18px',
                                  sm: '4px',
                                  xs: '4px',
                                }}
                                noOfLines={2}
                              >
                                {invitationLink}
                              </Text>
                              <Button variant={'unstyled'} onClick={onCopy}>
                                {hasCopied ? (
                                  <Image
                                    src={IconCopied}
                                    boxSize={{
                                      md: '24px',
                                      xs: '12px',
                                      sm: '12px',
                                    }}
                                  />
                                ) : (
                                  <Image
                                    src={IconCopy}
                                    boxSize={{
                                      md: '24px',
                                      xs: '12px',
                                      sm: '12px',
                                    }}
                                  />
                                )}
                              </Button>
                            </Flex>
                            <Button
                              color='#FFFFFF'
                              h={{
                                md: '54px',
                                sm: '28px',
                                xs: '28px',
                              }}
                              borderRadius={{
                                md: '50px',
                                sm: '4px',
                                xs: '4px',
                              }}
                              paddingX={{
                                md: '83px',
                                sm: '10px',
                                xs: '10px',
                              }}
                              bgColor={'rgba(80, 176, 248, 1)'}
                              _hover={{
                                bgColor: 'rgba(80, 176, 248, 0.9)',
                              }}
                              onClick={() => {
                                console.log(
                                  window.location.href +
                                    `?invitation_code=${inviteCode}`,
                                )
                                setInvitationLink(
                                  window.location.host +
                                    `/buy-nfts/market?invitation_code=${inviteCode}`,
                                )
                                onCopy()
                                onOpen()
                              }}
                              minW={'100px'}
                            >
                              <Text
                                fontSize={{
                                  md: '20px',
                                  sm: '12px',
                                  xs: '12px',
                                }}
                                fontFamily={{
                                  md: 'HarmonyOS Sans SC Bold',
                                  sm: 'HarmonyOS Sans SC',
                                  xs: 'HarmonyOS Sans SC',
                                }}
                                transform={{
                                  md: 'none',
                                  sm: 'scale(0.83333)',
                                  xs: 'scale(0.83333)',
                                }}
                                transformOrigin='center'
                              >
                                Get Sliver Box
                              </Text>
                            </Button>
                          </Flex>
                        </Box>
                      </Flex>
                      <Flex alignItems={'center'} gap={'20px'}>
                        <Text
                          fontSize={{
                            md: '24px',
                            xs: '14px',
                            sm: '14px',
                          }}
                          fontWeight={{
                            md: 900,
                            sm: 700,
                            xs: 700,
                          }}
                          fontFamily={'HarmonyOS Sans SC Black'}
                          // w='200px'??
                          flexBasis={{
                            md: '200px',
                          }}
                          display={'inline-block'}
                          flexShrink={0}
                        >
                          Share To:
                        </Text>
                        <Link
                          href={encodeURI(
                            `https://twitter.com/intent/tweet?text=${SHARE_TWITTER_TEXT}&url=${invitationLink}`,
                          )}
                          target='_blank'
                        >
                          <Flex
                            direction={{
                              md: 'column',
                              sm: 'row',
                              xs: 'row',
                            }}
                            alignItems={'center'}
                          >
                            <Image
                              src={IconTwitter}
                              w={{
                                md: '32px',
                                sm: '20px',
                                xs: '20px',
                              }}
                              fontSize={'16px'}
                            />
                            <Text
                              fontSize={{
                                md: '16px',
                                sm: '12px',
                                xs: '12px',
                              }}
                              fontFamily={'HarmonyOS Sans SC'}
                            >
                              Twitter
                            </Text>
                          </Flex>
                        </Link>
                        <Link
                          href={encodeURI(
                            `https://t.me/share/url?url=${invitationLink}&text=${SHARE_TELEGRAM_TEXT}`,
                          )}
                          target='_blank'
                        >
                          <Flex
                            direction={{
                              md: 'column',
                              sm: 'row',
                              xs: 'row',
                            }}
                            alignItems={'center'}
                            // w='120px'??
                          >
                            <Image
                              src={IconTelegram}
                              w={{
                                md: '32px',
                                sm: '20px',
                                xs: '20px',
                              }}
                              fontSize={'16px'}
                            />
                            <Text
                              fontSize={{
                                md: '16px',
                                sm: '12px',
                                xs: '12px',
                              }}
                              fontFamily={'HarmonyOS Sans SC'}
                            >
                              Telegram
                            </Text>
                          </Flex>
                        </Link>
                      </Flex>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Container>
        <Box bg='#07274B'>
          <Container
            maxW={{
              md: '1440px',
              sm: '100%',
              xs: '100%',
            }}
            py={{
              md: '60px',
              sm: '16px',
              xs: '16px',
            }}
            px={{
              sm: '10px',
              xs: '10px',
            }}
            position={'relative'}
          >
            <Image
              src={IconLogo}
              w={{
                md: '100px',
                sm: '50px',
                xs: '50px',
              }}
              position={'absolute'}
              top={{
                md: '35px',
                sm: '30px',
                xs: '30px',
              }}
              right={{
                md: '54px',
                sm: '16px',
                xs: '16px',
              }}
            />
            <Box color='#566E8C'>
              <Text
                color='#FFFFFF'
                fontSize={'28px'}
                fontFamily={'HarmonyOS Sans SC Bold'}
                mb={{
                  md: '27px',
                  sm: '16px',
                  xs: '16px',
                }}
              >
                Rules:
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`1. Boxdrop is a contributor reward program launched by the xBank protocol to reward loyal users who join and use the xBank protocol in the beta release.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`2. The event will begin on June 7, 2023, and last for at least 3 months. The end time of the event will be announced before August 30, 2023.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`3. Users who use the xBank protocol to buy NFTs on a Buy Now Pay Later basis will receive different types of boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`4. Lenders who provide fund loans to borrowers through the xBank protocol will receive different types of boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`5. Borrowers or lenders who invite friends to interact with the xBank protocol will both receive boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`6. Following xBank's official Twitter account and retweeting the pinned post will receive Welcome Boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`7. The boxdrops obtained by users will be revealed after the end of the campaign, and different levels of boxdrops will have different credit points.`}
              </Text>
              <Text fontSize={'18px'} mb='18px' lineHeight={'18px'}>
                {`8. Any invalid or non-friendly protocol interaction behavior during the campaign will be blacklisted for receiving boxdrops.`}
              </Text>
              <Text fontSize={'18px'} lineHeight={'18px'}>
                Learn more about the rules and rewards
                <Link
                  style={{ marginLeft: '10px' }}
                  color='#FF0066'
                  textDecoration={'underline'}
                  href='https://xbankdocs.gitbook.io/product-docs/overview/xbank-boxdrop-earning-s1-live-now'
                  target='_blank'
                >
                  check here
                </Link>
              </Text>
            </Box>
            {/* <Box>
              <Button
                onClick={() => {
                  testFn1()
                }}
              >
                Test1
              </Button>
              <Button
                onClick={() => {
                  testFn2()
                }}
              >
                Test2
              </Button>
            </Box> */}
          </Container>
        </Box>
      </Box>

      {/* 排行榜 */}
      <Box hidden={tabKey !== TAB_KEY.LEADER_BOARD} pb='200px'>
        <Container width={'100%'} maxW='1440px'>
          {/* pc 端的头 */}
          <Image
            src={ImgLeaderBoardTitle}
            display={{
              md: 'block',
              sm: 'none',
              xs: 'none',
            }}
            mt='40px'
          />
          <Box
            p={{
              md: '16px',
              sm: '10px',
              xs: '10px',
            }}
            borderBottomRadius={{
              md: '16px',
              sm: '4px',
              xs: '4px',
            }}
            borderTopRadius={{
              md: 0,
              sm: '4px',
              xs: '4px',
            }}
            bg='#022650'
            borderWidth={1}
            borderColor={'#fff'}
            borderTopWidth={{
              md: 0,
              sm: 1,
              xs: 1,
            }}
            boxShadow={'0px 4px 0px 0px #1DE4FE'}
            mt={{
              md: 0,
              sm: '20px',
              xs: '20px',
            }}
          >
            {/* h5 端的头 */}
            <Flex
              justify={{
                md: 'center',
                sm: 'space-between',
                xs: 'space-between',
              }}
              alignItems={'center'}
            >
              <Box>
                <Image
                  src={ImgH5LeaderBoard}
                  display={{
                    md: 'none',
                    sm: 'initial',
                    xs: 'initial',
                  }}
                  w='220px'
                />
              </Box>
              <Image
                src={ImgH5Prize}
                boxSize='42px'
                display={{
                  md: 'none',
                  sm: 'initial',
                  xs: 'initial',
                }}
              />
            </Flex>

            <Box
              bg='#072444'
              borderRadius={{
                md: '16px',
                sm: '4px',
                xs: '4px',
              }}
              p={{
                md: '20px',
                sm: '8px',
                xs: '8px',
              }}
            >
              {/* 前 100 排名 */}
              <Box>
                {/* 表头 */}
                <Flex
                  w='100%'
                  borderWidth={{
                    md: 1,
                    sm: '0.25px',
                    xs: '0.25px',
                  }}
                  borderColor={'white'}
                  borderRadius={{
                    md: 8,
                    sm: 2,
                    xs: 2,
                  }}
                  bg='blue.1'
                >
                  {[
                    {
                      title: 'Ranking',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: 'User',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: 'Gold',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: 'Silver',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: 'Bronze',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: 'Total',
                      w: INITIAL_WIDTH,
                    },
                    {
                      title: '',
                    },
                  ].map((item) => (
                    <Box
                      key={item.title}
                      px={{
                        md: '14px',
                        sm: '0px',
                        xs: '0px',
                      }}
                      py={{ md: '14px', sm: '2px', xs: '2px' }}
                      color={'white'}
                      fontFamily={'HarmonyOS Sans SC Medium'}
                      borderRightColor={'white'}
                      borderRightWidth={{
                        md: !!item.title ? 1 : 0,
                        sm: !!item.title ? 0.25 : 0,
                        xs: !!item.title ? 0.25 : 0,
                      }}
                      w={item.w || 'auto'}
                    >
                      <Text
                        textAlign={{
                          md: 'center',
                          sm: 'center',
                          xs: 'center',
                        }}
                        letterSpacing={{
                          md: 0,
                          sm: '-0.4px',
                          xs: '-0.4px',
                        }}
                        fontSize={{
                          xl: '24px',
                          lg: '20px',
                          md: '18px',
                          sm: '12px',
                          xs: '12px',
                        }}
                        transform={{
                          md: 'none',
                          sm: 'scale(0.83334)',
                          xs: 'scale(0.83334)',
                        }}
                        transformOrigin='center'
                        lineHeight={{
                          md: '20px',
                          sm: 'normal',
                          xs: 'normal',
                        }}
                      >
                        {item.title}
                      </Text>
                    </Box>
                  ))}
                </Flex>
                {/* 内容 */}
                <Box
                  py={{
                    md: '8px',
                    sm: 0,
                    xs: 0,
                  }}
                  position={'relative'}
                >
                  <LoadingComponent loading={rankLoading} top={0} />
                  {!!rankData?.data?.info && (
                    <RankItem
                      data={{ ...rankData?.data?.info, address: 'You' }}
                      isHighlight
                    />
                  )}
                  {isLogin && !rankData?.data?.info && (
                    <RankItem
                      data={{
                        address: 'You',
                      }}
                      isHighlight
                    />
                  )}

                  {rankData?.data?.ranking_infos.map((item) => (
                    <RankItem key={item.address} data={item} />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={'auto'}
      >
        <AlertDialogOverlay />
        <AlertDialogContent
          borderRadius={'15px'}
          w={{
            md: '576px',
            sm: '80%',
            xs: '80%',
          }}
        >
          <AlertDialogCloseButton opacity={0} />
          <Image src={ImgDialogBanner} w='100%' />
          <AlertDialogFooter>
            <Stack
              w='100%'
              gap={{
                md: '20px',
                sm: '10px',
                xs: '10px',
              }}
              mb={{
                md: '20px',
                sm: '10px',
                xs: '10px',
              }}
              alignItems={'center'}
            >
              <Flex>
                <Text
                  fontSize={{
                    md: '24px',
                    sm: '14px',
                    xs: '14px',
                  }}
                  lineHeight={{
                    md: '32px',
                    sm: 'normal',
                    xs: 'normal',
                  }}
                  textAlign={'center'}
                  fontFamily={'HarmonyOS Sans SC Medium'}
                >
                  Invitation link has been copied, share with friends now.
                </Text>
              </Flex>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant={'linear'}
                color='#FFFFFF'
                h={{ md: '50px', sm: '40px', xs: '40px' }}
                fontSize={{
                  md: '20px',
                  sm: '14px',
                  xs: '14px',
                }}
                fontFamily={'HarmonyOS Sans SC Bold'}
                w={{
                  md: '300px',
                  sm: '200px',
                  xs: '200px',
                }}
              >
                OK
              </Button>
            </Stack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  )
}

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
import { useAsyncEffect, useSetState } from 'ahooks'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetLoans } from '@/api'
import {
  apiGalxeRedeem,
  apiGalxeStatus,
  apiGetBoxes,
  apiGetInviteCode,
  apiRewardExists,
} from '@/api/marketing-campaign'
// import BannerImg from '@/assets/marketing/banner-4x.png'
import ImgDialogBanner from '@/assets/marketing/banner-dialog.png'
import BannerImg from '@/assets/marketing/banner.png'
import BoxShadow from '@/assets/marketing/box-shadow.png'
import Box1 from '@/assets/marketing/box1.png'
import Box2 from '@/assets/marketing/box2.png'
import Box3 from '@/assets/marketing/box3.png'
import Box4 from '@/assets/marketing/box4.png'
import IconCopied from '@/assets/marketing/copied.png'
import IconInviteFriend from '@/assets/marketing/icon-box-check-line.png'
import IconCopy from '@/assets/marketing/icon-copy.png'
import ImgQuestionBox from '@/assets/marketing/icon-win-box.png'
import IconTelegram from '@/assets/marketing/telegram.png'
import IconTwitter from '@/assets/marketing/twitter.png'
import IconLogo from '@/assets/marketing/xbank-logo.png'
import { Header } from '@/components'
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
const { VITE_APP_GALXE_TAKS_LINK } = import.meta.env
const SHARE_TELEGRAM_TEXT = `Buy NFT pay later with 0% down payment, win Boxdrop`
const SHARE_TWITTER_TEXT = `xBank is An NFT Open Money Market Powering Web3 Adopters with Onboarding Leverage with NFT BNPL and Improving Money Efficiency for Holders\nJoin @xBank_Official, buy top NFTs pay later, with 0% downpayment, and earn Boxdrop`
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
export default function MarketingCampaign() {
  const navigate = useNavigate()
  const toast = useToast()
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

  useAsyncEffect(async () => {
    if (!state.expired) {
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
  }, [state.expired])
  useAsyncEffect(async () => {
    // 查询用户是否使用过 XBN
    if (!state.expired) {
      const list = await apiGetLoans({
        lender_address: address,
        borrower_address: address,
      })
      setState({
        hasUsedXBN: list.length > 0,
      })
    }
  }, [state.expired, address])
  useAsyncEffect(async () => {
    if (!state.expired && state.hasUsedXBN) {
      const data = await apiGetInviteCode()
      setInviteCode(data.code)
      setInvitationLink(
        window.location.host + `/buy-nfts/market?invitation_code=${data.code}`,
      )
    }
  }, [state.expired, state.hasUsedXBN])
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
    } else {
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
  }, [state.expired])
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
          maxW={'70%'}
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
          }}
          pt={{
            md: 0,
            sm: '32px',
            xs: '32px',
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
      <Box>
        <Container width={'100%'} maxW='1440px'>
          <Box
            bgGradient={'linear-gradient(0deg, #071E38, #071E38)'}
            color={'#FFFFFF'}
          >
            <TitleWithQuestionBox title='Win Box' />
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
                    md: 10,
                    sm: 2,
                    xs: 2,
                  }}
                >
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
                        noOfLines={2}
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
                                  sm: '10px',
                                  xs: '10px',
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
                                    h={{
                                      md: 'auto',
                                      sm: '30px',
                                      xs: '30px',
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

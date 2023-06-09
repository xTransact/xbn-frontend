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
  Toast,
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
import BannerImg from '@/assets/marketing/banner-4x.png'
import BoxShadow from '@/assets/marketing/box-shadow.png'
import IconCopied from '@/assets/marketing/copied.png'
import IconCopy from '@/assets/marketing/icon-copy.png'
import IconTelegram from '@/assets/marketing/telegram.png'
import IconTwitter from '@/assets/marketing/twitter.png'
import IconLogo from '@/assets/marketing/xbank-logo.png'
import { Header } from '@/components'
import { useWallet } from '@/hooks'
import { getUserToken } from '@/utils/auth'

import ImgDialogBanner from '@/assets/marketing/banner-dialog.svg'
import Box1 from '@/assets/marketing/box1.svg'
import Box2 from '@/assets/marketing/box2.svg'
import Box3 from '@/assets/marketing/box3.svg'
import Box4 from '@/assets/marketing/box4.svg'
import Icon0 from '@/assets/marketing/icon-0.svg'
import Icon1 from '@/assets/marketing/icon-1.svg'
import Icon2 from '@/assets/marketing/icon-2.svg'
import Icon3 from '@/assets/marketing/icon-3.svg'
import Icon4 from '@/assets/marketing/icon-4.svg'
import IconInviteFriend from '@/assets/marketing/icon-box-check-line.svg'
import ImgBrowser from '@/assets/marketing/icon-browser.svg'
import ImgCoinInBox from '@/assets/marketing/icon-coin-in-box.svg'
import ImgPlusWallet from '@/assets/marketing/icon-plus-wallet.svg'
import ImgWalletOk from '@/assets/marketing/icon-wallet-ok.svg'
import ImgQuestionBox from '@/assets/marketing/icon-win-box.svg'
const { VITE_APP_GALXE_TAKS_LINK } = import.meta.env
const SHARE_TELEGRAM_TEXT = `Buy NFT pay later with 0% downpayment, win Boxdrop`
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
            p={'10px 60px 10px 20px'}
            borderTopLeftRadius={16}
            borderTopRightRadius={48}
            bgGradient={
              'linear-gradient(272.41deg, #0000FF 0.82%, #071E38 87.36%)'
            }
          >
            <Text
              display={'inline-block'}
              fontFamily={'HarmonyOS Sans SC Bold'}
              fontSize={28}
              lineHeight={'32px'}
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
      <Image src={props.src || ImgQuestionBox} />
      <Text
        display={'inline-block'}
        fontSize={'64px'}
        lineHeight={'74px'}
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
      <Box marginBottom={'68px'}>
        <Image src={BannerImg} width='100%' />
      </Box>
      <Box>
        <Container width={'100%'} maxW='1440px'>
          <Box
            bgGradient={'linear-gradient(0deg, #071E38, #071E38)'}
            color={'#FFFFFF'}
          >
            <TitleWithQuestionBox title='Win Box' />
            <Box marginBottom={'72px'} marginTop={'34.5px'}>
              <CusCard title='My Boxdrops'>
                <CardBody padding={10}>
                  <Flex justifyContent={'space-around'} alignItems={'center'}>
                    {!state.expired &&
                      !state.hasCompleted &&
                      !state.hasClaimed && (
                        <Flex
                          alignItems={'flex-start'}
                          justifyContent={'space-around'}
                          flexDirection={'column'}
                          maxW={300}
                        >
                          <Text
                            fontSize={28}
                            fontFamily={'HarmonyOS Sans SC Bold'}
                          >
                            Welcome Rewards
                          </Text>
                          <Text
                            color='#566E8C'
                            fontSize={16}
                            marginBottom={19}
                            // textAlign={'center'}
                          >
                            Follow Twitter @xBankOfficial and retweet the Pin
                            post
                          </Text>
                          <Button
                            w='240px'
                            h='55px'
                            fontSize={'20px'}
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
                        <Box borderRight={'1px solid white'} h='200px' />
                      )}
                    <Flex justify={'space-around'} w='100%'>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box1} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'20px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-25px'
                        >
                          Bronze
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_bronze).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box2} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'20px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-25px'
                        >
                          Silver
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_silver).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box3} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'20px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-25px'
                        >
                          Gold
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          {state.expired
                            ? '? ?'
                            : BigNumber(boxAmounts.box_gold).toFormat()}
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box4} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'20px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-25px'
                        >
                          Platinum
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
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
            <Box marginBottom={'80.5px'}>
              <SimpleGrid columns={2} spacing={10}>
                <CusCard title='Buy NFT'>
                  <CardBody padding={'20px 20px 20px 20px'}>
                    <Text
                      fontSize='18px'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                      lineHeight={'18px'}
                      h='36px'
                      mb='4px'
                    >
                      {`Pick up your favor NFT on “Buy NFT” -> “Market” and unlock it with xBank get boxdrop rewards as you made a purchase. `}
                    </Text>
                    <Text
                      fontSize='16px'
                      color='#FF0066'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      <Link
                        href='https://xbankdocs.gitbook.io/product-docs/'
                        target='_blank'
                      >
                        Learn More
                      </Link>
                    </Text>
                    <Flex justifyContent={'space-around'}>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={ImgWalletOk} w={88} />
                        <Text fontSize={'16px'} textAlign={'center'}>
                          Loan rewards
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={ImgBrowser} w={88} />
                        <Text fontSize={'16px'} textAlign={'center'}>
                          Repayment rewards
                        </Text>
                      </Flex>
                    </Flex>
                    <Center pt={'30px'}>
                      <Button
                        w='300px'
                        textShadow={'0px 1px 0px #0000FF'}
                        variant='linear'
                        fontFamily={'HarmonyOS Sans SC Black'}
                        fontSize={'24px'}
                        h='60px'
                        onClick={() => {
                          navigate('/xlending/buy-nfts/market')
                        }}
                      >
                        Get Gold Box
                      </Button>
                    </Center>
                  </CardBody>
                </CusCard>
                <CusCard title='Offer loans'>
                  <CardBody padding={'20px'}>
                    <Text
                      fontSize='18px'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                      lineHeight={'18px'}
                      h='36px'
                      mb='4px'
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
                      fontSize='16px'
                      color='#FF0066'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      <Link
                        href='https://xbankdocs.gitbook.io/product-docs/'
                        target='_blank'
                      >
                        Learn More
                      </Link>
                    </Text>
                    <Flex justifyContent={'space-around'}>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={ImgPlusWallet} w={88} />
                        <Text fontSize={'16px'} textAlign={'center'}>
                          Create collection pool rewards
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={ImgCoinInBox} w={88} />
                        <Text fontSize={'16px'} textAlign={'center'}>
                          Reward for successful lending of funds
                        </Text>
                      </Flex>
                    </Flex>
                    <Center pt={'30px'}>
                      <Button
                        w='300px'
                        textShadow={'0px 1px 0px #0000FF'}
                        variant='linear'
                        fontFamily={'HarmonyOS Sans SC Black'}
                        fontSize={'24px'}
                        h='60px'
                        onClick={() => {
                          navigate('/xlending')
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
            <Text fontSize={'14px'} lineHeight={'18px'} color='#566E8C'>
              {`Invite friends to join xBank protocol using your unique referral
              link and you'll both receive mystery boxes rewards.`}
            </Text>
            <Box
              borderBottomWidth={'1px'}
              borderBottomColor={'#32E8FC'}
              marginTop={'11px'}
              marginBottom={'69px'}
            />
            <Box>
              <Flex justifyContent={'space-between'} mb='40px'>
                <Flex direction={'column'} alignItems={'center'}>
                  <Image width='88px' src={Icon0} mb='15px' />
                  <Text
                    fontSize={'16px'}
                    fontFamily={'HarmonyOS Sans SC Medium'}
                    w='141px'
                    textAlign={'center'}
                  >
                    Wallet Connect xBank Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'}>
                  <Image width='88px' src={Icon1} mb='15px' />
                  <Text
                    fontSize={'16px'}
                    fontFamily={'HarmonyOS Sans SC Medium'}
                    w='141px'
                    textAlign={'center'}
                  >
                    Friend Borrowing Success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'}>
                  <Image width='88px' src={Icon2} mb='15px' />
                  <Text
                    fontSize={'16px'}
                    fontFamily={'HarmonyOS Sans SC Medium'}
                    w='141px'
                    textAlign={'center'}
                  >
                    Friend repayment success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'}>
                  <Image width='88px' src={Icon3} mb='15px' />
                  <Text
                    fontSize={'16px'}
                    fontFamily={'HarmonyOS Sans SC Medium'}
                    w='141px'
                    textAlign={'center'}
                  >
                    Friend creat pool success Rewards
                  </Text>
                </Flex>
                <Flex direction={'column'} alignItems={'center'}>
                  <Image width='88px' src={Icon4} mb='15px' />
                  <Text
                    fontSize={'16px'}
                    fontFamily={'HarmonyOS Sans SC Medium'}
                    w='141px'
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
                    fontSize={'20px'}
                    h='54px'
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
                    <Flex justifyContent={'center'} mb='205px' pt='27px'>
                      <Button
                        color='#FFFFFF'
                        bgColor={'rgba(80, 176, 248, 1)'}
                        _hover={{
                          bgColor: 'rgba(80, 176, 248, 0.9)',
                        }}
                        w='100%'
                        h='54px'
                        maxW='600px'
                        fontSize={20}
                        fontFamily={'HarmonyOS Sans SC Bold'}
                        onClick={() => {
                          navigate('/xlending/buy-nfts/market')
                        }}
                      >
                        Unlock invitations by completing a lending or borrowing
                      </Button>
                    </Flex>
                  ) : (
                    <Box
                      mb={'86px'}
                      bgColor={'#022650'}
                      border='1px solid #32E8FC'
                      padding='24px 28px'
                      borderRadius={'16px'}
                    >
                      <Flex mb='40px' alignItems={'center'}>
                        <Text
                          fontSize={'24px'}
                          fontWeight={900}
                          fontFamily={'HarmonyOS Sans SC Black'}
                          w='189px'
                          mr='81px'
                        >
                          Invitation Link:
                        </Text>
                        <Box
                          border='1px solid #B3B3FF'
                          borderRadius={'28px'}
                          w='733px'
                        >
                          <Flex
                            padding={'3px 2px'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                          >
                            <Flex alignItems={'center'}>
                              <Text
                                color='#B5C4D7'
                                fontSize={'24px'}
                                lineHeight={'24px'}
                                fontWeight={400}
                                padding={'0 18px'}
                                maxW={'300px'}
                                noOfLines={1}
                              >
                                {invitationLink}
                              </Text>
                              <Button variant={'unstyled'} onClick={onCopy}>
                                {hasCopied ? (
                                  <Image src={IconCopied} w='24px' h='24px' />
                                ) : (
                                  <Image src={IconCopy} w='24px' h='24px' />
                                )}
                              </Button>
                            </Flex>
                            <Button
                              color='#FFFFFF'
                              h='54px'
                              fontSize={'20px'}
                              fontFamily={'HarmonyOS Sans SC Bold'}
                              paddingX={'83px'}
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
                            >
                              Get Sliver Box
                            </Button>
                          </Flex>
                        </Box>
                      </Flex>
                      <Flex alignItems={'center'}>
                        <Text
                          fontSize={'24px'}
                          fontWeight={900}
                          w='189px'
                          mr='81px'
                          fontFamily={'HarmonyOS Sans SC Black'}
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
                            direction={'column'}
                            alignItems={'center'}
                            w='120px'
                          >
                            <Image
                              src={IconTwitter}
                              w='32px'
                              fontSize={'16px'}
                            />
                            <Text
                              fontSize={'16px'}
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
                            direction={'column'}
                            alignItems={'center'}
                            w='120px'
                          >
                            <Image
                              src={IconTelegram}
                              w='32px'
                              fontSize={'16px'}
                            />
                            <Text
                              fontSize={'16px'}
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
          <Container maxW={'1440px'} padding={'60px 0'} position={'relative'}>
            <Image
              src={IconLogo}
              w='100px'
              position={'absolute'}
              top='35px'
              right='54px'
            />
            <Box color='#566E8C'>
              <Text
                color='#FFFFFF'
                fontSize={'28px'}
                fontFamily={'HarmonyOS Sans SC Bold'}
                mb='27px'
              >
                Rules:
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`1. Boxdrop is a contributor reward program launched by the xBank protocol to reward loyal users who join and use the xBank protocol in the beta release.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`2.The event will begin on June 7, 2023, and last for at least 3 months. The end time of the event will be announced before August 30, 2023.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`3.Users who use the xBank protocol to buy NFTs on a Buy Now Pay Later basis will receive different types of boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`4.Lenders who provide fund loans to borrowers through the xBank protocol will receive different types of boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`5.Borrowers or lenders who invite friends to interact with the xBank protocol will both receive boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`6.Following xBank's official Twitter account and retweeting the pinned post will receive Welcome Boxdrops.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`7.The boxdrops obtained by users will be revealed after the end of the campaign, and different levels of boxdrops will have different credit points.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`8.Any invalid or non-friendly protocol interaction behavior during the campaign will be blacklisted for receiving boxdrops.`}
              </Text>
              <Text fontSize={'18px'}>
                Learn more about the rules and rewards
                <Link
                  style={{ marginLeft: '10px' }}
                  color='#FF0066'
                  textDecoration={'underline'}
                  href='https://xbankdocs.gitbook.io/product-docs/'
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
        <AlertDialogContent borderRadius={'15px'} w='576px'>
          <AlertDialogCloseButton opacity={0} />
          <Image src={ImgDialogBanner} w='576px' />
          <AlertDialogFooter>
            <Stack w='576px' gap={'20px'} mb='20px' alignItems={'center'}>
              <Flex>
                <Text
                  fontSize={'24px'}
                  lineHeight={'32px'}
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
                h='50px'
                fontSize={'20px'}
                fontFamily={'HarmonyOS Sans SC Bold'}
                w='300px'
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

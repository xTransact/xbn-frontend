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
  useBoolean,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  Stack,
} from '@chakra-ui/react'
import { useSetState } from 'ahooks'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetLoans } from '@/api'
import { apiGetBoxes, apiGetInviteCode } from '@/api/marketing-campaign'
import BoxShadow from '@/assets/marketing/box-shadow.png'
import Box1 from '@/assets/marketing/box1.png'
import Box2 from '@/assets/marketing/box2.png'
import Box3 from '@/assets/marketing/box3.png'
import Box4 from '@/assets/marketing/box4.png'
import IconCopied from '@/assets/marketing/copied.png'
import Icon0 from '@/assets/marketing/icon-0.png'
import Icon1 from '@/assets/marketing/icon-1.png'
import Icon2 from '@/assets/marketing/icon-2.png'
import Icon3 from '@/assets/marketing/icon-3.png'
import Icon4 from '@/assets/marketing/icon-4.png'
import ImgBrowser from '@/assets/marketing/icon-browser.png'
import ImgCoinInBox from '@/assets/marketing/icon-coin-in-box.png'
import IconCopy from '@/assets/marketing/icon-copy.png'
import ImgPlusWallet from '@/assets/marketing/icon-plus-wallet.png'
import ImgWalletOk from '@/assets/marketing/icon-wallet-ok.png'
import ImgQuestionBox from '@/assets/marketing/question-box.png'
import IconTelegram from '@/assets/marketing/telegram.png'
import IconTwitter from '@/assets/marketing/twitter.png'
import IconLogo from '@/assets/marketing/xbank-logo.png'
import { Header } from '@/components'
import { useWallet } from '@/hooks'
import { getUserToken } from '@/utils/auth'

import ImgDialogBanner from '@/assets/marketing/banner-dialog.svg'
import ImgBannerSvg from '@/assets/marketing/banner.svg'
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
const TitleWithQuestionBox = (props: { title: string }) => {
  return (
    <HStack>
      <Image src={ImgQuestionBox} />
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<any>()
  const [expired, setExpired] = useState(true)
  const { currentAccount, connectWallet } = useWallet()
  const [hasUsedXBN, setHasUsedXBN] = useBoolean()
  const [boxAmounts, setBoxAmounts] = useSetState({
    box_bronze: 0,
    box_diamond: 0,
    box_gold: 0,
    box_platinum: 0,
    box_silver: 0,
  })
  const {
    onCopy,
    hasCopied,
    value: invitationLink,
    setValue: setInvitationLink,
  } = useClipboard('')
  const [inviteCode, setInviteCode] = useState('')
  const queryUserBoxes = useCallback(() => {
    apiGetBoxes()
      .then((data) => {
        setBoxAmounts({
          box_bronze: data?.box_bronze || 0,
          box_diamond: data?.box_diamond || 0,
          box_gold: data?.box_gold || 0,
          box_platinum: data?.box_platinum || 0,
          box_silver: data?.box_silver || 0,
        })
      })
      .catch((e) => {
        console.log('e', e)
      })
  }, [expired])
  useEffect(() => {
    if (!expired) {
      queryUserBoxes()
    }
  }, [expired, queryUserBoxes])
  useEffect(() => {
    const userToken = getUserToken()
    setExpired(
      !userToken?.expires ? true : moment().isAfter(moment(userToken?.expires)),
    )
  }, [])
  useEffect(() => {
    if (!expired && !!currentAccount) {
      apiGetLoans({
        lender_address: currentAccount,
        borrower_address: currentAccount,
      }).then((list) => {
        apiGetInviteCode().then((resp) => {
          setInviteCode(resp.code)
          setInvitationLink(
            window.location.href + `?invitation_code=${resp.code}`,
          )
        })
        if (list.length > 0) {
          setHasUsedXBN.on()
          apiGetInviteCode().then((resp) => {
            setInviteCode(resp.code)
            setInvitationLink(
              window.location.href + `?invitation_code=${resp.code}`,
            )
          })
        } else {
          setHasUsedXBN.off()
        }
      })
    }
  }, [expired, currentAccount, setHasUsedXBN])
  return (
    <div>
      <Header />
      <Box bgGradient={'linear-gradient(0deg, #071E38, #071E38), #F9F9FF;'}>
        <Container width={'100%'} maxW='1440px'>
          <Box marginBottom={'68px'}>
            <Image src={ImgBannerSvg} width='100%' />
          </Box>
          <Box
            bgGradient={'linear-gradient(0deg, #071E38, #071E38)'}
            color={'#FFFFFF'}
          >
            <TitleWithQuestionBox title='Win Box' />
            <Box marginBottom={'72px'} marginTop={'34.5px'}>
              <CusCard title='My Boxdrops'>
                <CardBody padding={10}>
                  <Flex justifyContent={'space-around'} alignItems={'center'}>
                    {!expired && (
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
                          Follow Twitter @xBankOfficial and retweet the Pin post
                        </Text>
                        <Button
                          w='240px'
                          h='55px'
                          fontSize={'20px'}
                          fontFamily={'HarmonyOS Sans SC Black'}
                          variant={'linear'}
                          textShadow={'0px 1px 0px #0000FF'}
                        >
                          Claim
                        </Button>
                      </Flex>
                    )}
                    {!expired && (
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
                          {expired
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
                          {expired
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
                          {expired
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
                          {expired
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

            <TitleWithQuestionBox title='Invite Friends' />
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
              {expired ? (
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
                      const userToken = getUserToken()
                      setExpired(
                        !userToken?.expires
                          ? true
                          : moment().isAfter(moment(userToken?.expires)),
                      )
                    }}
                  >
                    Connect Wallet
                  </Button>
                </Flex>
              ) : (
                <>
                  {!!hasUsedXBN ? (
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
                                  window.location.href +
                                    `?invitation_code=${inviteCode}`,
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
                          href={`https://twitter.com/intent/tweet?url=${invitationLink}&text=${SHARE_TWITTER_TEXT}`}
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
                          href={`https://t.me/share/url?url=${invitationLink}&text=${SHARE_TELEGRAM_TEXT}`}
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
                {`1. After the invitee accepts the invitation and successfully
                registers, downloads the xBank APP and logs in to receive the
                newcomer's benefits, the invitation reward will be distributed
                to the inviter's account.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`2. The inviter will have in-APP access to the sign up and login
                records of each user invited by himself.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`3. The invitee needs to log in to the app within 30 days from
                the date of registration to receive the reward. If the time
                limit is exceeded, the inviter and the invitee's reward will be
                invalid and no longer issued.`}
              </Text>
              <Text fontSize={'18px'} mb='20px'>
                {`4. Inviter can get a maximum of 10 times the invitation rewards
                per 90 days. The reward will be issued only after the invitee
                registers with their phone number and logs in.`}
              </Text>
              <Text
                fontSize={'18px'}
                color='#FF0066'
                textDecoration={'underline'}
              >
                <Link
                  href='https://xbankdocs.gitbook.io/product-docs/'
                  target='_blank'
                >
                  Learn more
                </Link>
              </Text>
            </Box>
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
    </div>
  )
}

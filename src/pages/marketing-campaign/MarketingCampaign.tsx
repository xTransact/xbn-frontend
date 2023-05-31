import {
  Box,
  Card,
  CardBody,
  Image,
  Container,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  HStack,
  Button,
  Center,
  Flex,
  Link,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'

import ImgBanner from '@/assets/marketing/banner.png'
import BoxShadow from '@/assets/marketing/box-shadow.png'
import Box1 from '@/assets/marketing/box1.png'
import Box2 from '@/assets/marketing/box2.png'
import Box3 from '@/assets/marketing/box3.png'
import Box4 from '@/assets/marketing/box4.png'
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
          marginBottom={'-6px'}
        >
          <Box
            display={'inline-block'}
            p={'10px 60px 10px 20px'}
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
        padding={'1px'}
        borderRadius={props.titleHidden ? '10px' : '0 10px 10px 10px'}
        boxShadow='0px 3px 1px #32E8FC'
        overflow={'hidden'}
      >
        <Card
          variant={'outline'}
          borderWidth={0}
          dropShadow={'base'}
          backgroundColor={'#022650'}
          color={'#FFFFFF'}
          borderRadius={0}
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
        fontFamily={'HarmonyOS Sans SC Bold'}
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
  useEffect(() => {
    document.querySelector('html')?.classList.add('.banner-bg')
    return () => {
      document.querySelector('html')?.classList.remove('.banner-bg')
    }
  }, [])
  return (
    <>
      <Header />
      <Box bgGradient={'linear-gradient(0deg, #071E38, #071E38), #F9F9FF;'}>
        <Container width={'100%'} maxW='1440px'>
          <Box marginBottom={'68px'}>
            <Image src={ImgBanner} width={'100%'} />
          </Box>
          <Box
            bgGradient={'linear-gradient(0deg, #071E38, #071E38)'}
            color={'#FFFFFF'}
          >
            <TitleWithQuestionBox title='Win Boxes' />
            <Box marginBottom={'72px'} marginTop={'34.5px'}>
              <CusCard title='My Rewards'>
                <CardBody padding={10}>
                  <Flex justifyContent={'space-around'} alignItems={'center'}>
                    <Flex
                      alignItems={'flex-start'}
                      justifyContent={'space-around'}
                      flexDirection={'column'}
                      maxW={300}
                    >
                      <Text fontSize={28} fontFamily={'HarmonyOS Sans SC Bold'}>
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
                        variant={'linear'}
                        textShadow={'0px 1px 0px #0000FF'}
                      >
                        Claim
                      </Button>
                    </Flex>
                    <Box borderRight={'1px solid white'} h='200px' />
                    <Flex justify={'space-around'}>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box1} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'16px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-20px'
                        >
                          Bronze Box
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          4, 000
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box2} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'16px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-20px'
                        >
                          Silver Box
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          5, 690
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box3} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'16px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-20px'
                        >
                          Gold Box
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          160
                        </Text>
                      </Flex>
                      <Flex direction={'column'} alignItems={'center'}>
                        <Image src={Box4} zIndex={1} />
                        <Image src={BoxShadow} w='165px' mt='-55px' />
                        <Text
                          fontSize={'16px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                          mt='-20px'
                        >
                          Platinum Box
                        </Text>
                        <Text
                          color='#FF0066'
                          fontSize={'36px'}
                          fontFamily={'HarmonyOS Sans SC Bold'}
                        >
                          40
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
                  <CardBody padding={'20px 0 20px 20px'}>
                    <Text
                      fontSize='18px'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      Pick up your favor NFT and own it with xBank Protocol, get
                      boxes rewards.
                    </Text>
                    <Text
                      fontSize='16px'
                      color='#FF0066'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      <Link href=''>Learn More</Link>
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
                    >
                      Create fund pool to offer loans to other users, get boxes
                      rewards.
                    </Text>
                    <Text
                      fontSize='16px'
                      color='#FF0066'
                      fontFamily={'HarmonyOS Sans SC Medium'}
                    >
                      <Link href=''>Learn More</Link>
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
              <Box
                mb={'86px'}
                bgColor={'#022650'}
                border='1px solid #32E8FC'
                padding='24px 28px'
                borderRadius={'16px'}
              >
                <Flex mb='40px' alignItems={'center'}>
                  <Text fontSize={'24px'} fontWeight={900} w='189px' mr='81px'>
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
                          fontWeight={400}
                          padding={'0 18px'}
                          maxW={'300px'}
                          noOfLines={1}
                        >
                          Lorem ipsum dolor sit amet consectetur, adipisicing
                          elit. Non, sunt? Perferendis numquam animi tenetur
                          laudantium, sunt libero beatae rerum voluptates,
                          accusamus hic exercitationem blanditiis itaque vel
                          provident atque dicta distinctio?
                        </Text>
                        <Image src={IconCopy} w='24px' h='24px' />
                      </Flex>
                      <Button
                        fontSize={'20px'}
                        fontFamily={'HarmonyOS Sans SC Bold'}
                        color='#0000FF'
                        paddingX={'83px'}
                      >
                        Get Sliver Box
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
                <Flex alignItems={'center'}>
                  <Text fontSize={'24px'} fontWeight={900} w='189px' mr='81px'>
                    Share To:
                  </Text>
                  <Flex direction={'column'} alignItems={'center'} w='120px'>
                    <Image src={IconTwitter} w='32px' fontSize={'16px'} />
                    <Text>Twitter</Text>
                  </Flex>
                  <Flex direction={'column'} alignItems={'center'} w='120px'>
                    <Image src={IconTelegram} w='32px' fontSize={'16px'} />
                    <Text>Telegram</Text>
                  </Flex>
                </Flex>
              </Box>
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
                <Link>Learn more</Link>
              </Text>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  )
}

import {
  Box,
  Image,
  Flex,
  Text,
  Button,
  Container,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  chakra,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import kebabCase from 'lodash-es/kebabCase'
import { useCallback, useMemo, useRef, type FunctionComponent } from 'react'
// import Jazzicon from 'react-jazzicon'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Icon from '@/assets/logo.png'
import { RESPONSIVE_MAX_W } from '@/constants'
import { useWallet } from '@/hooks'
import { createXBankContract } from '@/utils/createContract'
import { formatAddress } from '@/utils/format'

import { ConnectWalletModal, SvgComponent } from '..'
import { COMMUNITY_DATA } from '../footer/Footer'

const useActivePath = () => {
  const { pathname } = useLocation()

  return useMemo((): 'lending' | 'buy-nfts' | 'sell-nfts' | '' => {
    if (pathname.startsWith('/lending')) {
      return 'lending'
    }
    if (pathname.startsWith('/buy-nfts')) {
      return 'buy-nfts'
    }
    if (pathname.startsWith('/sell-nfts')) {
      return 'sell-nfts'
    }
    return ''
  }, [pathname])
}

const PopoverWrapper: FunctionComponent<{
  routes: string[]
  route: string
  pageName: string
}> = ({ routes, route, pageName }) => {
  const activePath = useActivePath()
  return (
    <Popover isLazy trigger='hover' placement='bottom-start'>
      {({ isOpen: visible }) => {
        return (
          <>
            <PopoverTrigger>
              <Flex
                fontSize='16px'
                px={0}
                gap={'4px'}
                _focus={{ bg: 'transparent' }}
                _hover={{
                  bg: 'transparent',
                  color: 'var(--chakra-colors-blue-1)',
                }}
                color={activePath === route || visible ? 'blue.1' : 'black.1'}
                fontWeight='700'
                alignItems={'center'}
                cursor='pointer'
              >
                {pageName}
                <SvgComponent
                  svgId={'icon-arrow-down'}
                  fill={
                    activePath === route || visible
                      ? 'var(--chakra-colors-blue-1)'
                      : 'var(--chakra-colors-black-1)'
                  }
                  transition='all 0.2s'
                  transform={`rotate(${visible ? '180deg' : '0deg'})`}
                />
              </Flex>
              {/* </Link> */}
            </PopoverTrigger>
            <PopoverContent w={48} top='16px' borderRadius={8}>
              <PopoverBody px={0} p={'20px'}>
                <Flex flexDir={'column'} gap='20px'>
                  {routes.map((item) => (
                    <Link to={`/${route}/${kebabCase(item)}`} key={item}>
                      <Flex borderBottomColor='gray.5' flexDir='column'>
                        <Text
                          fontSize='16px'
                          _hover={{
                            color: `blue.1`,
                          }}
                          color='black.1'
                        >
                          {item}
                        </Text>
                      </Flex>
                    </Link>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </>
        )
      }}
    </Popover>
  )
}

const CommunityPopover = () => {
  return (
    <Popover isLazy trigger='hover' placement='bottom-start'>
      {({ isOpen: visible }) => {
        return (
          <>
            <PopoverTrigger>
              <Flex
                fontSize='16px'
                px={0}
                gap={'4px'}
                _focus={{ bg: 'transparent' }}
                _hover={{
                  bg: 'transparent',
                  color: 'var(--chakra-colors-blue-1)',
                }}
                color={visible ? 'blue.1' : 'black.1'}
                fontWeight='700'
                alignItems={'center'}
                cursor='pointer'
              >
                Community
                <SvgComponent
                  svgId={'icon-arrow-down'}
                  fill={
                    visible
                      ? 'var(--chakra-colors-blue-1)'
                      : 'var(--chakra-colors-black-1)'
                  }
                  transition='all 0.2s'
                  transform={`rotate(${visible ? '180deg' : '0deg'})`}
                />
              </Flex>
              {/* </Link> */}
            </PopoverTrigger>
            <PopoverContent w={'140px'} top='16px' borderRadius={8}>
              <PopoverBody px={0} p={'20px'}>
                <Flex flexDir={'column'} gap='20px'>
                  {COMMUNITY_DATA.map(({ icon, title, url }) => (
                    <chakra.a key={title} href={url} target='_blank'>
                      <Flex
                        borderBottomColor='gray.5'
                        alignItems={'center'}
                        gap='8px'
                      >
                        <SvgComponent svgId={icon} fill='gray.6' />
                        <Text
                          fontSize='16px'
                          _hover={{
                            color: `blue.1`,
                          }}
                          color='black.1'
                        >
                          {title}
                        </Text>
                      </Flex>
                    </chakra.a>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </>
        )
      }}
    </Popover>
  )
}

const ConnectedIconWallet: FunctionComponent = () => {
  const navigate = useNavigate()
  const { currentAccount, handleOpenEtherscan, handleDisconnect } = useWallet()
  const fetchDataFromContract = useCallback(async () => {
    // const wethContract = createWethContract()
    const xBankContract = createXBankContract()
    const listPool = await xBankContract.methods.listPool().call()
    const listLoan = await xBankContract.methods.listLoan().call()
    const spread = await xBankContract.methods.getProtocolIRMultiplier().call()
    console.log('listLoan:', listLoan)
    console.log('listPool:', listPool)
    console.log('ProtocolIRMultiplier', spread)
  }, [])
  const { run, loading } = useRequest(fetchDataFromContract, {
    manual: true,
  })
  return (
    <Popover isLazy trigger='click' placement='bottom-end'>
      <PopoverTrigger>
        <IconButton
          justifyContent={'center'}
          aria-label=''
          bg='white'
          icon={<SvgComponent svgId='icon-wallet-outline' svgSize='30px' />}
          hidden={!currentAccount}
        />
      </PopoverTrigger>
      <PopoverContent w='160px' top='8px'>
        <PopoverBody p={'10px'}>
          <Button
            variant={'link'}
            color='black.1'
            p={'10px'}
            onClick={handleOpenEtherscan}
            _hover={{
              textDecoration: 'underline',
              color: 'blue.1',
            }}
          >
            {formatAddress(currentAccount)}
          </Button>
          <Button
            variant={'link'}
            color='black.1'
            p={'10px'}
            onClick={() => {
              navigate('/buy-nfts/loans')
            }}
            _hover={{
              textDecoration: 'none',
              color: 'blue.1',
            }}
          >
            Repay Loans
          </Button>
          <Button
            variant={'link'}
            color='black.1'
            p={'10px'}
            _hover={{
              textDecoration: 'none',
              color: 'blue.1',
            }}
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>

          {(import.meta.env.DEV ||
            window.location.hostname.startsWith('feat-')) && (
            <Button isLoading={loading} onClick={run} variant='primary'>
              TEST
            </Button>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const MobileDrawBtn = () => {
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()
  const activePath = useActivePath()
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <IconButton
        icon={<SvgComponent svgId='icon-expand1' svgSize={'24px'} />}
        ref={btnRef}
        aria-label=''
        onClick={openDraw}
        bg='white'
        isDisabled={window.location.pathname === '/demo'}
      />
      <Drawer
        isOpen={drawVisible}
        placement='right'
        onClose={closeDraw}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay bg='transparent' top={'4px'} />
        <DrawerContent maxW='100%'>
          <Box
            bg='linear-gradient(270deg, #E404E6 0%, #5843F4 53.65%, #1EF6F0 100%)'
            h={'1px'}
          />
          <DrawerCloseButton pt='30px' size={'24px'} mr='24px' />
          <DrawerHeader />

          <DrawerBody mt='40px'>
            <Accordion
              defaultIndex={
                activePath === 'lending' ? 0 : activePath === 'buy-nfts' ? 1 : 0
              }
            >
              <AccordionItem border={'none'}>
                <Text>
                  <AccordionButton>
                    <Box
                      as='span'
                      flex='1'
                      textAlign='left'
                      fontSize={'24px'}
                      fontWeight='700'
                    >
                      Lend
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Text>
                <AccordionPanel px={8} py={'28px'}>
                  <Flex flexDir={'column'} gap={8} onClick={closeDraw}>
                    {['Collections', 'My Pools', 'Loans'].map((item) => (
                      <Link to={`/lending/${kebabCase(item)}`} key={item}>
                        <Flex fontSize='16px' color='gray.3'>
                          {item}
                        </Flex>
                      </Link>
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem border={'none'}>
                <Text>
                  <AccordionButton>
                    <Box
                      as='span'
                      flex='1'
                      textAlign='left'
                      fontSize={'24px'}
                      fontWeight='700'
                    >
                      Buy NFTs
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Text>
                <AccordionPanel px={8} py={'28px'}>
                  <Flex flexDir={'column'} gap={8} onClick={closeDraw}>
                    {['Market', 'My assets'].map((item) => (
                      <Link to={`/buy-nfts/${kebabCase(item)}`} key={item}>
                        <Flex fontSize='16px' color='gray.3'>
                          {item}
                        </Flex>
                      </Link>
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
const Header = () => {
  const { pathname } = useLocation()

  const { isOpen, onClose, currentAccount, interceptFn } = useWallet()
  const navigate = useNavigate()
  const handleClickWallet = useCallback(async () => {
    interceptFn(() => {})
  }, [interceptFn])

  return (
    <Box
      position={'sticky'}
      top={0}
      zIndex={22}
      borderBottomColor='rgba(0, 0, 0, 0.05)'
      borderBottomWidth={1}
      bg='white'
    >
      <Box
        bg='linear-gradient(270deg, #E404E6 0%, #5843F4 53.65%, #1EF6F0
      100%)'
        h={{ md: 1, sm: '1px', xs: '1px' }}
      />
      <Container bg='white' maxW={{ ...RESPONSIVE_MAX_W, xl: 1408, lg: 1200 }}>
        <Flex
          justify={'space-between'}
          h={{
            md: 74,
            sm: '56px',
            xs: '56px',
          }}
          alignItems='center'
        >
          <Flex
            alignItems={'center'}
            onClick={() => {
              if (pathname === '/demo') return
              window.open(import.meta.env.VITE_WEBSITE)
            }}
            cursor='pointer'
          >
            <Flex gap={'8px'} alignItems='center'>
              <Image
                src={Icon}
                h={{
                  md: 25,
                  xs: '20px',
                  sm: '20px',
                }}
                alt='icon'
                loading='lazy'
              />
            </Flex>
          </Flex>

          <Flex
            display={{
              xs: 'none',
              sm: 'none',
              md: 'none',
              lg: 'flex',
            }}
            gap='40px'
            hidden={pathname === '/demo'}
          >
            <PopoverWrapper
              route='buy-nfts'
              pageName='Buy NFTs'
              routes={['Market', 'My assets']}
            />
            <PopoverWrapper
              routes={['Collections', 'My Pools', 'Loans']}
              route='lending'
              pageName='Lend'
            />
            <chakra.a
              fontSize='16px'
              px={0}
              _focus={{ bg: 'transparent' }}
              _hover={{
                bg: 'transparent',
                color: 'var(--chakra-colors-blue-1)',
              }}
              color={'black.1'}
              fontWeight='700'
              alignItems={'center'}
              cursor='pointer'
              href={import.meta.env.VITE_DOCS_URL}
              target='_blank'
            >
              Docs
            </chakra.a>
            <CommunityPopover />
          </Flex>

          <Flex
            gap='24px'
            alignItems='center'
            display={{
              xs: 'none',
              sm: 'none',
              md: 'none',
              lg: 'flex',
            }}
            cursor='pointer'
          >
            <Flex
              onClick={() => {
                navigate('/marketing-campaign')
              }}
              marginRight={'-15px'}
              alignItems={'center'}
            >
              <Image
                src='/gift.gif'
                style={{
                  width: '64px',
                  height: '64px',
                  marginTop: '-36px',
                  marginRight: '-14px',
                }}
              />
              <Text
                bgGradient={
                  'linear-gradient(45deg, #1CFEF0 23%, #458FFF 46%, #FFBADB 90%)'
                }
                bgClip='text'
                fontSize={'16px'}
                fontFamily={'HarmonyOS Sans SC Bold'}
              >
                Boxdrop
              </Text>
            </Flex>

            {currentAccount ? (
              <ConnectedIconWallet />
            ) : (
              <Button variant={'primary'} onClick={handleClickWallet}>
                Connect Wallet
              </Button>
            )}
          </Flex>

          {/*  移动端 */}
          <Flex
            gap={'20px'}
            display={{
              xs: 'flex',
              sm: 'flex',
              md: 'flex',
              lg: 'none',
            }}
          >
            {/* <IconButton
              onClick={handleOpenEtherscan}
              justifyContent={'center'}
              aria-label=''
              bg='white'
              icon={
                <Jazzicon
                  diameter={30}
                  seed={parseInt(currentAccount.slice(2, 10), 16)}
                />
              }
              hidden={!currentAccount}
            /> */}
            <ConnectedIconWallet />
            <MobileDrawBtn />
          </Flex>
        </Flex>
      </Container>

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </Box>
  )
}

export default Header

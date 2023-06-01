import {
  chakra,
  Box,
  Text,
  Flex,
  Image,
  Divider,
  Container,
} from '@chakra-ui/react'

import LOGO from '@/assets/logo.png'
import {
  DISCORD_URL,
  LINKEDIN_URL,
  MEDIUM_URL,
  RESPONSIVE_MAX_W,
  TWITTER_URL,
} from '@/constants'

import SvgComponent from '../svg-component/SvgComponent'

const EMAIL = (
  <svg
    width='20'
    height='16'
    viewBox='0 0 20 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M18.3346 3.00065C18.3346 2.08398 17.5846 1.33398 16.668 1.33398H3.33464C2.41797 1.33398 1.66797 2.08398 1.66797 3.00065M18.3346 3.00065V13.0007C18.3346 13.9173 17.5846 14.6673 16.668 14.6673H3.33464C2.41797 14.6673 1.66797 13.9173 1.66797 13.0007V3.00065M18.3346 3.00065L10.0013 8.83398L1.66797 3.00065'
      stroke='#00000F'
      strokeWidth='1.66667'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export const COMMUNITY_DATA = [
  {
    title: 'Twitter',
    url: TWITTER_URL,
    icon: 'icon-twitter',
  },
  {
    title: 'Discord',
    url: DISCORD_URL,
    icon: 'icon-discord',
  },
  {
    title: 'Linked in',
    url: LINKEDIN_URL,
    icon: 'icon-linked',
  },
  {
    title: 'Medium',
    url: MEDIUM_URL,
    icon: 'icon-medium',
  },
]

const Footer = () => {
  return (
    <chakra.footer pb={{ xs: 70, sm: 0 }}>
      <Box
        height={1}
        bg='linear-gradient(270deg, #E404E6 0%, #5843F4 53.65%, #1EF6F0 100%)'
        border='1px solid rgba(255, 255, 255, 0.2)'
        transform={'matrix(1, 0, 0, -1, 0, 0)'}
      />
      <Container
        maxW={RESPONSIVE_MAX_W}
        py={{
          sm: 70,
          xs: 10,
        }}
      >
        <Flex alignItems={'center'}>
          <Image src={LOGO} h={{ sm: 30, xs: 5 }} alt='logo' loading='lazy' />
        </Flex>
        <Flex
          justify={'space-between'}
          mb={6}
          gap={{
            sm: 10,
            xs: 6,
          }}
          flexWrap='wrap'
          mt={{
            sm: 4,
            xs: 4,
          }}
          alignItems={'center'}
        >
          <Box>
            <Text
              fontSize={16}
              fontWeight={700}
              display={'flex'}
              alignItems='center'
              cursor={'pointer'}
              onClick={() => {
                window.open('mailto:help@xbank.plus')
              }}
            >
              {EMAIL}&nbsp;help@xbank.plus
            </Text>
          </Box>

          {/* 社媒 */}
          <Flex gap='70px'>
            {COMMUNITY_DATA.map(({ title, url, icon }) => (
              <Flex
                key={title}
                flexDir={'column'}
                alignItems={'center'}
                gap={'4px'}
                onClick={() => {
                  window.open(url)
                }}
                cursor={'pointer'}
              >
                <SvgComponent svgId={`${icon}`} fontSize={'24px'} />
                <Text color='black.4'>{title}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Divider />
        <Box
          display={{
            sm: 'flex',
            xs: 'block',
          }}
          maxW={406}
          justifyContent='space-between'
          flexWrap='wrap'
        >
          <Text fontSize={12} mt={3} lineHeight={'26px'}>
            {new Date().getFullYear()} © All Rights Reserved
          </Text>
          <Text opacity={0.5} fontSize={12} mt={3} lineHeight={'26px'}>
            <chakra.a
              href='https://xbank.plus/terms-of-service/en'
              target='_blank'
              color={'black.1'}
            >
              Terms of Services
            </chakra.a>
          </Text>
          <Text opacity={0.5} fontSize={12} mt={3} lineHeight={'26px'}>
            <chakra.a
              href='https://xbank.plus/privacy-policy/en'
              target='_blank'
              color={'black.1'}
            >
              Private Policy
            </chakra.a>
          </Text>
        </Box>
      </Container>
    </chakra.footer>
  )
}

export default Footer

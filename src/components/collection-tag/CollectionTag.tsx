import { Flex, Text, Image } from '@chakra-ui/react'
import { useMemo } from 'react'

import ImgTag1 from '@/assets/tag-1.png'
import ImgTag2 from '@/assets/tag-2.png'
import ImgTag3 from '@/assets/tag-3.png'
import ImgTag4 from '@/assets/tag-4.png'

import type { FlexProps } from '@chakra-ui/react'
import type { FunctionComponent, ReactNode } from 'react'

const CollectionTag: FunctionComponent<
  FlexProps & {
    icon?: ReactNode
    priority?: number
    title?: string
  }
> = ({ children, title, icon, priority = 1 }) => {
  const src = useMemo(() => {
    switch (priority) {
      case 1:
        return ImgTag1
      case 2:
        return ImgTag2
      case 3:
        return ImgTag3
      case 4:
        return ImgTag4

      default:
        return ImgTag1
    }
  }, [priority])
  if (!children && !title) return null
  return (
    <Flex
      pr={{
        md: '4px',
        sm: 0,
        xs: 0,
      }}
      gap={{
        md: '4px',
        sm: 0,
        xs: 0,
      }}
      height={'20px'}
      borderWidth={1}
      borderColor={'blue.4'}
      alignItems={'center'}
      borderRadius={4}
      bg='conic-gradient(from 189deg at 75.95% 6.03%, rgba(255, 255, 255, 0.20) 0deg, rgba(255, 255, 255, 0.00) 360deg), linear-gradient(90deg, #4A40FF 0%, #ADA6FF 100%)'
    >
      {!!priority ? (
        <Image
          src={src}
          alt=''
          w={{
            md: '18px',
            sm: '14px',
            xs: '14px',
          }}
        />
      ) : !!icon ? (
        icon
      ) : null}
      {!!children ? (
        children
      ) : (
        <Text
          textShadow={'0px 0.6000000238418579px 0px #0F00ED'}
          fontSize={'12px'}
          fontFamily={'HarmonyOS Sans SC Bold'}
          color={'white'}
          lineHeight={'20px'}
          transform={{
            md: 'none',
            sm: 'scale(0.83333)',
            xs: 'scale(0.83333)',
          }}
          transformOrigin={'center'}
        >
          {title}
        </Text>
      )}
    </Flex>
  )
}

export default CollectionTag

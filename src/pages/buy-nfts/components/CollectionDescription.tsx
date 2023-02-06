import { Flex, Box, Image, Text, Heading, HStack } from '@chakra-ui/react'
import { useState } from 'react'

import COLORS from '@/utils/Colors'

import IconEth from '@/assets/icon/icon-eth.svg'
import IconVerifiedFill from '@/assets/icon/icon-verified-fill.svg'

import type { FunctionComponent, ReactElement } from 'react'

const CollectionDescription: FunctionComponent<{
  data: {
    isVerified?: boolean
    titleImage?: string
    title?: string
    description?: string
    img?: string
    keys?: {
      value: string
      label: string | ReactElement
      isEth?: boolean
    }[]
  }
}> = ({
  data: {
    title = '',
    description = '',
    img = '',
    keys = [],
    isVerified = false,
  },
}) => {
  const [show, setShow] = useState(false)
  return (
    <Box mb={12}>
      <Flex gap={5} alignItems='end' mb={8}>
        <Box minW='108px'>
          <Image src={img} />
        </Box>
        <Box>
          <Heading fontSize={'3xl'} display='flex'>
            {title}
            {isVerified && <Image src={IconVerifiedFill} />}
          </Heading>

          <Text
            color={COLORS.secondaryTextColor}
            mt={2}
            fontSize={'md'}
            fontWeight='medium'
          >
            {show ? description : `${description.substring(0, 80)}...`}
            {description?.length > 80 && (
              <a
                color={COLORS.primaryColor}
                onClick={() => setShow((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                {show ? 'show less' : 'show'}
              </a>
            )}
          </Text>
        </Box>
      </Flex>

      <HStack spacing={10}>
        {keys.map(({ label, value, isEth }) => (
          <Box key={`${label}`}>
            <Heading fontSize={'2xl'} display='flex' mb={1}>
              {isEth && <Image src={IconEth} height={8} />}
              {value}
            </Heading>
            {typeof value === 'string' ? (
              <Text color={COLORS.infoTextColor}>{label}</Text>
            ) : (
              label
            )}
          </Box>
        ))}
      </HStack>
    </Box>
  )
}
export default CollectionDescription

import {
  Box,
  Flex,
  Heading,
  type BoxProps,
  Tooltip,
  Text,
} from '@chakra-ui/react'

import { SvgComponent } from '@/components'

import type { FunctionComponent } from 'react'

const StepDescription: FunctionComponent<
  {
    data: {
      step: number
      title: string
      text: string
      tip?: string
    }
  } & BoxProps
> = ({ data: { step, title, text, tip }, ...rest }) => {
  return (
    <Box {...rest}>
      <Flex alignItems='center' gap={'10px'}>
        <Flex
          bg='blue.1'
          color='white'
          borderRadius={'50%'}
          boxSize={'32px'}
          justifyContent='center'
          fontSize='18px'
          lineHeight={'30px'}
        >
          {step}
        </Flex>

        <Heading fontSize={'18px'} color='black.1'>
          {title}
        </Heading>

        <Tooltip
          label={text}
          placement='auto-start'
          hasArrow
          bg='gray.3'
          borderRadius={4}
          p='8px'
        >
          <Box cursor={'pointer'}>
            <SvgComponent svgId='icon-tip' fill='gray.1' />
          </Box>
        </Tooltip>
      </Flex>
      {!!tip && (
        <Text fontSize={'14px'} color='gray.3' ml='44px'>
          {tip}
        </Text>
      )}
    </Box>
  )
}

export default StepDescription

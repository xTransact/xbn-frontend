import { Box, Flex, Heading, type BoxProps, Tooltip } from '@chakra-ui/react'

import { SvgComponent } from '@/components'

import type { FunctionComponent } from 'react'

const StepDescription: FunctionComponent<
  {
    data: {
      step: number
      title: string
      text: string
    }
  } & BoxProps
> = ({ data: { step, title, text }, ...rest }) => {
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
          lineHeight={2}
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
          bg='gray.1'
          borderRadius={4}
          p='8px'
        >
          <Box cursor={'pointer'}>
            <SvgComponent svgId='icon-tip' fill='gray.1' />
          </Box>
        </Tooltip>
      </Flex>
    </Box>
  )
}

export default StepDescription

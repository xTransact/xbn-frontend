import { Box, Flex, Heading, type BoxProps } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { SvgComponent, TooltipComponent } from '@/components'

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
      <Flex alignItems='center' gap={'12px'}>
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

        <Heading fontSize={'18px'} color='black.1' ml='4px'>
          {title}
        </Heading>

        <TooltipComponent
          label={text}
          placement='auto-start'
          hasArrow
          bg='white'
          borderRadius={8}
          p='10px'
          fontSize={'14px'}
          lineHeight={'18px'}
          fontWeight={'500'}
          boxShadow={'0px 0px 10px #D1D6DC'}
          color='gray.3'
          whiteSpace={'pre-line'}
        >
          <SvgComponent svgId='icon-tip' fill='gray.1' fontSize={'20px'} />
        </TooltipComponent>
      </Flex>
    </Box>
  )
}

export default StepDescription

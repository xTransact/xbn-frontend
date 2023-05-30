import { Box, Button, Heading, Text } from '@chakra-ui/react'

import type { BoxProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const EmptyPools: FunctionComponent<
  BoxProps & {
    onReset?: () => void
    isShow?: boolean
  }
> = ({ onReset, isShow }) => {
  if (!isShow) return null
  return (
    <Box mt='64px'>
      <Heading fontSize={'24px'} fontWeight={'700'} mb='12px'>
        No exact matches
      </Heading>
      <Text>Try changing your down payment.</Text>
      <Button
        p='16px'
        borderRadius={'8px'}
        borderColor={'gray.4'}
        fontWeight={'500'}
        bg='white'
        borderWidth={1}
        mt='30px'
        _hover={{
          bgColor: 'gray.4',
          color: 'white',
        }}
        onClick={onReset}
      >
        Reset down payment
      </Button>
    </Box>
  )
}

export default EmptyPools

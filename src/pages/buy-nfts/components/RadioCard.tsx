import { Flex, type FlexProps } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

type RadioCardProps = {
  isActive?: boolean
  isDisabled?: boolean
}

const RadioCard: FunctionComponent<FlexProps & RadioCardProps> = ({
  children,
  isActive,
  isDisabled,
  onClick,
  ...props
}) => {
  return (
    <Flex
      flexDir={{
        md: 'column',
        sm: 'row',
        xs: 'row',
      }}
      h={{ md: '136px', sm: '72px', xs: '72px' }}
      justifyContent='space-between'
      onClick={isDisabled ? () => undefined : onClick}
      w='100%'
      cursor='pointer'
      borderWidth={1}
      borderRadius={{
        md: 16,
        sm: 8,
        xs: 8,
      }}
      borderColor={isActive ? 'blue.1' : 'gray.1'}
      _hover={{
        borderColor: isActive && !isDisabled ? 'blue.1' : 'black.1',
      }}
      bg={isDisabled ? 'gray.2' : 'white'}
      p='16px'
      alignItems={{
        md: 'flex-start',
        sm: 'center',
        xs: 'center',
      }}
      {...props}
    >
      {children}
    </Flex>
  )
}

export default RadioCard

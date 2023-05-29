import { Flex, Spinner, type FlexProps } from '@chakra-ui/react'

const Index = ({
  loading,
  minHeight,
  top = '24px',
  ...rest
}: { loading: boolean } & FlexProps) => {
  if (!loading) {
    return null
  }
  return (
    <Flex
      position={'absolute'}
      left={0}
      right={0}
      top={top}
      bottom={0}
      bg='rgba(27, 34, 44, 0.1)'
      borderRadius={16}
      justify={'center'}
      zIndex={4}
      minHeight={minHeight}
      {...rest}
    >
      <Spinner
        thickness='6px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.1'
        size='xl'
        mt={'80px'}
      />
    </Flex>
  )
}

export default Index

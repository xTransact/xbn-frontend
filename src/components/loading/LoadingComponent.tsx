import {
  Flex,
  Spinner,
  type FlexProps,
  type SpinnerProps,
} from '@chakra-ui/react'

export type LoadingComponentProps = {
  loading: boolean
  spinnerProps?: SpinnerProps
} & FlexProps

const Index = ({
  loading,
  minHeight,
  top = '24px',
  spinnerProps,
  ...rest
}: LoadingComponentProps) => {
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
        {...spinnerProps}
      />
    </Flex>
  )
}

export default Index

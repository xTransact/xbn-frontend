import { Container, type ContainerProps } from '@chakra-ui/react'

import { Footer, Header } from '@/components'
import { RESPONSIVE_MAX_W } from '@/constants'

const RootLayout: React.FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <>
      <Header />
      <Container maxW={RESPONSIVE_MAX_W} minH={'calc(100vh - 440px)'} {...rest}>
        {children}
      </Container>
      <Footer />
    </>
  )
}

export default RootLayout

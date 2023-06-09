import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import type { FunctionComponent } from 'react'

type NotFoundProps = {
  title?: string
  backTo?: string
}
const NotFound: FunctionComponent<NotFoundProps> = ({
  title = 'Page not found',
  backTo = '/',
}) => {
  const navigate = useNavigate()
  return (
    <Alert
      status='error'
      variant='subtle'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      borderRadius={16}
      py={8}
      mt='40px'
    >
      <AlertIcon boxSize='40px' mr={0} />
      <AlertTitle mt={'16px'} mb={'4px'} fontSize='32px'>
        {title}
      </AlertTitle>
      <AlertDescription maxWidth='lg' my={'20px'}>
        Please contact us if you meet an invalid operation: help@xbank.plus
      </AlertDescription>
      <Button
        onClick={() => {
          navigate(backTo)
        }}
      >
        Back
      </Button>
    </Alert>
  )
}

export default NotFound

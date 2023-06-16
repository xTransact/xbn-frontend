import { useToast, Button, Text } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'

export type ErrorType = {
  code: string
  message: string
}

const useCatchContractError = () => {
  const toast = useToast()
  const toastError = useCallback(
    (error: ErrorType) => {
      const code: string = error?.code
      const originMessage: string = error?.message
      let title: string | ReactNode = code
      let description: string | ReactNode = originMessage
      if (!code && originMessage?.includes('{')) {
        const firstIndex = originMessage.indexOf('{')
        description = ''
        try {
          const hash = JSON.parse(
            originMessage.substring(firstIndex, originMessage.length),
          )?.transactionHash

          title = (
            <Text>
              {originMessage?.substring(0, firstIndex)} &nbsp;
              <Button
                variant={'link'}
                px={0}
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_TARGET_CHAIN_BASE_URL}/tx/${hash}`,
                  )
                }}
                textDecoration='underline'
                color='white'
              >
                see more
              </Button>
            </Text>
          )
        } catch {
          title = originMessage?.substring(0, firstIndex)
        }
      }

      if (!title) return
      toast({
        status: 'error',
        title,
        description,
        isClosable: true,
      })
    },
    [toast],
  )
  return {
    toastError,
    toast,
  }
}

export default useCatchContractError

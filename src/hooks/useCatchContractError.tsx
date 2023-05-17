import { useToast, Button, Text } from '@chakra-ui/react'
import { useCallback } from 'react'

import type { ReactNode } from 'react'

export type ErrorType = {
  code: string
  message: string
}

const useCatchContractError = () => {
  const toast = useToast()
  const toastError = useCallback(
    (error: ErrorType) => {
      console.log('🚀 ~ file: Loans.tsx:197 ~ interceptFn ~ error:', error)
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
          console.log('here')
          title = originMessage?.substring(0, firstIndex)
        }
      }

      toast({
        status: 'error',
        title,
        description,
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
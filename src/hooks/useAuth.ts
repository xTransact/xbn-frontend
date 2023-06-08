import { useToast } from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import { useCallback } from 'react'

import { apiPostAuthChallenge, apiPostAuthLogin } from '@/api/user'
import { setUserToken } from '@/utils/auth'
import { strToHex } from '@/utils/unit-conversion'

const { ethereum } = window

const useAuth = () => {
  const { runAsync: fetchMessageToSign, loading: loading1 } = useRequest(
    apiPostAuthChallenge,
    {
      manual: true,
    },
  )

  const { runAsync: fetchToken, loading: loading2 } = useRequest(
    apiPostAuthLogin,
    {
      manual: true,
    },
  )

  const toast = useToast()

  const runAsync = useCallback(
    async (address: string) => {
      try {
        toast({
          title:
            'Please click to sign in and accept the xBank Terms of Service',
          status: 'info',
        })
        const messageToSign = await fetchMessageToSign(address)

        const message = messageToSign?.login_message

        // const res = await window.ethereum.request({
        //   method: 'eth_signTypedData_v4',
        //   params: [address, message],
        // })

        const msg = strToHex(message)

        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [msg, address],
        })

        const tokenData = await fetchToken({
          address,
          message,
          signature,
        })
        setUserToken(tokenData)
      } catch (error) {
        console.log(error)
      }
    },
    [fetchMessageToSign, fetchToken, toast],
  )
  return {
    runAsync,
    loading: loading1 || loading2,
  }
}

export default useAuth

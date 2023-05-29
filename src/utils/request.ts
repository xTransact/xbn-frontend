import { createStandaloneToast } from '@chakra-ui/react'
import axios from 'axios'
import { isEmpty } from 'lodash-es'

import { TOAST_OPTION_CONFIG } from '@/constants'

import { getUserToken } from './auth'
// import { type Request } from 'aws4'
// import { decrypt } from './decrypt'
// import { PWD } from '@consts/crypt'

const { MODE, VITE_BASE_URL } = import.meta.env

const { toast } = createStandaloneToast({
  defaultOptions: {
    ...TOAST_OPTION_CONFIG,
  },
})

const request = axios.create({
  baseURL: '',
  headers: {
    Authorization: getUserToken()
      ? `Bearer ${getUserToken()?.token}`
      : undefined,
  },
  timeout: 20000,
})

request.interceptors.request.use(async ({ url, baseURL, ...config }) => {
  let _baseURL = baseURL
  if (MODE !== 'development') {
    if (url === '/api/ver2/exchange/xcurrency/latest') {
      _baseURL = 'https://xcr.tratao.com/'
    } else {
      _baseURL = VITE_BASE_URL
    }
  }
  return {
    ...config,
    url,
    baseURL: _baseURL,
  }
})

request.interceptors.response.use(
  (resp) => {
    return resp?.data
  },
  (e) => {
    const {
      response: { data },
    } = e

    const { error } = data

    if (error && !isEmpty(error)) {
      const { code, message } = error
      console.log('🚀 ~ file: request.ts:58 ~ code:', code)

      toast({
        title: code || 'Oops, network error...',
        description: message,
        status: 'error',
        isClosable: true,
        id: 'request-error-toast',
      })
    }

    throw data
  },
)

export default request

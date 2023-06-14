import { createStandaloneToast } from '@chakra-ui/react'
import axios from 'axios'
import isEmpty from 'lodash-es/isEmpty'

import { TOAST_OPTION_CONFIG } from '@/constants'

import { getUserToken } from './auth'

import type { InternalAxiosRequestConfig } from 'axios'
// import { type Request } from 'aws4'
// import { decrypt } from './decrypt'
// import { PWD } from '@consts/crypt'

const {
  MODE,
  VITE_LENDING_BASE_URL,
  VITE_APP_KEY,
  VITE_TEST_BASE_URL,
  VITE_BASE_URL,
} = import.meta.env

export const standaloneToast = createStandaloneToast({
  defaultOptions: {
    ...TOAST_OPTION_CONFIG,
  },
})

const { toast } = standaloneToast
export const AXIOS_DEFAULT_CONFIG = {
  baseURL: '',
  headers: {
    Authorization: getUserToken()
      ? `Bearer ${getUserToken()?.token}`
      : undefined,
  },
  timeout: 20000,
}
const request = axios.create(AXIOS_DEFAULT_CONFIG)

export const requestInterceptor = async ({
  url,
  baseURL,
  ...config
}: InternalAxiosRequestConfig) => {
  let _baseURL = baseURL
  if (MODE !== 'development') {
    if (url?.startsWith('/api/v')) {
      _baseURL = VITE_TEST_BASE_URL
    } else if (url?.startsWith('/lending/query')) {
      _baseURL = VITE_BASE_URL
    } else {
      _baseURL = VITE_LENDING_BASE_URL
    }
  }
  if (!url?.startsWith('/lending/query')) {
    const userToken = getUserToken()
    config.headers.Authorization = userToken
      ? `Bearer ${userToken?.token}`
      : undefined
    config.headers.appkey = VITE_APP_KEY
  }
  return {
    ...config,
    url,
    baseURL: _baseURL,
  }
}
request.interceptors.request.use(requestInterceptor)
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

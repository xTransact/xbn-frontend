import request from '@/utils/request'

export const apiPostAuthChallenge: (address: string) => Promise<{
  login_message: string
}> = async (address) => {
  return await request.post('/lending/api/v1/auth/challenge ', {
    address,
  })
}

export const apiPostAuthLogin: (data: {
  message: string
  address: string
  signature: string
}) => Promise<{
  expires: string
  token: string
}> = async (data) => {
  return await request.post('/lending/api/v1/auth/login ', data)
}

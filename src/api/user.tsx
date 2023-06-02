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
  const invitation_code = getQueryVariable('invitation_code')
  return await request.post(
    `/lending/api/v1/auth/login${
      !!invitation_code ? `?invitation_code=${invitation_code}` : ''
    }`,
    data,
  )
}

function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

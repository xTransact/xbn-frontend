type UserTokenType = {
  expires: string
  token: string
  address: string
}
export const setUserToken = (data: UserTokenType) => {
  try {
    localStorage.setItem('auth', JSON.stringify(data))
  } catch (error) { }
}

export const getUserToken = () => {
  try {
    const authStr = localStorage.getItem('auth')
    if (authStr) return JSON.parse(authStr) as UserTokenType
    return null
  } catch (error) {
    return null
  }
}

export const clearUserToken = () => {
  try {
    localStorage.removeItem('auth')
  } catch (error) { }
}

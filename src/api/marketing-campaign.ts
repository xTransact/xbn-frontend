import request from '@/utils/request'

export const apiGetBoxes = () => {
  return request.get('/api/v1/xbn/user/box')
}

// export const api
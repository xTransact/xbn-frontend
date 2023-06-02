import request from '@/utils/request'
export const apiGetBoxes: () => Promise<{
  box_bronze?: number,
  box_diamond?: number,
  box_gold?: number,
  box_platinum?: number,
  box_silver?: number,
}> = () => {
  return request.get('/api/v1/xbn/user/box')
}

export const apiGetInviteCode: () => Promise<{ code: string }> = () => {
  return request.get('/api/v1/xbn/user/invite-code')
}
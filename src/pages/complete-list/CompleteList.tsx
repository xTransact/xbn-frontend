import { useLocation, useNavigate } from 'react-router-dom'

import { MiddleStatus } from '@/components'
import RootLayout from '@/layouts/RootLayout'

const CompleteList = () => {
  const {
    state: { imageUrl },
  } = useLocation()
  const navigate = useNavigate()
  return (
    <RootLayout>
      <MiddleStatus
        step='success'
        imagePreviewUrl={imageUrl}
        onSuccessBack={() => {
          navigate('/buy-nfts/my-assets')
        }}
        successDescription='You need to repay the outstanding loan unless your NFT has been sold'
        successTitle='Listing Completed'
      />
    </RootLayout>
  )
}

export default CompleteList

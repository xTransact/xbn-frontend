import { ethers } from 'ethers'

import { contractABI, contractAddress } from '@/constants'

const { ethereum } = window
const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer,
  )

  return transactionsContract
}

export default createEthereumContract

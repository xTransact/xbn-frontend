// a list for saving subscribed event instances
// const subscribedEvents = {}

import { XBANK_CONTRACT_ABI } from '@/constants'

import { createWeb3Provider } from './createContract'

const getEventData = (eventName: string) => {
  const web3 = createWeb3Provider()
  const eventAbi = XBANK_CONTRACT_ABI.find((i) => i.name === eventName)
  if (!eventAbi) {
    return {
      topic: '',
      eventAbi,
    }
  }
  const topicItem = web3.eth.abi.encodeEventSignature({
    ...eventAbi,
  })
  return {
    topic: topicItem,
    eventAbi,
  }
}

export default getEventData

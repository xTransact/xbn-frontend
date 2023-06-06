import { useDisclosure } from '@chakra-ui/react'
import { useCallback, useContext } from 'react'

import { TransactionContext } from '@/context/TransactionContext'

const useWallet = () => {
  const { currentAccount, handleSwitchNetwork, ...rest } =
    useContext(TransactionContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const interceptFn = useCallback(
    async (fn?: () => void) => {
      // 是否连接目标链
      const currentChainId = window?.ethereum?.chainId
      if (!currentChainId) {
        return
      }

      if (currentChainId !== import.meta.env.VITE_TARGET_CHAIN_ID) {
        await handleSwitchNetwork()
        return
      }
      // 是否连接账户
      if (!currentAccount) {
        onOpen()
        return
      }

      if (fn) {
        fn()
      }
    },
    [currentAccount, onOpen, handleSwitchNetwork],
  )

  const handleOpenEtherscan = useCallback(() => {
    interceptFn(async () => {
      window.open(
        `${
          import.meta.env.VITE_TARGET_CHAIN_BASE_URL
        }/address/${currentAccount}`,
      )
    })
  }, [interceptFn, currentAccount])
  return {
    isOpen,
    onOpen,
    onClose,
    interceptFn,
    currentAccount,
    handleSwitchNetwork,
    handleOpenEtherscan,
    ...rest,
  }
}

export default useWallet

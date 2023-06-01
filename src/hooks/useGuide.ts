import { useDisclosure } from '@chakra-ui/react'
import { useLocalStorageState } from 'ahooks'
import { useCallback, useEffect } from 'react'

const useGuide = ({ key }: { key: string }) => {
  const [hasReadGuide, setHasReadGuide] = useLocalStorageState<boolean>(key, {
    defaultValue: false,
  })

  const { isOpen, onClose, onOpen } = useDisclosure()
  console.log('🚀 ~ file: useGuide.ts:11 ~ useGuide ~ isOpen:', isOpen)
  useEffect(() => {
    if (!hasReadGuide) onOpen()
  }, [hasReadGuide, onOpen])
  const onCloseGuide = useCallback(() => {
    setHasReadGuide(true)
    onClose()
  }, [onClose, setHasReadGuide])

  return {
    isOpen: false,
    onClose: onCloseGuide,
    onOpen,
  }
}

export default useGuide

import { useDisclosure } from '@chakra-ui/react'
import { useLocalStorageState } from 'ahooks'
import { useCallback, useEffect } from 'react'

const useGuide = ({ key }: { key: string }) => {
  const [hasReadGuide, setHasReadGuide] = useLocalStorageState<boolean>(key, {
    defaultValue: false,
  })

  const { isOpen, onClose, onOpen } = useDisclosure()
  useEffect(() => {
    if (!hasReadGuide) onOpen()
  }, [hasReadGuide, onOpen])
  const onCloseGuide = useCallback(() => {
    setHasReadGuide(true)
    onClose()
  }, [onClose, setHasReadGuide])

  return {
    isOpen,
    onClose: onCloseGuide,
    onOpen,
  }
}

export default useGuide

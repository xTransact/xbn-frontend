import { Box, Tooltip, type TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

import type { FunctionComponent } from 'react'

const TooltipComponent: FunctionComponent<TooltipProps> = ({
  isOpen,
  children,
  ...rest
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(isOpen)
  return (
    <Tooltip isOpen={isLabelOpen} {...rest}>
      <Box
        cursor={'pointer'}
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(true)}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export default TooltipComponent

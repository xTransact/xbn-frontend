import { Box } from '@chakra-ui/layout'

import type { BoxProps } from '@chakra-ui/layout'
import type { FunctionComponent } from 'react'

type CustomLoaderProps = {
  wrapperProps?: BoxProps
  dotProps?: BoxProps
}

const COLORS = ['blue.2', 'blue.3', 'blue.1', 'blue.3', 'blue.2']
const CustomLoader: FunctionComponent<CustomLoaderProps> = ({
  wrapperProps,
  dotProps,
}) => {
  return (
    <Box {...wrapperProps}>
      {COLORS.map((i, index) => (
        <Box
          /* eslint-disable */
          key={i + index}
          {...dotProps}
          boxSize={dotProps?.boxSize || '24px'}
          borderRadius={dotProps?.borderRadius || '100%'}
          animation={'slide 1s infinite'}
          bg={i}
          style={{
            animationDelay: `${(index + 1) / 10}s`,
          }}
          display={'inline-block'}
        />
      ))}
    </Box>
  )
}

export default CustomLoader

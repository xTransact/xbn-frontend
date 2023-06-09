import { type TextProps, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

const MortgagedTag: FunctionComponent<TextProps> = ({ ...rest }) => (
  <Text
    borderColor='red.1'
    boxShadow={`inset 0 0 0px 1px var(--chakra-colors-red-1)`}
    p={{
      lg: '8px',
      md: '4px',
      sm: '4px',
      xs: '4px',
    }}
    borderRadius={{
      md: 8,
      sm: 2,
      xs: 2,
    }}
    minW={{
      md: '80px',
      sm: '60px',
      xs: '60px',
    }}
    noOfLines={1}
    fontSize={'12px'}
    fontWeight='700'
    color='red.1'
    lineHeight={{
      md: '16px',
      sm: '12px',
      xs: '12px',
    }}
    transform={{
      md: 'none',
      sm: `scale(0.6666)`,
      xs: `scale(0.6666)`,
    }}
    transformOrigin='center'
    {...rest}
  >
    Mortgaged
  </Text>
)

export default MortgagedTag

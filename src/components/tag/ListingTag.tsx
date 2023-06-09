import { type TextProps, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

const ListingTag: FunctionComponent<TextProps> = ({ title, ...rest }) => {
  return (
    <Text
      pos='absolute'
      zIndex={10}
      left={{
        md: '16px',
        sm: '0',
        xs: '0',
      }}
      right={{
        md: '16px',
        sm: '0',
        xs: '0',
      }}
      bottom={{
        md: '12px',
        sm: '8px',
        xs: '4px',
      }}
      py='12px'
      bg='rgba(86, 110, 140, 0.33)'
      backdropFilter={'blur(6px)'}
      borderRadius={8}
      fontWeight='700'
      color='white'
      textAlign={'center'}
      lineHeight={{
        md: '16px',
        sm: '12px',
        xs: '12px',
      }}
      transform={{
        md: 'none',
        sm: `scale(0.8333)`,
        xs: `scale(0.8333)`,
      }}
      transformOrigin='center'
      fontSize={{
        md: '14px',
        sm: '12px',
        xs: '12px',
      }}
      {...rest}
    >
      {title} Listing
    </Text>
  )
}

export default ListingTag

import { Input } from '@chakra-ui/react'

import type { InputProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const CustomNumberInput: FunctionComponent<
  InputProps & {
    onSetValue: (v: string) => void
    minValue?: number
    maxValue?: number
    // 自定义小数位数的还没写
    // precious?: number
  }
> = ({
  isInvalid,
  onSetValue,
  minValue = 0,
  maxValue = 100000000,
  // precious = 10,
  ...rest
}) => {
  return (
    <Input
      w='100%'
      errorBorderColor='red.1'
      isInvalid={isInvalid}
      borderColor='gray.4'
      type='number'
      onInput={(e: any) => {
        const v = e.target.value as string
        if (Number(v) < minValue) {
          onSetValue('')
          return
        }

        if (Number(v) > maxValue) {
          onSetValue(`${maxValue}`)
          return
        }
        onSetValue(
          v.includes('.')
            ? v.replace(/^(-)*(\d+)\.(\d{0,10}).*$/, '$1$2.$3')
            : // ? v.replace(/^(-)*(\d+)\.(\d\d\d\d\d\d\d\d\d\d).*$/, '$1$2.$3')
              v,
        )
      }}
      h='60px'
      _focus={{
        borderColor: isInvalid ? 'red.1' : 'blue.1',
      }}
      _focusVisible={{
        boxShadow: `0 0 0 1px var(--chakra-colors-${
          isInvalid ? 'red-1' : 'blue-1'
        })`,
      }}
      placeholder='Amount...'
      borderRadius={8}
      {...rest}
    />
  )
}

export default CustomNumberInput

import { Flex } from '@chakra-ui/layout'
import { useState } from 'react'
import Select, { components, type GroupBase, type Props } from 'react-select'

import { DropdownIndicator, Option } from './AsyncSelectCollection'

function CustomSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  img,
  w,
  h,
  isDisabled,
  borderColor = 'var(--chakra-colors-blue-4)',
  ...restProps
}: Props<Option, IsMulti, Group> & {
  w?: string
  h?: string
  img?: React.ReactElement
  isDisabled?: boolean
  borderColor?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Select
      {...restProps}
      onMenuOpen={() => setIsOpen(true)}
      onMenuClose={() => setIsOpen(false)}
      isDisabled={isDisabled}
      theme={(theme) => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          primary: `var(--chakra-colors-blue-1)`,
        },
      })}
      styles={{
        placeholder: (base) => ({
          ...base,
          color: 'var(--chakra-colors-black-1)',
          fontWeight: 700,
        }),
        menuList(base) {
          return {
            ...base,
            borderRadius: 8,
            border: '1px solid var(--chakra-colors-blue-1)',
            // boxShadow:
            //   '-2px 1px 4px -3px var(--chakra-colors-blue-1),2px 2px 3px -3px var(--chakra-colors-blue-1)',
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            backgroundColor: 'white',
            paddingTop: 20,
          }
        },
        menu(base) {
          return {
            ...base,
            border: 'none',
            borderRadius: 8,
            top: '65%',
            boxShadow: 'none',
            zIndex: 2,
          }
        },
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: 'var(--chakra-colors-black-1)',
        }),
        control: (baseStyles, { isFocused, isDisabled: _isDisabled }) => ({
          ...baseStyles,
          cursor: 'pointer',
          width: w,
          fontWeight: 700,
          borderRadius: 8,
          border: `1px solid ${
            _isDisabled
              ? 'var(--chakra-colors-black-1)'
              : isFocused
              ? 'var(--chakra-colors-blue-1)'
              : borderColor
          }`,
          boxShadow: 'none',
          // boxShadow: isFocused
          //   ? '-2px 1px 4px -3px var(--chakra-colors-blue-1), 2px -2px 4px -3px var(--chakra-colors-blue-1)'
          //   : 'none',
          height: h || 44,
          backgroundColor: 'white',
          ':hover': {
            ...baseStyles[':hover'],
            borderColor: 'var(--chakra-colors-blue-1)',
          },
        }),
        option: (baseStyles, { isDisabled: _isDisabled, isSelected }) => ({
          ...baseStyles,
          backgroundColor: isSelected ? `var(--chakra-colors-blue-2)` : 'white',
          color: `var(--chakra-colors-black-1)`,
          fontSize: 14,
          fontWeight: 500,

          ':active': {
            ...baseStyles[':active'],
            backgroundColor: !_isDisabled
              ? 'var(--chakra-colors-blue-2)'
              : undefined,
          },
          ':hover': {
            ...baseStyles[':hover'],
            backgroundColor: 'var(--chakra-colors-gray-5)',
          },
        }),
        input(base) {
          return {
            ...base,
            paddingLeft: !!img ? 28 : 0,
          }
        },
      }}
      components={{
        // Control: ({ children, ...rest }) => {
        //   return (
        //     <components.Control {...rest}>
        //       {img}
        //       {children}
        //     </components.Control>
        //   )
        // },
        IndicatorSeparator: () => null,
        DropdownIndicator: (p) => {
          return <DropdownIndicator {...p} isOpen={isOpen} />
        },
        Option: (p) => <Option {...p} selectedIcon='icon-checked' />,
        SingleValue: ({ children, ...p }: any) => {
          return (
            <components.SingleValue {...p}>
              <Flex
                ml={!!img ? '-10px' : 0}
                gap='8px'
                lineHeight={2}
                alignItems='center'
              >
                {img}
                {children}
              </Flex>
            </components.SingleValue>
          )
        },
        Placeholder: ({ children, ...rest }) => (
          <components.Placeholder {...rest}>
            <Flex
              ml={!!img ? '-10px' : 0}
              gap='8px'
              lineHeight={2}
              alignItems='center'
            >
              {img}
              {children}
            </Flex>
          </components.Placeholder>
        ),
      }}
    />
  )
}

export default CustomSelect

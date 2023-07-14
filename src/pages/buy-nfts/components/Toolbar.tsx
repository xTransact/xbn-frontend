import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Skeleton,
  type SkeletonProps,
  type FlexProps,
} from '@chakra-ui/react'

import { SearchInput, SvgComponent, Select } from '@/components'
import { useIsMobile, useScrollMore } from '@/hooks'

import type { FunctionComponent } from 'react'

type ToolbarProps = {
  loadingProps?: SkeletonProps
  loading?: boolean
  searchConfig: {
    searchValue: string
    setSearchValue: (t: string) => void
  }
  sortConfig: {
    sortOptions: { label: string; value: any }[]
    sortValue: any
    setSortValue: (t: any) => void
  }
  gridConfig: {
    gridValue: number
    setGridValue: (t: number) => void
    props?: FlexProps
  }
} & FlexProps

const Toolbar: FunctionComponent<ToolbarProps> = ({
  loading,
  loadingProps,
  searchConfig: { searchValue, setSearchValue },
  sortConfig: { sortOptions, sortValue, setSortValue },
  gridConfig: { gridValue, setGridValue, props },
  ...rest
}) => {
  const isH5 = useIsMobile()
  const { isMoreThan } = useScrollMore({
    screenCount: 2,
    options: {
      isReady: isH5,
    },
  })
  if (loading) {
    return (
      <Skeleton
        height={16}
        borderRadius={16}
        mb='24px'
        startColor='rgba(27, 34, 44, 0.1)'
        endColor='rgba(27, 34, 44, 0.2)'
        {...loadingProps}
      />
    )
  }
  return (
    <Flex
      justify={'space-between'}
      mb='16px'
      pb='8px'
      alignItems='center'
      gap={{ md: 0, sm: '10px', xs: '10px' }}
      position='sticky'
      top={{
        md: '131px',
        sm: isMoreThan ? '31px' : '107px',
        xs: isMoreThan ? '31px' : '107px',
      }}
      zIndex={20}
      bg='white'
      pt={'25px'}
      transition='all 0.15s'
      {...rest}
    >
      <Box
        w={{
          xl: '55%',
          lg: '44%',
          md: '50%',
          sm: '90%',
          xs: '90%',
        }}
      >
        <SearchInput
          placeholder={'Search...'}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
        />
      </Box>
      {/* pc 端 排序 & grid */}
      <Flex
        alignItems={'center'}
        gap={'20px'}
        display={{
          xl: 'flex',
          lg: 'flex',
          md: 'flex',
          sm: 'none',
          xs: 'none',
        }}
      >
        <Select
          options={sortOptions}
          value={sortValue}
          defaultValue={sortOptions[0]}
          onChange={(target) => {
            if (!target) return
            setSortValue(target)
          }}
          borderColor={'var(--chakra-colors-gray-2)'}
        />
        <Flex
          borderColor={'gray.2'}
          borderWidth={1}
          borderRadius={8}
          {...props}
        >
          {[4, 3].map((item, i) => (
            <Flex
              p='14px'
              bg={gridValue === item ? 'gray.5' : 'white'}
              onClick={() => setGridValue(item)}
              cursor='pointer'
              key={item}
              borderLeftRadius={i === 0 ? 8 : 0}
              borderRightRadius={i === 1 ? 8 : 0}
            >
              <SvgComponent
                svgId={`icon-grid-${item === 4 ? 'large' : 'middle'}`}
                fill={`var(--chakra-colors-${
                  gridValue === item ? 'blue' : 'gray'
                }-1)`}
              />
            </Flex>
          ))}
        </Flex>
      </Flex>
      {/* mobile 排序 */}
      <Menu closeOnBlur={false} placement='bottom-end'>
        {({ isOpen: visible }) => (
          <>
            <MenuButton
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
            >
              <Flex
                alignItems={'center'}
                justifyContent='center'
                borderColor={visible ? 'blue.1' : 'gray.1'}
                borderWidth='1px'
                w='42px'
                h='42px'
                borderRadius={'50%'}
              >
                <SvgComponent
                  svgId='icon-sort-label'
                  color={visible ? 'blue.1' : 'black.1'}
                />
              </Flex>
            </MenuButton>
            <MenuList>
              <Flex flexDir={'column'} fontWeight={'500'} gap='8px'>
                {sortOptions.map(({ label, value }) => (
                  <Flex
                    key={label}
                    px='9px'
                    py='8px'
                    borderRadius={4}
                    bg={sortValue.label === label ? 'gray.5' : 'white'}
                    onClick={() => {
                      if (sortValue.label === label) return
                      setSortValue({ label, value })
                    }}
                  >
                    {label}
                  </Flex>
                ))}
              </Flex>
            </MenuList>
          </>
        )}
      </Menu>
    </Flex>
  )
}

export default Toolbar

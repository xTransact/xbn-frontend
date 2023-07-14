import { Flex, Text } from '@chakra-ui/react'
import { useCallback, useContext, useMemo, useState } from 'react'
import { components } from 'react-select'
import AsyncSelect from 'react-select/async'

import { TransactionContext } from '@/context/TransactionContext'

import { EmptyComponent, ImageWithFallback, SvgComponent } from '..'

export const DropdownIndicator = ({ isDisabled, isOpen, ...props }: any) => {
  return (
    <components.DropdownIndicator isDisabled={isDisabled} {...props}>
      {isDisabled ? (
        <SvgComponent
          svgId='icon-locked'
          fill={'var(--chakra-colors-black-1)'}
        />
      ) : (
        <SvgComponent
          svgId={'icon-arrow-down'}
          fill={'var(--chakra-colors-black-1)'}
          transform={`rotate(${isOpen ? 180 : 0}deg)`}
        />
      )}
    </components.DropdownIndicator>
  )
}

export const Option = ({
  children,
  isSelected,
  selectedIcon = '',
  unSelectedIcon = '',
  isDisabled,
  ...props
}: any) => {
  return (
    <components.Option
      isSelected={isSelected}
      isDisabled={isDisabled}
      {...props}
    >
      <Flex justify={'space-between'} alignItems='center' py='8px'>
        {children}
        <SvgComponent
          svgId={isSelected ? selectedIcon : unSelectedIcon}
          svgSize='20px'
          ml='20px'
          hidden={isDisabled}
        />
      </Flex>
    </components.Option>
  )
}

function AsyncSelectCollection({
  w,
  disabledArr,
  isDisabled,
  borderColor = 'var(--chakra-colors-blue-4)',
  ...rest
}: any) {
  const { collectionList, collectionLoading } = useContext(TransactionContext)
  const sortedCollectionList = useMemo(() => {
    if (!collectionList) return []
    return collectionList?.sort((a, b) => a.priority - b.priority)
  }, [collectionList])
  // const [collectionAddressArr, setCollectionAddressArr] = useState<string[]>([])
  // const { loading } = useRequest(apiGetActiveCollection, {
  //   debounceWait: 100,
  //   retryCount: 5,
  //   onSuccess: ({ data }) => {
  //     setCollectionAddressArr(data.map((i) => i.contract_addr))
  //   },
  // })

  // const { loading: collectionLoading, data: collectionData } =
  //   useNftCollectionsByContractAddressesQuery({
  //     variables: {
  //       assetContractAddresses: collectionAddressArr,
  //     },
  //     skip: isEmpty(collectionAddressArr),
  //   })
  // const collectionList = useMemo(
  //   () => collectionData?.nftCollectionsByContractAddresses || [],
  //   [collectionData],
  // )

  const promiseOptions = useCallback(
    (inputValue: string) =>
      new Promise<any[]>((resolve) => {
        if (collectionLoading) {
          return
        }
        if (!inputValue) {
          return
        } else {
          resolve(
            sortedCollectionList?.filter((i) =>
              i?.nftCollection?.name
                .toLowerCase()
                .includes(inputValue.toLowerCase()),
            ) || [],
          )
        }
      }),
    [sortedCollectionList, collectionLoading],
  )

  const [open, setOpen] = useState(false)
  return (
    <AsyncSelect
      onMenuOpen={() => setOpen(true)}
      onMenuClose={() => setOpen(false)}
      isDisabled={isDisabled}
      isLoading={collectionLoading}
      defaultOptions={collectionList || []}
      cacheOptions
      // @ts-ignore
      isOptionSelected={(item, select) => item.contract_addr === select}
      isOptionDisabled={(item: any) => {
        return disabledArr?.includes(item?.contractAddress?.toLowerCase())
      }}
      loadOptions={promiseOptions}
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
          height: 44,
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
          cursor: _isDisabled ? 'not-allowed' : 'pointer',

          ':active': {
            ...baseStyles[':active'],
            backgroundColor: !_isDisabled
              ? 'var(--chakra-colors-blue-2)'
              : undefined,
          },
          ':hover': {
            ...baseStyles[':hover'],
            backgroundColor: _isDisabled
              ? 'white'
              : 'var(--chakra-colors-gray-5)',
          },
        }),
      }}
      components={{
        IndicatorSeparator: () => null,
        NoOptionsMessage: () => <EmptyComponent my={0} mt='16px' />,
        Option: (p) => (
          <Option
            {...p}
            selectedIcon='icon-radio-active'
            unSelectedIcon='icon-radio-inactive'
          />
        ),
        DropdownIndicator: (p) => <DropdownIndicator {...p} isOpen={open} />,
        SingleValue: ({ data, ...p }: any) => {
          let imagePreviewUrl = '',
            name = '',
            safelistRequestStatus = ''
          if (data?.nftCollection) {
            imagePreviewUrl = data?.nftCollection.imagePreviewUrl
            name = data?.nftCollection.name
            safelistRequestStatus = data?.nftCollection.safelistRequestStatus
          }
          return (
            <components.SingleValue data={data} {...p}>
              <Flex alignItems={'center'} gap={'8px'} pl={'4px'} lineHeight={2}>
                <ImageWithFallback
                  src={imagePreviewUrl}
                  w={'20px'}
                  h={'20px'}
                  borderRadius={4}
                />
                <Text
                  display='inline-block'
                  overflow='hidden'
                  whiteSpace='nowrap'
                  textOverflow='ellipsis'
                  w='80%'
                >
                  {name}
                </Text>
                {safelistRequestStatus === 'verified' && (
                  <SvgComponent svgId='icon-verified-fill' />
                )}
              </Flex>
            </components.SingleValue>
          )
        },
      }}
      // @ts-ignore
      formatOptionLabel={({ nftCollection, contractAddress }) => {
        let imagePreviewUrl = '',
          name = '',
          safelistRequestStatus = ''
        if (nftCollection) {
          imagePreviewUrl = nftCollection.imagePreviewUrl
          name = nftCollection.name
          safelistRequestStatus = nftCollection.safelistRequestStatus
        }
        return (
          <Flex
            alignItems={'center'}
            key={contractAddress}
            gap={'8px'}
            pl={'4px'}
          >
            <ImageWithFallback
              src={imagePreviewUrl}
              w={'20px'}
              h={'20px'}
              borderRadius={4}
            />
            <Text noOfLines={1}>{name}</Text>
            {safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>
        )
      }}
      {...rest}
    />
  )
}

export default AsyncSelectCollection

import {
  Box,
  Divider,
  Flex,
  SlideFade,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react'

import type { SliderProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const SliderWrapper: FunctionComponent<
  SliderProps & {
    data: number[]
    label: string
  }
> = ({ value, label, data, ...rest }) => {
  return (
    <Flex
      alignItems={'center'}
      borderWidth={1}
      px='12px'
      gap='4px'
      borderRadius={8}
      py='8px'
      pr='20px'
      justify={'space-between'}
    >
      <Box
        bg='gray.2'
        p='4px'
        borderRadius={4}
        fontWeight={'700'}
        w='100px'
        textAlign={'center'}
      >
        {label}
      </Box>
      <Divider orientation='vertical' w='1px' h='30px' bg='pink' />
      <Slider w='340px' mt={'10px'} mb={'10px'} value={value} {...rest}>
        {data?.map((item) => (
          <SliderMark value={item} fontSize='14px' key={item} zIndex={1}>
            <Box
              w={'12px'}
              h={'12px'}
              boxSize={{
                md: '12px',
                sm: '6px',
                xs: '6px',
              }}
              borderRadius={8}
              borderWidth={{ md: 3, sm: 1, xs: 1 }}
              borderColor='white'
              mt={{
                md: '-6px',
                sm: -1,
                xs: -1,
              }}
              bg={value && value > item ? `blue.1` : `gray.1`}
            />
          </SliderMark>
        ))}

        <SliderTrack bg={`gray.1`}>
          <SliderFilledTrack
            // bg={`var(--chakra-colors-blue-2)`}
            bgGradient={`linear-gradient(90deg,#fff,var(--chakra-colors-blue-1))`}
          />
        </SliderTrack>
        <SliderThumb
          boxSize='24px'
          borderWidth={'5px'}
          borderColor={`blue.1`}
          _focus={{
            boxShadow: 'none',
          }}
        />
        <SlideFade />
      </Slider>
    </Flex>
  )
}

export default SliderWrapper

import {
  Box,
  Fade,
  Flex,
  SlideFade,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react'
import { useState } from 'react'

import { SvgComponent } from '@/components'

import type { SliderProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const SliderWrapper: FunctionComponent<
  SliderProps & {
    data: number[]
    label: string
    svgId: string
    unit: string
  }
> = ({ svgId, value, label, data, unit, ...rest }) => {
  // 是否正在拖动中
  const [isOnSlide, setIsOnSlide] = useState(false)
  return (
    <Flex
      alignItems={'center'}
      px='12px'
      gap='4px'
      py='8px'
      justify={'space-between'}
      w='480px'
    >
      <Slider
        w='320px'
        mt={'10px'}
        mb={'10px'}
        value={value}
        onChangeStart={() => {
          console.log('start')
          setIsOnSlide(true)
        }}
        onChangeEnd={() => {
          console.log('end')
          setIsOnSlide(false)
        }}
        {...rest}
      >
        <Fade in={isOnSlide}>
          <SliderMark
            value={value as number}
            textAlign='center'
            bg='blue.500'
            color='white'
            mt='-10'
            ml='-5'
            w='12'
          >
            {label}
          </SliderMark>
        </Fade>

        {data?.map((item) => (
          <SliderMark value={item} fontSize='14px' key={item} zIndex={1}>
            <Box
              boxSize={{
                md: '10px',
                sm: '6px',
                xs: '6px',
              }}
              borderRadius={8}
              borderWidth={'2px'}
              borderColor='white'
              mt={{
                md: '-5px',
                sm: -1,
                xs: -1,
              }}
              bg={value && value > item ? `blue.1` : `gray.1`}
              left={'-4px'}
              position={'relative'}
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
          boxSize='14px'
          borderWidth={'3px'}
          borderColor={`blue.1`}
          _focus={{
            boxShadow: 'none',
          }}
        />
        <SlideFade />
      </Slider>
      <Flex
        borderRadius={8}
        borderColor={'blue.4'}
        borderWidth={'1px'}
        py='12px'
        fontWeight={'700'}
        w='120px'
        alignItems={'center'}
        justify={'center'}
        lineHeight={'20px'}
      >
        <SvgComponent svgId={svgId} />
        {label}
        {unit}
      </Flex>
    </Flex>
  )
}

export default SliderWrapper

import {
  Text,
  Box,
  Flex,
  type TextProps,
  type BoxProps,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, type FunctionComponent } from 'react'

const ScoreChart: FunctionComponent<{
  data?: number
  labelStyle?: TextProps
  boxProps?: BoxProps
  innerBoxProps?: BoxProps
}> = ({ data, labelStyle, boxProps, innerBoxProps }) => {
  const option = useMemo(
    () => ({
      series: [
        // {
        //   type: 'gauge',
        //   min: 0,
        //   max: 100,
        //   splitNumber: 12,
        //   itemStyle: {
        //     color: '#EBEBFF',
        //   },
        //   progress: {
        //     show: true,
        //     width: 8,
        //     roundCap: !!data,
        //   },

        //   pointer: {
        //     show: false,
        //   },
        //   axisLine: {
        //     show: false,
        //   },
        //   axisTick: {
        //     show: false,
        //   },
        //   splitLine: {
        //     show: false,
        //   },
        //   axisLabel: {
        //     show: false,
        //   },
        //   anchor: {
        //     show: false,
        //   },
        //   title: {
        //     show: false,
        //   },
        //   detail: {
        //     show: false,
        //   },
        //   data: [
        //     {
        //       value: data,
        //     },
        //   ],
        // },

        {
          type: 'gauge',
          min: 0,
          max: 100,
          itemStyle: {
            color: '#0000FF',
          },
          progress: {
            show: true,
            width: 6,
            roundCap: true,
          },

          pointer: {
            show: false,
          },
          axisLine: {
            width: 6,
            roundCap: true,
            color: '#EAECF2',
            lineStyle: {
              width: 6,
            },
          },
          axisTick: {
            distance: -10,
            splitNumber: 2,
            lineStyle: {
              width: 1,
              color: '#E9EDF3',
            },
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: data,
            },
          ],
        },
      ],
    }),
    [data],
  )
  return (
    <Flex
      pb={{
        md: '16px',
        sm: '10px',
        xs: '10px',
      }}
      w={{
        md: '150px',
        sm: '100px',
        xs: '100px',
      }}
      flexDir='column'
      alignItems={'center'}
    >
      <Box
        position={'relative'}
        boxSize={{
          md: '125px',
          sm: '84px',
          xs: '84px',
        }}
        {...boxProps}
      >
        <ReactECharts
          option={option}
          style={{
            width: '100%',
            height: '100%',
          }}
          opts={{
            renderer: 'svg',
            devicePixelRatio: 2,
          }}
        />
        <Box
          position={'absolute'}
          top={{
            md: '26px',
            sm: '18px',
            xs: '22px',
          }}
          left={{
            md: '26px',
            sm: '18px',
            xs: '22px',
          }}
          boxSize={{
            md: '72px',
            sm: '48px',
            xs: '48px',
          }}
          p='1px'
          bg='linear-gradient(to bottom,#FF4218,#FFCF5F,#8DFDFD,#065DFF, #DAE3EF 90%)'
          // bg='linear-gradient(from -10deg at 50.00% 47.33%, #8DFDFD 0.5524577759206295deg, #FFCF5F 72.71821081638336deg, #FF4218 140.30883193016052deg, #065DFF 245.78956604003906deg)'
          borderRadius={'100%'}
          boxShadow={'2px 2px 4px 0px #DAE3EF, -2px -2px 4px 0px #FFF'}
          {...innerBoxProps}
        >
          <Box bg='white' borderRadius={'100%'} h='99%'>
            <Flex
              fontSize={{
                md: '18px',
                sm: '14px',
                xs: '14px',
              }}
              fontWeight={'700'}
              justify={'center'}
              alignItems={'center'}
              textAlign={'center'}
              boxSize={'100%'}
              borderRadius={'100%'}
              bg='linear-gradient(213deg, rgba(0, 0, 255, 0.10) 0%, rgba(255,
              255, 255, 0.10) 52.08%, rgba(0, 163, 255, 0.10) 100%)'
            >
              {data !== undefined ? `${data}%` : '--'}
            </Flex>
          </Box>
        </Box>
      </Box>

      <Text
        whiteSpace={'pre-line'}
        fontSize={data !== undefined ? '14px' : '12px'}
        fontWeight={data !== undefined ? '500' : '400'}
        textAlign={'center'}
        mt={{
          md: '-20px',
          sm: '-10px',
          xs: '-10px',
        }}
        lineHeight={'16px'}
        transition='all 0.2s'
        {...labelStyle}
      >
        {data !== undefined
          ? `Beating ${data}% LP`
          : `Higher The Score \nFaster The Lending Success`}
      </Text>
    </Flex>
  )
}

export default ScoreChart

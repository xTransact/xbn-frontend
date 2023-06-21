import { Text, Box, Image, Flex } from '@chakra-ui/react'
import * as echarts from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo, type FunctionComponent } from 'react'

import borderImg from '@/assets/border.png'

/* eslint-disable */
const gradientColor = new echarts.graphic.LinearGradient(0, 1, 1, 0, [
  {
    offset: 0.1,
    color: '#065DFF',
  },
  {
    offset: 0.4,
    color: '#8DFDFD',
  },
  {
    offset: 0.8,
    color: '#FFCF5F',
  },
  {
    offset: 1,
    color: '#FF4218',
  },
])

const ScoreChart: FunctionComponent<{ data: number }> = ({ data }) => {
  const option = useMemo(
    () => ({
      // tooltip: {
      //   formatter: !!data ? `beating ${data}% LP` : '',
      // },
      min: 0,
      max: 100,
      series: [
        {
          axisLine: {
            show: true,
            width: 12,
            roundCap: true,
            color: '#EAECF2',
            lineStyle: {
              shadowColor: '#D1D6E4',
              shadowBlur: 2,
            },
          },
          pointer: {
            show: false,
          },
          title: {
            show: false,
          },
          // name: 'Pressure',
          type: 'gauge',
          progress: {
            show: true,
            roundCap: true,
            width: 10,
            itemStyle: {
              borderMiterLimit: 6,
              borderCap: 'square',
              borderJoin: 'miter',
              /* eslint-disable */
              color: gradientColor,
            },
          },
          // anchor: {
          //   show: true,
          //   showAbove: true,
          //   size: 10,
          // },
          detail: {
            show: false,
            valueAnimation: true,
            formatter: '{value} %',
            fontSize: '18px',
            fontWeight: 700,
          },

          axisTick: {
            distance: -15,
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
    <Flex pb='16px' w='150px' flexDir='column' alignItems={'center'}>
      <Box position={'relative'}>
        <ReactECharts
          option={option}
          style={{
            width: 125,
            height: 125,
          }}
        />
        <Image
          src={borderImg}
          alt=''
          position={'absolute'}
          top={'30px'}
          left={'31px'}
        />
        <Box
          position={'absolute'}
          top={'30px'}
          left={'31px'}
          fontSize={'18px'}
          boxSize={'62px'}
          fontWeight={'700'}
          borderRadius={'100%'}
          background={
            'linear-gradient(212.74deg, rgba(0, 0, 255, 0.1) 15.22%, rgba(255, 255, 255, 0.1) 50.63%, rgba(0, 163, 255, 0.1) 83.2%)'
          }
          boxShadow={'-2px -2px 4px #FFFFFF, 2px 2px 4px #DAE3EF'}
          textAlign={'center'}
          lineHeight={'62px'}
        >
          {!!data ? `${data}%` : '--'}
        </Box>
      </Box>

      <Text
        whiteSpace={'pre-line'}
        fontSize={!!data ? '14px' : '12px'}
        fontWeight={!!data ? '500' : '400'}
        textAlign={'center'}
        mt='-20px'
        lineHeight={'20px'}
      >
        {!!data
          ? `beating ${data}% LP`
          : `Higher The Score \nFaster The Lending Success`}
      </Text>
    </Flex>
  )
}

export default ScoreChart

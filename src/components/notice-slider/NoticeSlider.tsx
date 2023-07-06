import { Box, Button, Flex, Text } from '@chakra-ui/react'
import isEmpty from 'lodash-es/isEmpty'
import Slider from 'react-slick'

import SvgComponent from '../svg-component/SvgComponent'

import type { ButtonProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

type NoticeItemType = {
  title: string
  buttonProps?: ButtonProps
}

type NoticeSliderProps = {
  data: NoticeItemType[]
}

const ItemWrapper: FunctionComponent<NoticeItemType> = ({
  title,
  buttonProps,
}) => {
  return (
    <Flex alignItems={'center'} justify={'space-between'}>
      <Flex alignItems={'center'} gap={'4px'}>
        <SvgComponent
          svgId='icon-notice'
          fill={'red.1'}
          fontSize={{
            md: '24px',
            sm: '18px',
            xs: '18px',
          }}
        />
        <Text
          color='blue.1'
          fontSize={{
            md: '20px',
            sm: '16px',
            xs: '16px',
          }}
          fontWeight={'700'}
        >
          {title}
        </Text>
      </Flex>
      <Button
        px={{
          md: '20px',
          sm: '10px',
          xs: '10px',
        }}
        h={{
          md: '36px',
          sm: '30px',
          xs: '30px',
        }}
        variant={'primary'}
        fontSize={{
          md: '20px',
          sm: '14px',
          xs: '14px',
        }}
        borderRadius={'8px'}
        {...buttonProps}
      >
        {buttonProps?.title}
      </Button>
    </Flex>
  )
}

/**
 *   <NoticeSlider
        data={[
          {
            title: 'You have 2 NFTs to claim',
            buttonProps: {
              title: 'Claim now',
              onClick: () => console.log('click claim now'),
            },
          },
          {
            title: 'You have 1 loan that is due in 3 days, remember to repay',
            buttonProps: {
              title: 'See now',
              onClick: () => console.log('click see now'),
            },
          },
        ]}
      />
 */
const NoticeSlider: FunctionComponent<NoticeSliderProps> = ({ data }) => {
  if (!data || isEmpty(data)) return null
  return (
    <Box
      borderRadius={'8px'}
      borderWidth={1}
      borderColor={'blue.1'}
      px={{
        md: '24px',
        sm: '8px',
        xs: '8px',
      }}
      py={{
        md: '12px',
        sm: '4px',
        xs: '4px',
      }}
      bg='rgba(179, 179, 255, 0.20)'
    >
      {data.length === 1 ? (
        <ItemWrapper {...data[0]} />
      ) : (
        <Slider
          dots={false}
          arrows={false}
          infinite
          speed={500}
          lazyLoad='progressive'
          autoplay
          autoplaySpeed={5000}
          slidesToShow={1}
          slidesToScroll={1}
          pauseOnHover={true}
          fade
          vertical
        >
          {data.map((i) => (
            <ItemWrapper {...i} key={i.title} />
          ))}
        </Slider>
      )}
    </Box>
  )
}

export default NoticeSlider
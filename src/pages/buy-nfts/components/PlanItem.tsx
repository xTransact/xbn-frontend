import { Flex, Text } from '@chakra-ui/react'

import { SvgComponent } from '@/components'
import { UNIT } from '@/constants'

import type { FunctionComponent } from 'react'

const PlanItem: FunctionComponent<{
  label: string
  value?: number | string
}> = ({ label, value }) => {
  return (
    <Flex justify={'space-between'} w='100%'>
      <Flex>
        <SvgComponent svgId='icon-calendar' />
        &nbsp;&nbsp;
        <Text fontSize='14px'>{label}</Text>
      </Flex>
      <Text fontSize='14px'>
        {value ?? '--'} {UNIT}
      </Text>
    </Flex>
  )
}

export default PlanItem

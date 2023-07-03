import { Flex } from '@chakra-ui/react'
import round from 'lodash-es/round'
import Pagination, { type PaginationProps } from 'rc-pagination'
import { useMemo, type FunctionComponent } from 'react'

import SvgComponent from '../svg-component/SvgComponent'

import './index.less'

const PaginationItem: FunctionComponent<{
  type: 'prev' | 'next'
  isActive?: boolean
}> = ({ type, isActive }) => {
  return (
    <Flex
      boxSize={'36px'}
      borderRadius={'100%'}
      ml='8px'
      justify={'center'}
      alignItems={'center'}
      _hover={{
        background: isActive ? '' : 'blue.2',
      }}
    >
      <SvgComponent
        boxSize={'14px'}
        fontSize={'14px'}
        svgId='icon-arrow-down'
        style={{
          transform: `rotate(${type === 'prev' ? '90' : '270'}deg)`,
        }}
        fill={isActive ? 'gray.1' : 'gray.3'}
      />
    </Flex>
  )
}

const Index: FunctionComponent<PaginationProps> = ({
  total,
  defaultCurrent = 1,
  onChange,
  current,
  pageSize,
  ...rest
}) => {
  const totalPage = useMemo(() => {
    if (!total || !pageSize) return 0
    return round(total / pageSize)
  }, [total, pageSize])
  return (
    <Pagination
      className='ant-pagination'
      defaultCurrent={defaultCurrent}
      total={total}
      current={current}
      pageSize={pageSize}
      onChange={(page, _pageSize) => {
        scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
        if (onChange) onChange(page, _pageSize)
      }}
      itemRender={(page, type, element) => {
        if (type === 'prev') {
          return <PaginationItem type='prev' isActive={current === 1} />
        }
        if (type === 'next') {
          return (
            <PaginationItem type='next' isActive={current === totalPage + 1} />
          )
        }

        return element
      }}
      {...rest}
    />
  )
  // return (
  //   <ReactPaginate
  //     breakLabel='...'
  //     nextLabel='>'
  //     onPageChange={onPageChange}
  //     pageRangeDisplayed={pageRangeDisplayed}
  //     pageCount={pageCount}
  //     previousLabel='<'
  //     renderOnZeroPageCount={() => null}
  //     containerClassName='paginate-container'
  //     pageClassName='page-class'
  //     pageLinkClassName='page-link-class'
  //     activeClassName='active-class'
  //     activeLinkClassName='active-link-class'
  //     previousLinkClassName='previous-link-class'
  //     nextLinkClassName='next-link-class'
  //     nextClassName='next-class'
  //     {...rest}
  //   />
  // )
}

export default Index

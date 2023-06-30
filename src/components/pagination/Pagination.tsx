import Pagination, { type PaginationProps } from 'rc-pagination'

import './index.less'

import type { FunctionComponent } from 'react'

const index: FunctionComponent<PaginationProps> = ({
  total,
  defaultCurrent = 1,
  onChange,
  ...rest
}) => {
  return (
    <Pagination
      className='ant-pagination'
      defaultCurrent={defaultCurrent}
      total={total}
      onChange={(page, pageSize) => {
        scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
        if (onChange) onChange(page, pageSize)
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

export default index

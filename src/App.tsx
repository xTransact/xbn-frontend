import { Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import { Fallback } from '@/components'

import { useScrollToTop } from './hooks'
import lazyWithRetries from './utils/lazyWithRetries'

// import NotFound from './pages/404'
// import PoolCreate from './pages/Lend/Create'
// import Lend from './pages/Lend/Lend'
// import LoansForBuyer from './pages/buy-nfts//Loans'
// import Market from './pages/buy-nfts/Market'
// import MyAssets from './pages/buy-nfts/MyAssets'
// import NftAssetDetail from './pages/buy-nfts/NftAssetDetail'

// Lend
const Lend = lazyWithRetries(() => import('./pages/Lend/Lend'))
const PoolCreateAndEdit = lazyWithRetries(() => import('./pages/Lend/Create'))

// buy nfts
const Market = lazyWithRetries(() => import('./pages/buy-nfts/Market'))
const MyAssets = lazyWithRetries(() => import('./pages/buy-nfts/MyAssets'))
const LoansForBuyer = lazyWithRetries(() => import('./pages/buy-nfts/Loans'))
const CompleteList = lazyWithRetries(
  () => import('./pages/complete-list/CompleteList'),
)

// nft detail
const NftAssetDetail = lazyWithRetries(
  () => import('./pages/buy-nfts/NftAssetDetail'),
)

// nft detail
const H5Demo = lazyWithRetries(() => import('./pages/h5-demo/H5Demo'))
const NotFound = lazyWithRetries(() => import('./pages/404'))

function App() {
  useScrollToTop()
  return (
    <>
      <Routes>
        <Route
          path='/xlending'
          element={<Navigate replace to='/xlending/buy-nfts/market' />}
        />
        <Route
          path='/xlending/lending'
          element={<Navigate replace to='/xlending/lending/collections' />}
        />
        <Route
          path='/xlending/lending/my-pools'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        />

        {/* <Route
          path='lending/pools'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        /> */}
        <Route
          path='/xlending/lending/:action'
          element={
            <Suspense fallback={<Fallback />}>
              <PoolCreateAndEdit />
            </Suspense>
          }
        />
        <Route
          path='/xlending/lending/collections'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        />

        <Route
          path='/xlending/lending/loans'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        />

        {/* buy nfts */}
        <Route
          path='/xlending/buy-nfts'
          element={<Navigate replace to='/xlending/buy-nfts/market' />}
        />
        <Route
          path='/xlending/buy-nfts/market'
          element={
            <Suspense fallback={<Fallback />}>
              <Market />
            </Suspense>
          }
        />

        {/* asset */}
        <Route
          path='/xlending/asset/detail'
          // path='/asset/:asset_contract_address'
          element={
            <Suspense fallback={<Fallback />}>
              <NftAssetDetail />
            </Suspense>
          }
        />
        <Route
          path='/xlending/buy-nfts/my-assets'
          element={
            <Suspense fallback={<Fallback />}>
              <MyAssets />
            </Suspense>
          }
        />
        <Route
          path='/xlending/buy-nfts/complete'
          element={
            <Suspense fallback={<Fallback />}>
              <CompleteList />
            </Suspense>
          }
        />
        <Route
          path='xlending/buy-nfts/loans'
          element={
            <Suspense fallback={<Fallback />}>
              <LoansForBuyer />
            </Suspense>
          }
        />

        {/* <Route path='lending'>
          <Route
            path='pools'
            element={
              <React.Suspense fallback={<Fallback />}>
                <Lend />
              </React.Suspense>
            }
          />
          <Route
            path='my-pools'
            element={
              <React.Suspense fallback={<Fallback />}>
                <Lend />
              </React.Suspense>
            }
          />
          <Route
            path='loans'
            element={
              <React.Suspense fallback={<Fallback />}>
                <Lend />
              </React.Suspense>
            }
          />
        </Route> */}
        <Route
          path='/xlending/demo'
          element={
            <Suspense fallback={<Fallback />}>
              <H5Demo />
            </Suspense>
          }
        />

        <Route
          element={
            <Suspense fallback={<Fallback />}>
              <NotFound />
            </Suspense>
          }
          path='/xlending/*'
        />
      </Routes>
    </>
  )
}

export default App

import { Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import { Fallback } from '@/components'
import RootLayout from '@/layouts/RootLayout'

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

// marketing campaign
const MarketingCampaign = lazyWithRetries(
  () => import('./pages/marketing-campaign/MarketingCampaign'),
)

// nft detail
const H5Demo = lazyWithRetries(() => import('./pages/h5-demo/H5Demo'))
const NotFound = lazyWithRetries(() => import('./pages/404'))

// loan history
const History = lazyWithRetries(() => import('./pages/history/History'))

function App() {
  useScrollToTop()
  return (
    <>
      <Routes>
        <Route path='/' element={<Navigate replace to='/buy-nfts/market' />} />
        <Route
          path='/lending'
          element={<Navigate replace to='/lending/collections' />}
        />
        <Route
          path='/history'
          element={<Navigate replace to='/history/loan' />}
        />
        <Route
          path='/history/:type'
          element={
            <Suspense fallback={<Fallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path='/lending/my-pools'
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
          path='/lending/:action'
          element={
            <Suspense fallback={<Fallback />}>
              <PoolCreateAndEdit />
            </Suspense>
          }
        />
        <Route
          path='/lending/collections'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        />

        <Route
          path='/lending/loans'
          element={
            <Suspense fallback={<Fallback />}>
              <Lend />
            </Suspense>
          }
        />

        {/* buy nfts */}
        <Route
          path='/buy-nfts'
          element={<Navigate replace to='/buy-nfts/market' />}
        />
        <Route
          path='/buy-nfts/market/:collectionId?'
          element={
            <Suspense fallback={<Fallback />}>
              <Market />
            </Suspense>
          }
        />

        {/* asset */}
        <Route
          path='/asset/:contractAddress/:tokenID'
          // path='/asset/:asset_contract_address'
          element={
            <Suspense fallback={<Fallback />}>
              <NftAssetDetail />
            </Suspense>
          }
        />
        <Route
          path='/buy-nfts/my-assets'
          element={
            <Suspense fallback={<Fallback />}>
              <MyAssets />
            </Suspense>
          }
        />
        <Route
          path='/buy-nfts/complete'
          element={
            <Suspense fallback={<Fallback />}>
              <CompleteList />
            </Suspense>
          }
        />
        <Route
          path='/loans'
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
          path='/demo'
          element={
            <RootLayout>
              <Suspense fallback={<Fallback />}>
                <H5Demo />
              </Suspense>
            </RootLayout>
          }
        />
        {/* 营销活动 */}
        <Route
          path='/marketing-campaign'
          element={
            <Suspense fallback={<Fallback />}>
              <MarketingCampaign />
            </Suspense>
          }
        />
        <Route
          element={
            <Suspense fallback={<Fallback />}>
              <NotFound />
            </Suspense>
          }
          path='*'
        />
      </Routes>
    </>
  )
}

export default App

import { useToast } from '@chakra-ui/react'
import { useLocalStorageState, useRequest } from 'ahooks'
import isEmpty from 'lodash-es/isEmpty'
import {
  useEffect,
  useState,
  createContext,
  type ReactElement,
  useCallback,
  useMemo,
} from 'react'

import { apiGetActiveCollection } from '@/api'
import { useNftCollectionsByContractAddressesQuery } from '@/hooks'
import useAuth from '@/hooks/useAuth'

const COLLECTION_DEMO = {
  contractAddress: '',
  nftCollection: {
    assetsCount: 0,
    bannerImageUrl: '',
    chatUrl: '',
    createdAt: '2023-02-23T08:35:14Z',
    createdDate: '2022-12-12T08:18:30Z',
    description: '',
    discordUrl: '',
    externalUrl: '',
    featuredImageUrl: '',
    fees: [],
    id: 0,
    imagePreviewUrl: '',
    imageThumbnailUrl: '',
    imageUrl: '',
    instagramUsername: '',
    largeImageUrl: '',
    mediumUsername: '',
    name: '',
    nftCollectionStat: {
      averagePrice: 0,
      count: 0,
      createdAt: '',
      floorPrice: 0,
      floorPriceRate: 0,
      id: 0,
      marketCap: 0,
      numOwners: 0,
      numReports: 0,
      oneDayAveragePrice: 0,
      oneDayChange: 0,
      oneDaySales: 0,
      oneDayVolume: 0,
      sevenDayAveragePrice: 0,
      sevenDayChange: 0,
      sevenDaySales: 0,
      sevenDayVolume: 0,
      thirtyDayAveragePrice: 0,
      thirtyDayChange: 0,
      thirtyDaySales: 0,
      thirtyDayVolume: 0,
      totalSales: 0,
      totalSupply: 0,
      totalVolume: 0,
      updatedAt: '',
      __typename: 'NFTCollectionStat',
    },
    onlyProxiedTransfers: false,
    openseaBuyerFeeBasisPoints: '0',
    openseaSellerFeeBasisPoints: '50',
    payoutAddress: '',
    safelistRequestStatus: '',
    shortDescription: '',
    slug: '',
    subscriberCount: 0,
    telegramUrl: '',
    twitterUsername: '',
    updatedAt: '',
    wikiUrl: '',
    nftCollectionMetaData: {
      subscribe: false,
      subscribeCount: 0,
      __typename: 'NFTCollectionMetaData',
    },
  },
}

export const TransactionContext = createContext({
  connectWallet: async () => {},
  currentAccount: '',
  isConnected: false,
  connectLoading: false,
  handleSwitchNetwork: async () => {},
  handleDisconnect: () => {},
  collectionList: [{ ...COLLECTION_DEMO, __typename: 'NFTCollection' }],
  collectionLoading: false,
})

const { ethereum } = window

export const TransactionsProvider = ({
  children,
}: {
  children: ReactElement
}) => {
  const { runAsync: signAuth } = useAuth()
  // collection 提取到外层
  const [collectionAddressArr, setCollectionAddressArr] = useState<string[]>([])
  const { loading } = useRequest(apiGetActiveCollection, {
    debounceWait: 100,
    retryCount: 5,
    onSuccess: (data) => {
      setCollectionAddressArr(data.map((i) => i.contract_addr))
    },
  })

  const { loading: collectionLoading, data: collectionData } =
    useNftCollectionsByContractAddressesQuery({
      variables: {
        assetContractAddresses: collectionAddressArr,
      },
      skip: isEmpty(collectionAddressArr),
    })
  const collectionList = useMemo(() =>
    // collectionAddressArr.map((item) => {
    //   return {
    //     contractAddress: item,
    //     nftCollection:
    //       collectionData?.nftCollectionsByContractAddresses?.find(
    //         (i) => i.contractAddress.toLowerCase() === item.toLowerCase(),
    //       )?.nftCollection,
    //   }
    // }),
    {
      return collectionData?.nftCollectionsByContractAddresses || []
    }, [collectionData])

  const toast = useToast()

  const [connectLoading, setConnectLoading] = useState(false)
  const [currentAccount, setCurrentAccount] = useLocalStorageState<string>(
    'metamask-connect-address',
    {
      defaultValue: '',
    },
  )

  const [isConnected, setIsConnected] = useLocalStorageState<boolean>(
    'address-connected',
    {
      defaultValue: false,
    },
  )

  const handleDisconnect = useCallback(() => {
    setCurrentAccount('')
    setIsConnected(false)
    window.location.href = '/'
  }, [setCurrentAccount, setIsConnected])

  const checkIfWalletIsConnect = useCallback(async () => {
    try {
      if (window.location.pathname === '/demo') return
      if (!isConnected) {
        setCurrentAccount('')
        return
      }
      if (!ethereum) {
        toast.closeAll()
        toast({
          title: `please install metamask`,
          status: 'error',
          isClosable: true,
        })
        return
      }
      if (ethereum.chainId !== import.meta.env.VITE_TARGET_CHAIN_ID) {
        return
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      setIsConnected(true)
      if (accounts.length) {
        setCurrentAccount(accounts[0])

        // getAllTransactions();
      } else {
        setCurrentAccount('')
      }
    } catch (error) {
      setCurrentAccount('')
    }
  }, [toast, setCurrentAccount, setIsConnected, isConnected])
  useEffect(() => {
    // eth_accounts always returns an array.
    async function handleAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts.
        console.log('Please connect to MetaMask.')
      } else if (accounts[0] !== currentAccount) {
        // Reload your interface with accounts[0].
        localStorage.removeItem('auth')
        localStorage.removeItem('metamask-connect-address')
        setCurrentAccount(accounts[0])
        await signAuth(accounts[0])
        location.reload()
        // window.location.href = '/marketing-campaign'
        // window.location = window.location
      }
    }
    window.ethereum.on('accountsChanged', handleAccountsChanged)
  }, [])
  const handleSwitchNetwork = useCallback(async () => {
    if (!ethereum) {
      return
    }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: import.meta.env.VITE_TARGET_CHAIN_ID }],
      })
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length) {
        setCurrentAccount(accounts[0])
        // getAllTransactions();
      } else {
        setConnectLoading(true)
        const requestedAccounts = await ethereum.request({
          method: 'eth_requestAccounts',
        })

        setCurrentAccount(requestedAccounts[0])
        setConnectLoading(false)
      }
      setIsConnected(true)
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        toast({
          status: 'error',
          title: 'please add Ethereum Chain',
        })
        // try {
        //   await ethereum.request({
        //     method: 'wallet_addEthereumChain',
        //     params: [
        //       {
        //         chainId: '0xf00',
        //         chainName: '...',
        //         rpcUrls: ['https://...'] /* ... */,
        //       },
        //     ],
        //   })
        // } catch (addError) {
        //   // handle "add" error
        // }
      } else {
        toast({
          status: 'info',
          title: 'please switch Ethereum Chain first',
        })
      }
    }
  }, [toast, setCurrentAccount, setIsConnected])

  const connectWallet = useCallback(async () => {
    try {
      if (window.location.pathname === '/demo') return

      if (!ethereum) {
        toast.closeAll()
        toast({
          title: `please install metamask`,
          status: 'error',
          isClosable: true,
        })
        return
      }
      if (ethereum.chainId !== import.meta.env.VITE_TARGET_CHAIN_ID) {
        await handleSwitchNetwork()
        return
      }

      setConnectLoading(true)
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      setCurrentAccount(accounts[0])
      setIsConnected(true)
      await signAuth(accounts[0])
      setConnectLoading(false)
    } catch (error) {
      setConnectLoading(false)

      throw new Error('No ethereum object')
    }
  }, [toast, handleSwitchNetwork, setCurrentAccount, signAuth, setIsConnected])

  useEffect(() => {
    checkIfWalletIsConnect()
    // checkIfTransactionsExists()
  }, [checkIfWalletIsConnect])

  return (
    <TransactionContext.Provider
      value={{
        // transactionCount,
        connectWallet,
        // transactions,
        currentAccount: currentAccount as string,
        connectLoading,
        // isLoading,
        // sendTransaction,
        // handleChange,
        // formData,
        handleSwitchNetwork,
        handleDisconnect,
        isConnected: isConnected as boolean,
        // @ts-ignore
        collectionList,
        collectionLoading: loading || collectionLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

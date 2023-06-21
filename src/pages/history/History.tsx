import { Box, Button, Heading } from '@chakra-ui/react'
import { useEffect } from 'react'

import { ConnectWalletModal } from '@/components'
import { useWallet } from '@/hooks'
import { createWeb3Provider, createXBankContract } from '@/utils/createContract'

const History = () => {
  const { isOpen, onClose, interceptFn } = useWallet()
  useEffect(() => {
    interceptFn()
  }, [interceptFn])

  return (
    <Box my='60px'>
      <Heading size={'2xl'} mb='60px'>
        My Loan History
      </Heading>
      <Button
        variant={'primary'}
        onClick={async () => {
          const xBankContract = createXBankContract()
          // const wethContract = createWethContract()
          const web3 = createWeb3Provider()
          // const fromBlock = await web3.eth.getBlockNumber()

          await xBankContract.getPastEvents(
            'LoanPrepayment',
            {
              filter: {
                // src: currentAccount,
                //  myIndexedParam: [20, 23],
                //  myOtherIndexedParam: '0x123456789...',
              }, // Using an array means OR: e.g. 20 or 23
              fromBlock: 1,
              toBlock: 'latest',
            },
            function (error, events) {
              if (error) {
                console.log(error)
                return
              }
              console.log(events)
            },
          )
          return

          // 会返回区块生成的时间戳 timestamp
          // web3.eth.getBlock(9207901, console.log)
          // 会返回 status true 成功 false 失败
          // web3.eth.getTransactionReceipt(
          //   '0x7fc687424676d26fedf7bfafaf14f74207816c1486708f779fcc8bd59ac2d173',
          //   console.log,
          // )
          // 会返回 value
          web3.eth.getTransaction(
            '0x7fc687424676d26fedf7bfafaf14f74207816c1486708f779fcc8bd59ac2d173',
            console.log,
          )

          // web3.eth.getTransactionReceipt(events[2].transactionHash, console.log)
          // web3.eth.getTransactionReceipt(events[3].transactionHash, console.log)
        }}
      >
        fetch
      </Button>
      {/*  */}
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </Box>
  )
}

export default History

import { BigNumber, Signer } from 'ethers'
import { useAccount, useNetwork, useSigner, useBalance } from 'wagmi'

export interface ConnectedWalletState {
    signer?: Signer
    address?: string
    chainId?: number
    isConnecting: boolean
    networkName: string
    balance: BigNumber
}

const useConnectedWallet = () => {
    const { address, isConnecting } = useAccount()
    const { chain } = useNetwork()
    const { data: signer } = useSigner()
    const { data } = useBalance({ addressOrName: address })
    return {
        signer,
        address,
        chainId: chain?.id,
        isConnecting,
        networkName: chain?.name,
        balance: data?.value,
    }
}

export default useConnectedWallet

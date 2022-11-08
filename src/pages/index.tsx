import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Contract, EventFilter, Signer, utils } from 'ethers'
import { useCallback } from 'react'
import { SiweMessage } from 'siwe'
import { useAccount, useNetwork, useSigner, useSignMessage } from 'wagmi'
import EIP1271 from '../EIP1271.json'

const SIGN_IN_MESSAGE = 'Sign in with Ethereum.'
const DUMMY_NONCE = 'BC9Rdn35ghkKUZEBF'
const SMART_WALLET_SIGNATURE = '0x'

const resolveOnContractEvent = (contract: Contract, eventFilter: EventFilter) =>
    new Promise<void>((resolve, reject) => contract.once(eventFilter, resolve).once('error', reject))

const waitSmartContractSignature = async (signer: Signer, hash: string) => {
    const walletContract = new Contract(await signer.getAddress(), EIP1271.abi, signer)
    const internalHash = await walletContract.getMessageHash(hash)
    const eventFilter = walletContract.filters.SignMsg(internalHash)

    console.log('walletContract', walletContract)
    console.log('internalHash', internalHash)
    console.log('eventFilter', eventFilter)
    return await resolveOnContractEvent(walletContract, eventFilter)
}

const Example = () => {
    const { isConnected, address } = useAccount()
    const { data: signer } = useSigner()
    const { chain } = useNetwork()
    const { signMessageAsync } = useSignMessage()

    const signMessage = useCallback(async () => {
        if (!isConnected) return
        try {
            const message = new SiweMessage({
                domain: window.location.host,
                address: address,
                statement: SIGN_IN_MESSAGE,
                uri: window.location.origin,
                version: '1',
                chainId: chain?.id,
                nonce: DUMMY_NONCE,
            })
            const preparedMessage = message.prepareMessage()
            const signature = await signMessageAsync({
                message: preparedMessage,
            })
            if (signature !== SMART_WALLET_SIGNATURE) {
                alert('no smart wallet used, aborting')
                return
            }
            await waitSmartContractSignature(signer, utils.hashMessage(preparedMessage))

            alert('success')
        } catch (error) {
            console.error(error)
            alert('error, see console log')
        }
    }, [address, chain?.id, isConnected, signMessageAsync, signer])

    console.log(isConnected)

    return (
        <div>
            <h1>gnosis-error-example</h1>
            <ConnectButton />
            <button onClick={signMessage}>sign message via smart wallet</button>
        </div>
    )
}

export default Example

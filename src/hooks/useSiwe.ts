import Nonce from '@/entities/Nonce'
import validateCurrentChainCompatibility from '@/operations/validateCurrentChainCompatibility'
import waitSmartContractSignature from '@/operations/waitSmartContractSignature'
import { utils } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isBrowser, isMobile } from 'react-device-detect'
import { SiweMessage } from 'siwe'
import { useAccount, useDisconnect, useNetwork, useSigner, useSignMessage } from 'wagmi'
import { useAxios } from './useAxios'
import useConnectedWallet from './useConnectedWallet'
import usePrevious from './usePrevious'
import useSiweStorage from './useSiweStorage'

const SIGN_IN_MESSAGE = 'Sign in with Ethereum.' // TODO translate
const SMART_WALLET_SIGNATURE = '0x'

// TODO rename to "sign out" convention, also "pending"
export type SiweConnectionStatus =
    | 'idle'
    | 'connected'
    | 'connecting'
    | 'disconnecting'
    | 'error-network'
    | 'error-auth'
    | 'forced-sign-out'
    | 'pending_manual-sign-in'

export interface SiweState {
    isSignedIn: boolean
    siweMessage?: SiweMessage
    address?: string
    status: SiweConnectionStatus
    signOut()
    signIn()
}

const useSiwe = () => {
    const { isConnected: isWalletConnected, address } = useAccount()
    const accountData = useMemo(() => ({ address }), [address])
    const { chain: activeChain } = useNetwork()
    const { disconnect, isLoading: isDisconnectingWallet } = useDisconnect()
    const { data: signer } = useSigner()

    const connectedWalletState = useConnectedWallet()
    const isCurrentChainSupported = validateCurrentChainCompatibility(connectedWalletState.chainId)

    const { signMessageAsync } = useSignMessage()
    const [siweStatus, setSiweStatus] = useState<SiweConnectionStatus>('idle')
    const [, runRequest] = useAxios({}, { autoCancel: false })

    const [storedSiweMessage, storeSiweMessage, eraseSiweMessage] = useSiweStorage()
    const hasLocalSiweMessage = !!storedSiweMessage

    const [{ loading: nonceLoading, error: nonceError, data: nonce }, fetchNonce] = useAxios<Nonce>({
        url: `/auth/nonce`,
        method: 'GET',
    })

    const signIn = useCallback(async () => {
        if (!accountData) return
        setSiweStatus('connecting')
        try {
            const { data } = await fetchNonce()
            if (!data.nonce) {
                console.error('No nonce')
                setSiweStatus('error-network')
                return
            }

            const message = new SiweMessage({
                domain: window.location.host,
                address: accountData.address,
                statement: SIGN_IN_MESSAGE,
                uri: window.location.origin,
                version: '1',
                chainId: activeChain?.id,
                nonce: data.nonce,
            })
            const preparedMessage = message.prepareMessage()
            const signature = await signMessageAsync({
                message: preparedMessage,
            })
            if (signature === SMART_WALLET_SIGNATURE) {
                await waitSmartContractSignature(signer, utils.hashMessage(preparedMessage))
            }
            const { status: statusSignin, data: siweMessage } = await runRequest({
                method: 'POST',
                url: '/auth/sign_in',
                data: { signature, message },
            })

            if (!statusSignin || statusSignin !== 200) {
                setSiweStatus('error-auth')
                return
            }
            setSiweStatus('connected')
            storeSiweMessage(siweMessage)
        } catch (error) {
            console.log('siwe error: ', error)
            const requestCancelled = error.code === 'ERR_CANCELED'
            const didUserCancelSigning = error.code === 4001 || error.code === -32000
            const didAuthFail = error.code === 422 || error.code === 440

            if (requestCancelled) {
                return
            }

            if (didUserCancelSigning) {
                disconnect()
                setSiweStatus('idle')
                return
            }

            if (didAuthFail) {
                setSiweStatus('error-auth')
                return
            }

            setSiweStatus('error-network')
        }
    }, [accountData, setSiweStatus, activeChain, signMessageAsync, disconnect, runRequest, signer, storeSiweMessage])

    const signOut = useCallback(
        async (isForced = false) => {
            if (!hasLocalSiweMessage) {
                if (signer && isWalletConnected && !isDisconnectingWallet) {
                    disconnect()
                    setSiweStatus(isForced ? 'forced-sign-out' : 'idle')
                }
                return
            }

            if (siweStatus === 'disconnecting') return
            setSiweStatus('disconnecting')
            try {
                await runRequest({
                    method: 'POST',
                    url: '/auth/sign_out',
                })
            } catch {
                /* successful destruction of the server-side session cannot be ensured.
                   we ignore the failure and continue to erase sign-in state on the client-side.  */
            }
            eraseSiweMessage() // TODO should be unnecessary once we set siwe message as cookie
            disconnect()
            setSiweStatus(isForced ? 'forced-sign-out' : 'idle')
        },
        [
            hasLocalSiweMessage,
            eraseSiweMessage,
            isDisconnectingWallet,
            disconnect,
            siweStatus,
            setSiweStatus,
            runRequest,
            signer,
            isWalletConnected,
        ]
    )

    const prevIsConnected = usePrevious(isWalletConnected)
    const becameDisconnected = prevIsConnected && isWalletConnected === false

    useEffect(() => {
        if (!signer || !isWalletConnected) return
        if (hasLocalSiweMessage) {
            setSiweStatus('connected')
            return
        }

        if (!hasLocalSiweMessage && siweStatus === 'idle' && isWalletConnected && isCurrentChainSupported) {
            if (isBrowser) {
                signIn()
            } else if (isMobile) {
                setSiweStatus('pending_manual-sign-in')
            }
        }
    }, [hasLocalSiweMessage, signer, isWalletConnected, setSiweStatus, signIn, siweStatus, isCurrentChainSupported])

    useEffect(() => {
        // TODO better also check "is already in the process of signing out"
        const isSignedOut = siweStatus === 'forced-sign-out' || siweStatus === 'idle'
        if (isSignedOut) return
        if (becameDisconnected) signOut()
    }, [becameDisconnected, siweStatus, signOut])

    return {
        status: siweStatus,
        signOut,
        signIn,
        isSignedIn: !!storedSiweMessage,
        siweMessage: storedSiweMessage,
        address: storedSiweMessage ? storedSiweMessage.address : null,
    }
}

export default useSiwe

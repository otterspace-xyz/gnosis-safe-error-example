import Voucher from '@/entities/Voucher'
import isSmartWallet from '@/operations/isSmartWallet'
import { mintBadge, mintBadgeWithSmartWallet } from '@/operations/mintBadge'
import { useState } from 'react'
import useConnectedWallet from './useConnectedWallet'

type OperationStatus =
    | 'idle'
    | 'pending_submission'
    | 'pending_confirmation'
    | 'success'
    | 'error_submission'
    | 'error_confirmation'
    | 'error_already-used'

const useMintBadge = () => {
    const { signer, chainId } = useConnectedWallet()
    const [status, setStatus] = useState<OperationStatus>('idle')
    const doMintBadge = async (voucher: Voucher, badgeSpecTokenUri: string) => {
        if (!signer) return // TODO emit error
        setStatus('pending_submission')
        let submissionResult = null
        try {
            const usingSmartWallet = await isSmartWallet(signer)
            if (usingSmartWallet) {
                await mintBadgeWithSmartWallet(signer, chainId, voucher)
                setStatus('success')
                return {
                    status,
                }
            } else {
                submissionResult = await mintBadge(signer, chainId, voucher)
            }
        } catch (error) {
            if (error?.reason === 'execution reverted: _safeCheckAgreement: already used') {
                setStatus('error_already-used')
                return
            }
            console.error('submission error', error)
            setStatus('error_submission')
            return
        }

        setStatus('pending_confirmation')
        try {
            const { wait } = submissionResult
            await wait()
            setStatus('success')
        } catch (e) {
            console.error('confirmation error', e)
            setStatus('error_confirmation')
            submissionResult = null
            return
        }
    }
    return {
        status,
        mintBadge: doMintBadge,
    }
}

export default useMintBadge

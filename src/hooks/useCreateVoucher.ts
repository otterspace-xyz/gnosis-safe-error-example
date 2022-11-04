import Voucher from '@/entities/Voucher'
import signVoucher from '@/operations/signVoucher'
import { useMemo, useState } from 'react'
import useAxios from './useAxios'
import useConnectedWallet from './useConnectedWallet'

export type OperationStatus = 'idle' | 'success' | 'error-generic' | 'error-no_signature' | 'pending' // TODO redundant; could be centralized

const useCreateVoucher = () => {
    const [{ loading, error, data }, postVoucher] = useAxios<Voucher>({
        method: 'POST',
        url: '/voucher',
    })
    const [isSignatureDenied, setSignatureDenied] = useState(false)

    const { signer, chainId } = useConnectedWallet()

    const createVoucher = async (badgeSpecId: string, badgeSpecUri: string, claimantWalletAddress: string) => {
        if (!signer) return

        setSignatureDenied(false)

        let voucherSignature: string
        try {
            voucherSignature = await signVoucher(signer, claimantWalletAddress, badgeSpecUri, chainId)
        } catch (error) {
            const didUserCancelSigning = error.code === 4001
            if (didUserCancelSigning) {
                setSignatureDenied(true)
                return
            }
            throw error
        }

        const entityInputData: Voucher = {
            badgeSpecId,
            tokenUri: badgeSpecUri,
            claimants: [
                {
                    address: claimantWalletAddress,
                    signature: voucherSignature,
                },
            ],
        }

        const { data } = await postVoucher({
            data: entityInputData,
        })

        return data
    }

    const status: OperationStatus = useMemo(() => {
        if (isSignatureDenied) return 'error-no_signature'
        if (error) return 'error-generic'
        if (loading) return 'pending'
        if (data) return 'success'
        return 'idle'
    }, [isSignatureDenied, error, loading, data])

    return { status, createdVoucher: data, createVoucher }
}

export default useCreateVoucher

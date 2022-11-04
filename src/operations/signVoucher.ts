import { Signer, utils, Contract } from 'ethers'
import EIP1271 from '../config/EIP1271.json'
import { splitSignature } from 'ethers/lib/utils'
import createSignatureDomain from './createSignatureDomain'
import resolveOnContractEvent from './resolveOnContractEvent'
import waitSmartContractSignature from './waitSmartContractSignature'

const TYPES = {
    Agreement: [
        { name: 'active', type: 'address' },
        { name: 'passive', type: 'address' },
        { name: 'tokenURI', type: 'string' },
    ],
}

const signVoucher = async (
    signer: Signer,
    claimantAddress: string,
    tokenUri: string,
    chainId: number
): Promise<string> => {
    const domain = createSignatureDomain(chainId)
    const issuerAddress = await signer.getAddress()

    const value = {
        active: claimantAddress,
        passive: issuerAddress,
        tokenURI: tokenUri,
    }
    const untypedSigner = signer as any // because _signTypedData only exists in Signer subclasses Wallet and JsonRpcSigner
    const signature = await untypedSigner._signTypedData(domain, TYPES, value)

    const usingSmartContract = signature === '0x'
    if (usingSmartContract) {
        await waitSmartContractSignature(signer, utils._TypedDataEncoder.hash(domain, TYPES, value))
        return signature
    } else {
        const { compact } = splitSignature(signature)
        return compact
    }
}

export default signVoucher

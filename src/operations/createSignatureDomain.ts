import validateCurrentChainCompatibility from './validateCurrentChainCompatibility'

const BADGES_CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS']

// TODO  can we check this programmatically to prevent on-chain verification failure when the wrong domain name is used?
const SIGNATURE_DOMAIN_NAME = process.env['NEXT_PUBLIC_SIGNATURE_DOMAIN_NAME']
const SIGNATURE_DOMAIN_VERSION = process.env['NEXT_PUBLIC_SIGNATURE_DOMAIN_VERSION']

const createSignatureDomain = (userChainId: number) => {
    const isChainCompatible = validateCurrentChainCompatibility(userChainId)
    if (!isChainCompatible)
        throw new Error(`Chain ${userChainId} selected, expected one of: ${process.env['NEXT_PUBLIC_CHAIN_IDS']}`)
    return {
        name: SIGNATURE_DOMAIN_NAME,
        version: SIGNATURE_DOMAIN_VERSION,
        chainId: userChainId,
        verifyingContract: BADGES_CONTRACT_ADDRESS,
    }
}

export default createSignatureDomain

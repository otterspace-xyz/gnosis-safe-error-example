import { ethers } from 'ethers'

// for resolution of ENS, we should always fetch from mainnet
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_API_KEY

const resolveENS = async (name: string) => {
    const provider = new ethers.providers.AlchemyProvider('mainnet', ALCHEMY_API_KEY)
    return await provider.resolveName(name)
}

export default resolveENS

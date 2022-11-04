import Raft from '@otterspace-xyz/contracts/out/Raft.sol/Raft.json' assert { type: 'json' }
import { BigNumber, Contract, Signer } from 'ethers'

const RAFT_CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_RAFT_CONTRACT_ADDRESS']

const HAS_NO_TOKEN_ERROR_STRING = 'ERC721Enumerable: owner index out of bounds'

const isMissingRaftTokenError = (error: any) => {
    if (!error) return false
    if (error.reason === HAS_NO_TOKEN_ERROR_STRING) return true

    // // fallback if reason is missing
    // // TODO why is reason not available for production builds?
    return error.message.includes(HAS_NO_TOKEN_ERROR_STRING)
}

const readRaftTokenId = async (signer: Signer) => {
    const contract = new Contract(RAFT_CONTRACT_ADDRESS, Raft.abi, signer)
    const tokenOfOwnerByIndex = contract['tokenOfOwnerByIndex']

    try {
        const result: BigNumber = await tokenOfOwnerByIndex(await signer.getAddress(), 0)
        return result.toString()
    } catch (error) {
        const doesNotOwnToken = isMissingRaftTokenError(error)
        if (doesNotOwnToken) return null
        throw error
    }
}

export default readRaftTokenId

import Badges from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json' assert { type: 'json' }
import { Contract, ethers, Signer } from 'ethers'
import resolveOnContractEvent from './resolveOnContractEvent'

const BADGES_CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS']

// TODO define this type globally or user ethers.js-provided type
export interface ContractCallResult {
    wait(): void
    hash: string
}

const registerBadgeSpecOnChain = async (
    creator: Signer,
    specUri: string,
    raftTokenId: string
): Promise<ContractCallResult> => {
    const contract = new Contract(BADGES_CONTRACT_ADDRESS, Badges.abi, creator)
    const createSpec = contract['createSpec']
    return await createSpec(specUri, raftTokenId)
}

const RAFT_CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_RAFT_CONTRACT_ADDRESS']

const registerBadgeSpecOnChainWithSmartWallet = async (
    creator: Signer,
    specUri: string,
    raftTokenId: string
): Promise<void> => {
    const badgesContract = new Contract(BADGES_CONTRACT_ADDRESS, Badges.abi, creator)
    const walletAddress = await creator.getAddress()
    const eventFilter = badgesContract.filters.SpecCreated(walletAddress, null, raftTokenId, RAFT_CONTRACT_ADDRESS)
    badgesContract.createSpec(specUri, raftTokenId)
    return resolveOnContractEvent(badgesContract, eventFilter)
}

export { registerBadgeSpecOnChain, registerBadgeSpecOnChainWithSmartWallet }

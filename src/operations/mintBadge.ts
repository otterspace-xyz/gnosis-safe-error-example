import Voucher from '@/entities/Voucher'
import Badges from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json' assert { type: 'json' }
import { Contract, Signer } from 'ethers'
import findClaimantInVoucher from './findClaimantAddressInVoucher'
import { ContractCallResult } from './registerBadgeSpecOnChain'
import resolveOnContractEvent from './resolveOnContractEvent'

const BADGES_CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_BADGES_CONTRACT_ADDRESS']

const mintBadge = async (claimant: Signer, chainId: number, voucher: Voucher): Promise<ContractCallResult> => {
    const claimantAddress = await claimant.getAddress()
    const claimantVoucherData = findClaimantInVoucher(voucher, claimantAddress)
    if (!claimantVoucherData) {
        throw new Error(`Claimant not found in voucher for address: ${claimantAddress}`)
    }
    const signature = claimantVoucherData.signature
    const contract = new Contract(BADGES_CONTRACT_ADDRESS, Badges.abi, claimant)
    const doTake = contract['take']
    return await doTake(voucher.issuerAddress, voucher.tokenUri, signature)
}

const BADGES_CONTRACT_ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const mintBadgeWithSmartWallet = async (claimant: Signer, chainId: number, voucher: Voucher): Promise<void> => {
    const claimantAddress = await claimant.getAddress()
    const claimantVoucherData = findClaimantInVoucher(voucher, claimantAddress)

    if (!claimantVoucherData) {
        throw new Error(`Claimant not found in voucher for address: ${claimantAddress}`)
    }

    const signature = claimantVoucherData.signature
    const badgesContract = new Contract(BADGES_CONTRACT_ADDRESS, Badges.abi, claimant)
    const eventFilter = badgesContract.filters.Transfer(BADGES_CONTRACT_ADDRESS_ZERO, claimantAddress, null)
    badgesContract.take(voucher.issuerAddress, voucher.tokenUri, signature)

    return resolveOnContractEvent(badgesContract, eventFilter)
}

export { mintBadge, mintBadgeWithSmartWallet }

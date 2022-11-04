import Voucher, { Claimant } from '@/entities/Voucher'

const findClaimantInVoucher = (voucher: Voucher, claimantAddress: string): Claimant | undefined =>
    voucher.claimants.find(claimant => claimant.address?.toLowerCase() === claimantAddress?.toLowerCase())

export default findClaimantInVoucher

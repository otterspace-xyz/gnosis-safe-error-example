import { utils } from 'ethers'

const isValidAddressOrEnsName = (input: string) => utils.isAddress(input) || utils.isValidName(input)

export default isValidAddressOrEnsName

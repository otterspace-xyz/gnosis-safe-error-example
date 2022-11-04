import { Signer, utils } from 'ethers'

const isSmartWallet = async (signer: Signer) => {
    const provider = signer.provider
    const address = await signer.getAddress()
    const bytecode = await provider.getCode(address)
    const isSmartContract = bytecode && utils.hexStripZeros(bytecode) !== '0x'
    return isSmartContract
}

export default isSmartWallet

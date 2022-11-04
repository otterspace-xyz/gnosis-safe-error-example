import { Contract, Signer } from 'ethers'
import resolveOnContractEvent from './resolveOnContractEvent'
import EIP1271 from '../config/EIP1271.json'

const waitSmartContractSignature = async (signer: Signer, hash: string) => {
    const walletContract = new Contract(await signer.getAddress(), EIP1271.abi, signer)
    const internalHash = await walletContract.getMessageHash(hash)
    const eventFilter = walletContract.filters.SignMsg(internalHash)

    console.log('walletContract', walletContract)
    console.log('internalHash', internalHash)
    console.log('eventFilter', eventFilter)
    return await resolveOnContractEvent(walletContract, eventFilter)
}

export default waitSmartContractSignature

import { Contract, EventFilter } from 'ethers'

const resolveOnContractEvent = (contract: Contract, eventFilter: EventFilter) =>
    new Promise<void>((resolve, reject) => contract.once(eventFilter, resolve).once('error', reject))
export default resolveOnContractEvent

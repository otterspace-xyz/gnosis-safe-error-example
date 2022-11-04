import supportedChains from '@/config/supportedChains'

const validateCurrentChainCompatibility = (chainId: number) => !!supportedChains.find(chain => chain.id === chainId)

export default validateCurrentChainCompatibility

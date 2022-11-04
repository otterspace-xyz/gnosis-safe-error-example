import useDebounce from './useDebounce'

const useForceRevealAnimation = () => useDebounce(true, false, 50)

export default useForceRevealAnimation

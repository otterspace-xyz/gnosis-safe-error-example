import usePrevious from './usePrevious'

const useCompare = <T extends unknown>(value: T, ignoreInitial = true) => {
    const prevValue = usePrevious(value)
    if (prevValue === undefined && ignoreInitial) return false
    const hasChanged = prevValue !== value
    return hasChanged
}

export default useCompare

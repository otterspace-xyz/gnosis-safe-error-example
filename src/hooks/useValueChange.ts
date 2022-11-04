import useCompare from './useCompare'

const useValueChange = <T extends unknown>(value: T) => {
    const valueChanged = useCompare(value)
    return valueChanged ? value : null
}

export default useValueChange

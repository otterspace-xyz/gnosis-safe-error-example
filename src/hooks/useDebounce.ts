import { useEffect, useState } from 'react'

const DEFAULT_DELAY = 500

function useDebounce<T>(value: T, defaultValue: T = undefined, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(defaultValue)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || DEFAULT_DELAY)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default useDebounce

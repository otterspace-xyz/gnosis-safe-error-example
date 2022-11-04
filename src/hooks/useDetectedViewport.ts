import { Breakpoint } from '@/@types/theme'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

const useDetectedViewport = () => {
    const { breakpoints } = useTheme()
    const breakpointEntries = [...Object.entries(breakpoints)].sort(([, widthA], [, widthB]) => {
        return widthB - widthA
    })

    const detectBreakpoint = useCallback(() => {
        const largestViewport = Object.keys(breakpointEntries)[0] as Breakpoint
        let matchingBreakpoint = largestViewport
        breakpointEntries.forEach(([breakpoint, maxWidth]) => {
            const windowMatchesBreakpoint = window.innerWidth <= maxWidth
            if (windowMatchesBreakpoint) matchingBreakpoint = breakpoint as Breakpoint
        })
        return matchingBreakpoint
    }, [breakpointEntries])

    const [detectedBreakpoint, setDetectedBreakpoint] = useState<Breakpoint>(null)

    useEffect(() => {
        setDetectedBreakpoint(detectBreakpoint())
    }, [setDetectedBreakpoint, detectBreakpoint])

    useEffect(() => {
        const onWindowResize = () => setDetectedBreakpoint(detectBreakpoint())
        window.addEventListener('resize', onWindowResize)
        return () => window.removeEventListener('resize', onWindowResize)
    }, [setDetectedBreakpoint, detectBreakpoint])

    const isMobile = detectedBreakpoint === 'mobile'
    const isTablet = detectedBreakpoint === 'tablet'
    const isTabletOrSmaller = isMobile || isTablet
    return {
        isTabletOrSmaller,
        isMobile,
        isTablet,
    }
}

export default useDetectedViewport

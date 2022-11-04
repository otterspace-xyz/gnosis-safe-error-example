import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export interface NavigationApi {
    canGoBack: boolean
    goBack()
}

const useNavigation = (): NavigationApi => {
    const router = useRouter()
    const currentPath = router.asPath
    const [historyPaths, setHistoryPaths] = useState<string[]>([currentPath])

    useEffect(() => {
        const onRouteChange = (path: string) =>
            setHistoryPaths(prevPaths => {
                if (path === prevPaths.at(-1)) return prevPaths
                return [...prevPaths, path]
            })
        const popCurrentAndLastPath = (paths: string[]) => paths.slice(0, -2)

        router.beforePopState(() => {
            setHistoryPaths(popCurrentAndLastPath)
            return true
        })

        router.events.on('routeChangeStart', onRouteChange)
        return () => router.events.off('routeChangeStart', onRouteChange)
    }, [setHistoryPaths])

    const prevPath = historyPaths.at(-2)
    // preventing navigation to root for now; TODO allow navigation once root page exists
    const canGoBack = prevPath !== undefined && prevPath !== '/' && prevPath !== currentPath
    const goBack = () => router.back()

    return { canGoBack, goBack }
}

export default useNavigation

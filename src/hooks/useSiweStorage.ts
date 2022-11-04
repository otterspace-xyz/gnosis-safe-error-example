import { SIWE_COOKIE_NAME } from '@/config/cookies'
import { useCallback, useState } from 'react'
import { SiweMessage } from 'siwe'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

const parseSiweCookieValue = (cookieValue: string) => (cookieValue?.length ? JSON.parse(cookieValue) : null)

const useSiweStorage = (): [SiweMessage, (m: SiweMessage | null) => void, () => void] => {
    const siweStatusFromCookie: SiweMessage | null = cookies.get(SIWE_COOKIE_NAME)
    const [siweStatus, setSiweStatus] = useState<SiweMessage | null>(siweStatusFromCookie)

    cookies.addChangeListener(({ value }) => setSiweStatus(parseSiweCookieValue(value)))

    const storeSiweMessage = useCallback(
        (message: SiweMessage | null) => cookies.set(SIWE_COOKIE_NAME, message ?? '', { path: '/' }),
        []
    )
    const eraseSiweMessage = useCallback(() => cookies.set(SIWE_COOKIE_NAME, '', { path: '/' }), [])

    return [siweStatus, storeSiweMessage, eraseSiweMessage]
}

export default useSiweStorage

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { appWithTranslation } from 'next-i18next'

import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'

const APP_NAME = 'Otterspace'

const { chains, provider, webSocketProvider } = configureChains(
    [chain.mainnet, chain.optimism, chain.goerli],
    [alchemyProvider({ apiKey: 'TODO' })]
)

const { connectors } = getDefaultWallets({ appName: APP_NAME, chains })
const wagmiClient = createClient({ autoConnect: true, provider, webSocketProvider, connectors })

const App = ({ Component, pageProps }) => {
    return (
        <>
            <div>
                <WagmiConfig client={wagmiClient}>
                    <RainbowKitProvider chains={chains}>
                        <Component {...pageProps} />
                    </RainbowKitProvider>
                </WagmiConfig>
            </div>
        </>
    )
}

const AppWithTranslation = appWithTranslation(App)

export default AppWithTranslation

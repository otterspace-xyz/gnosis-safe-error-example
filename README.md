# Gnosis Safe / Otterspace - Minimum Example

## Error description

_TODO_

## Getting started

### Setup

1. Make sure you have [Node.js](https://nodejs.org/en/) (v16+), NPM (v8+) and [yarn](https://yarnpkg.com/) (v1.22+) installed, e.g. via [nvm](https://github.com/nvm-sh/nvm)
2. Clone this repository and `cd` into the working copy
3. Run `yarn install` to install all dependencies
4. Run `cp .env.example .env` and add your Infura project ID and smart contract addresses
5. Run `yarn dev` to start a local development server
6. Open [http://localhost:3000](http://localhost:3000) in your browser to open the web app

### Where to find code

Everything is inside src/pages/index.tsx

### How to reproduce error

1. Tap Connect Wallet Button.
2. Connect Safe app using WalletConnect
3. Tap "sign message via smart wallet"
4. Go back to Safe app to sign the message.
5. Notice the `SignMsg` event is not picked up so flow doesn't finish with `alert('success')`.

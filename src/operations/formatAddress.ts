const FRAGMENT_LENGTH = 4
const MIN_LENGTH = 2 * FRAGMENT_LENGTH + 1 // without prefix: ;

const HEX_PREFIX = '0x'

const formatAddress = (address: string) => {
    if (!address) return

    let formattedAddress = address
    if (address.startsWith(HEX_PREFIX)) {
        formattedAddress = formattedAddress.slice(HEX_PREFIX.length)
    }

    // we tolerate string inputs which are too short to be addresses (<= 40 chars without hex prefix)
    const isLongEnoughToTruncate = formattedAddress.length >= MIN_LENGTH
    if (isLongEnoughToTruncate) {
        const startFragment = formattedAddress.slice(0, FRAGMENT_LENGTH)
        const endFragment = formattedAddress.slice(formattedAddress.length - FRAGMENT_LENGTH)
        formattedAddress = `${startFragment}…${endFragment}`
    }

    formattedAddress = `${HEX_PREFIX}${formattedAddress}`
    return formattedAddress
}

export default formatAddress

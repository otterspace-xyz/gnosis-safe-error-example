import * as blockies from 'blockies-ts'

const generateIdenticonBase64Uri = (address: string) => blockies.create({ seed: address }).toDataURL()

export default generateIdenticonBase64Uri

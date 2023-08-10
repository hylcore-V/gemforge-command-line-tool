import get from 'lodash.get'
// @ts-ignore
import spdxLicenseIds from 'spdx-license-ids' assert { type: "json" }

export interface GemforgeConfig {
  solc: {
    license: string
    version: string
  }
}

export const sanitizeConfig = (config: GemforgeConfig) => {
  if (!get(config, 'solc.version')) {
    throwMissingError('solc.version')
  }

  const license = get(config, 'solc.license')
  if (!license) {
    throwMissingError('solc.license')
  } else {
    if (spdxLicenseIds.indexOf(license) === -1) {
      throw new Error(`Invalid SPDX license: ${license}`)
    }
  }
}

const throwMissingError = (key: string) => {
  throw new Error(`Missing required config key: ${key}`)
}

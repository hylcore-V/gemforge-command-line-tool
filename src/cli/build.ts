import { getContext } from '../shared/context.js'
import { $$, FacetDefinition, ensureGeneratedFolderExists, fileExists, getFacetsAndFunctions, writeFile, writeTemplate } from '../shared/fs.js'
import path from 'node:path'
import { createCommand, logSuccess } from './common.js'
import { error, info, trace } from '../shared/log.js'

export const command = () =>
  createCommand('build', 'Build a project.')
    .action(async args => {
      const ctx = await getContext(args)

      // run prebuild hook
      if (ctx.config.hooks.preBuild) {
        info('Running pre-build hook...')
        await $$`${ctx.config.hooks.preBuild}`
      }

      const generatedSolidityPath = path.resolve(ctx.folder, ctx.config.paths.generated.solidity)
      const generatedSupportPath = path.resolve(ctx.folder, ctx.config.paths.generated.support)

      info('Checking diamond folder lib path...')
      if (!fileExists(path.join(ctx.folder, ctx.config.paths.lib.diamond, 'contracts/Diamond.sol'))) {
        error(`Diamond folder lib path does not contain Diamond contracts: ${ctx.config.paths.lib.diamond}`)
      }

      info('Creating folder for solidity output...')
      await ensureGeneratedFolderExists(generatedSolidityPath)

      info('Generating DiamondProxy.sol...')
      writeTemplate('DiamondProxy.sol', `${generatedSolidityPath}/DiamondProxy.sol`, {
        __SOLC_SPDX__: ctx.config.solc.license,
        __SOLC_VERSION__: ctx.config.solc.version,
        __LIB_DIAMOND_PATH__: ctx.config.paths.lib.diamond,
      })

      const facets = getFacetsAndFunctions(ctx)
      trace(`${facets.length} facets found`)
      facets.forEach(f => {
        trace(`  ${f.contractName} => ${f.functions.length} functions`)
      })
      
      info('Generating IDiamondProxy.sol...')
      writeTemplate('IDiamondProxy.sol', `${generatedSolidityPath}/IDiamondProxy.sol`, {
        __SOLC_SPDX__: ctx.config.solc.license,
        __SOLC_VERSION__: ctx.config.solc.version,
        __LIB_DIAMOND_PATH__: ctx.config.paths.lib.diamond,
        __METHODS__: facets
          .reduce((m, f) => m.concat(f.functions), [] as any[])
          .map(f => `${f.signature};`)
          .join('\n')
      })

      info('Creating folder for support output...')
      await ensureGeneratedFolderExists(generatedSupportPath)

      info('Generating facets.json...')
      const obj = facets.reduce((m, f) => {
        m[f.contractName] = f
        return m
      }, {} as Record<string, FacetDefinition>)
      writeFile(`${generatedSupportPath}/facets.json`, JSON.stringify(obj, null, 2))

      // run build
      info('Running build...')
      await $$`${ctx.config.commands.build}`

      // run post build hook
      if (ctx.config.hooks.postBuild) {
        info('Running post-build hook...')
        await $$`${ctx.config.hooks.postBuild}`
      }

      logSuccess()
    })

  
import { Command } from 'commander'
import { info } from '../shared/log.js'
import { getContext } from '../shared/context.js'
import { writeTemplate } from '../shared/fs.js'

export const command = () =>
  new Command('init')
    .description('Initialize a new project, generating all necessary scaffolding.')
    .option('-f, --folder <folder>', 'folder to create the scaffold in', '.')
    .action(async (args) => {
      const ctx = await getContext(args)

      // write config file
      info('Writing config file...')
      writeTemplate('gemforge.config.cjs', `${ctx.folder}/gemforge.config.cjs`)

      // TODO: setup foundry and forge
    })

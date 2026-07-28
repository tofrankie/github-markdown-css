import { spawn } from 'node:child_process'
import { unwatchFile, watchFile } from 'node:fs'
import { basename, relative } from 'node:path'

import { cwd, projectConfig } from './config/project.js'

const watchTargets = [
  projectConfig.markdownEntryPath,
  'scripts/config/project.js',
  'scripts/config/published-bundles.js',
  'scripts/config/token-sources.js',
  'scripts/config/themes.js',
].map(path => `${cwd}/${path}`)

let activeBuild = null
let rebuildPending = false
let rebuildTimer = null
const rebuildDelayMs = 400

main()

async function main() {
  await runBuild('initial build')

  for (const targetPath of watchTargets) {
    watchFile(targetPath, { interval: 250 }, (currentStat, previousStat) => {
      if (currentStat.mtimeMs === previousStat.mtimeMs) {
        return
      }

      scheduleBuild(`${formatChangedPath(targetPath)} changed`)
    })
  }

  console.log(
    '[dev] Watching src/primer-markdown-extended.scss and scripts/config/*.js for changes'
  )

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      console.log(`\n[dev] Received ${signal}, stopping watcher`)
      for (const targetPath of watchTargets) {
        unwatchFile(targetPath)
      }
      activeBuild?.kill(signal)
      process.exit(0)
    })
  }
}

function scheduleBuild(reason) {
  if (rebuildTimer) {
    clearTimeout(rebuildTimer)
  }

  rebuildTimer = setTimeout(() => {
    rebuildTimer = null
    void runBuild(reason)
  }, rebuildDelayMs)
}

async function runBuild(reason) {
  if (activeBuild) {
    rebuildPending = true
    return
  }

  console.log(`[dev] Rebuilding because ${reason}`)
  activeBuild = spawn(process.execPath, ['./scripts/build-css.js'], {
    cwd,
    stdio: 'inherit',
  })

  const exitCode = await new Promise(resolve => {
    activeBuild.once('exit', code => resolve(code ?? 1))
  })

  activeBuild = null

  if (exitCode === 0) {
    console.log('[dev] Build complete')
  } else {
    console.error(
      `[dev] Build failed with exit code ${exitCode}. If you were editing imports, this can happen while the file is in a transient save state.`
    )
  }

  if (rebuildPending) {
    rebuildPending = false
    await runBuild('queued changes')
  }
}

function formatChangedPath(targetPath) {
  return relative(cwd, targetPath) || basename(targetPath)
}

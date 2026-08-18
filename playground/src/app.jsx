import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import { Editor } from '@bytemd/react'
import gfm from 'bytemd-plugin-gfm'
import alerts from 'bytemd-plugin-github-alerts'
import highlight from 'bytemd-plugin-highlight-github'
import mermaid from 'bytemd-plugin-mermaid'
import { useState } from 'react'
import markdownStr from '../example.md?raw'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-github-alerts/index.css'
import '@tofrankie/github-markdown-css/light.css'
import 'bytemd-plugin-highlight-github/styles/light.css'
import 'katex/dist/katex.css'

const plugins = [
  frontmatter(),
  alerts(), // must be placed before breaks
  breaks(),
  gfm(),
  highlight(),
  gemoji(),
  math(),
  mediumZoom(),
  mermaid({
    theme: 'default',
  }),
]

export default function App() {
  const [value, setValue] = useState(markdownStr)

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}

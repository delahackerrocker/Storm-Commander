import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const sourcePath = resolve(
  projectRoot,
  'public/assets/chess/storm-commander/factions/pirate/queen.png',
)
const outputPath = resolve(projectRoot, 'public/favicon.ico')

function writeUInt16LE(buffer, value, offset) {
  buffer.writeUInt16LE(value, offset)
}

function writeUInt32LE(buffer, value, offset) {
  buffer.writeUInt32LE(value, offset)
}

function createPngBackedIco(pngBytes) {
  const headerSize = 6
  const directoryEntrySize = 16
  const imageOffset = headerSize + directoryEntrySize
  const icoBytes = Buffer.alloc(imageOffset + pngBytes.length)

  writeUInt16LE(icoBytes, 0, 0)
  writeUInt16LE(icoBytes, 1, 2)
  writeUInt16LE(icoBytes, 1, 4)

  icoBytes.writeUInt8(0, 6)
  icoBytes.writeUInt8(0, 7)
  icoBytes.writeUInt8(0, 8)
  icoBytes.writeUInt8(0, 9)
  writeUInt16LE(icoBytes, 1, 10)
  writeUInt16LE(icoBytes, 32, 12)
  writeUInt32LE(icoBytes, pngBytes.length, 14)
  writeUInt32LE(icoBytes, imageOffset, 18)
  pngBytes.copy(icoBytes, imageOffset)

  return icoBytes
}

const pngBytes = await readFile(sourcePath)
await writeFile(outputPath, createPngBackedIco(pngBytes))

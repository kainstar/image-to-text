// import { GIFEncoder } from 'gif.js'
import { getImageType } from './imageCommon'

/**
 * 创建gif图片
 *
 * @param {HTMLDivElement} div
 * @param {string[][]} frames
 * @returns
 */
function gif(div, frames) {
  console.log(frames)
  console.log('To Be Continue...')
}

const TEXT_LINE_HEIGHT = 12
const TEXT_WIDTH = 6
const TEXT_FONT = 'normal normal 400 normal 12px / 12px monospace, monospace'
/**
 * 创建非gif图片(jpg)
 *
 * @param {HTMLDivElement} div
 * @param {string[]} frame
 * @returns
 */
function noGif(div, frame) {
  const canvas = document.createElement('canvas')
  const style = getComputedStyle(div)
  canvas.width = parseInt(style.width)
  canvas.height = parseInt(style.height)
  const ctx = canvas.getContext('2d')
  ctx.font = TEXT_FONT
  for (let i = 0; i < frame.length; i++) {
    for (let j = 0; j < frame[i].length; j++) {
      ctx.fillText(frame[i][j], j * TEXT_WIDTH, i * TEXT_LINE_HEIGHT)
    }
  }
  return canvas.toDataURL('image/jpg')
}

/**
 * 创建新的图片
 *
 * @export
 * @param {HTMLDivElement} div
 * @param {string[][]} frames
 * @param {File} file
 */
export function createImage(div, frames, file) {
  const type = getImageType(file.type)
  if (type === 'GIF') {
    gif(div, frames)
  } else {
    noGif(div, frames[0])
  }
}

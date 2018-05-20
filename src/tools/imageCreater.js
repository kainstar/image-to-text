import GIF from 'gif.js'
import { getImageType } from './imageCommon'
import { FONT_HEIGHT, FONT_WIDTH } from './constant'

// pre标签下的字体
const TEXT_FONT = `normal normal 400 normal ${FONT_HEIGHT}px / ${FONT_HEIGHT}px monospace, monospace`
const COLOR = {
  BLACK: 'rgba(0,0,0,1)',
  WHITE: 'rgba(255,255,255,1)'
}

function getFrameCanvas(div, frame, props) {
  const canvas = document.createElement('canvas')
  canvas.width = div.scrollWidth
  canvas.height = div.scrollHeight
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = props.bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = props.color
  ctx.font = props.font
  for (let i = 0; i < frame.length; i++) {
    for (let j = 0; j < frame[i].length; j++) {
      ctx.fillText(frame[i][j], j * FONT_WIDTH, i * FONT_HEIGHT)
    }
  }
  return canvas
}

const DEFAULT_GIF_PROPS = {
  bgColor: COLOR.WHITE,
  color: COLOR.BLACK,
  font: TEXT_FONT
}
/**
 * 创建gif图片
 *
 * @param {HTMLDivElement} div
 * @param {object} frames
 * @param {object} props
 * @returns
 */
function gif(div, frames, props, cb) {
  props = Object.assign({}, DEFAULT_GIF_PROPS, props)
  const width = div.scrollWidth
  const height = div.scrollHeight
  const gif = new GIF({
    quality: 10,
    workers: 2,
    workerScript: './js/gif.worker.js',
    width, height
  })
  gif.on('finished', function (blob) {
    cb(blob)
  })
  for (let i = 0; i < frames.length; i++) {
    const canvas = getFrameCanvas(div, frames[i].text, props)
    gif.addFrame(canvas, {
      delay: frames[i].delay
    })
  }
  gif.render()
}

const DEFAULT_NOGIF_PROPS = {
  bgColor: COLOR.WHITE,
  color: COLOR.BLACK,
  font: TEXT_FONT
}
/**
 * 创建非gif图片(jpg)
 *
 * @param {HTMLDivElement} div
 * @param {object} frame
 * @param {object} props
 * @returns
 */
function noGif(div, frame, props) {
  props = Object.assign({}, DEFAULT_NOGIF_PROPS, props)
  const canvas = getFrameCanvas(div, frame.text, props)
  return canvas.toDataURL('image/png')
}

/**
 * 创建新的图片
 *
 * @export
 * @param {object} option
 * @param {HTMLDivElement} option.div
 * @param {object} option.frames
 * @param {File} option.file
 */
export function createImage(option) {
  const { div, frames, file, ...props } = option
  const type = getImageType(file.type)

  const link = document.createElement('a')
  let filename = file.name.split('.')
  filename[filename.length - 2] = filename[filename.length - 2] + '-text'
  filename = filename.join('.')
  link.download = filename

  if (type === 'GIF') {
    gif(div, frames, props, function (blob) {
      const url = URL.createObjectURL(blob)
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })
  } else {
    link.href = noGif(div, frames[0], props)
    link.click()
  }
}

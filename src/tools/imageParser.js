import { GifReader } from 'omggif'
import parseDataUri from 'parse-data-uri'
import { getImageType } from './imageCommon'

/**
 * 获取gif图像信息
 *
 * @param {HTMLImageElement} image
 * @returns
 */
function gif(image) {
  const { data } = parseDataUri(image.src)
  const gifReader = new GifReader(data)
  const framesNum = gifReader.numFrames()
  const { width: rawWidth, height: rawHeight } = gifReader
  const GIF_COLOR_DEPTH = 4
  const frames = []
  for(let i = 0; i < framesNum; i++) {
    const framePixels = new Uint8Array(rawWidth * rawHeight * GIF_COLOR_DEPTH)
    gifReader.decodeAndBlitFrameRGBA(i, framePixels)
    frames.push({
      width: rawWidth,
      height: rawHeight,
      data: framePixels
    })
  }
  console.log(frames)
  return frames
}

/**
 * 获取非gif图像信息
 *
 * @param {HTMLImageElement} image
 * @returns
 */
function noGif(image) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const ratio = image.width / image.naturalWidth
  // 将画布内容缩放到与当前图像一致
  ctx.scale(ratio, ratio)
  if (ratio > 1) {
    // 预览图放大，设置canvas宽高与当前图像相同
    canvas.width = image.width
    canvas.height = image.height
  } else {
    // 预览图缩小，设置canvas宽高与原始图像相同
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
  }
  // 绘制当前图像到canvas上
  ctx.drawImage(image, 0, 0, image.width, image.height)
  // 获取图像信息(宽高与当前图像相同)
  const imageData = ctx.getImageData(0, 0, image.width, image.height)
  return [imageData]
}


/**
 * 获取图像信息
 *
 * @export
 * @param {HTMLImageElement} image
 * @param {File} file
 * @returns
 */
export function getImageDatas(image, file) {
  const type = getImageType(file.type)
  switch (type.toUpperCase()) {
    case 'GIF':
      return gif(image)
    case 'PNG':
    case 'JPG':
      return noGif(image)
    default:
      return null
  }
}

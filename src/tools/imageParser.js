import { GifReader } from 'omggif'
import parseDataUri from 'parse-data-uri'
import { getImageType } from './imageCommon'

/**
 * 通过缩放比例压缩帧
 *
 * @param {ImageData} frameData
 * @param {HTMLImageElement} image
 */
function zipFrameData(frameData, image) {
  // 存放一帧原图像到canvas中
  const nartualCanvas = document.createElement('canvas')
  const nartualCtx = nartualCanvas.getContext('2d')
  nartualCanvas.width = image.naturalWidth
  nartualCanvas.height = image.naturalHeight
  nartualCtx.putImageData(frameData, 0, 0)

  // 新建一个canvas，宽高设为目标宽高，并进行画布缩放
  const scaleCanvas = document.createElement('canvas')
  const scaleCtx = scaleCanvas.getContext('2d')
  scaleCanvas.width = image.width
  scaleCanvas.height = image.height
  const ratio = image.width / image.naturalWidth
  scaleCtx.scale(ratio, ratio)
  // 将保存的原图像使用drawImage绘制到新画布上
  scaleCtx.drawImage(nartualCanvas, 0, 0)

  return scaleCtx.getImageData(0, 0, image.width, image.height)
}

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
    const framePixels = new Uint8ClampedArray(rawWidth * rawHeight * GIF_COLOR_DEPTH)
    gifReader.decodeAndBlitFrameRGBA(i, framePixels)
    const frameData = new ImageData(framePixels, rawWidth, rawHeight)
    frames.push(zipFrameData(frameData, image))
  }
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
  canvas.width = image.width
  canvas.height = image.height
  ctx.scale(ratio, ratio)
  // 绘制当前图像到canvas上
  ctx.drawImage(image, 0, 0)
  // 获取图像信息(宽高与当前图像相同)
  document.body.appendChild(canvas)
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

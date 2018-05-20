import { FONT_HEIGHT, FONT_WIDTH, DEFAULT_AVAILABLE_TEXTS } from './constant'

/**
 * 获取rbg颜色的灰度
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns
 */
function rgbToGray(r, g, b) {
  return (299 * r + 587 * g + 114 * b + 500) / 1000
}

export const MAX_COLOR_PIXELS = 255

/**
 * 灰度转字符函数生成器
 *
 * @param {string | Array<string>} texts
 * @returns
 */
export function createGrayToTextFunc(texts = DEFAULT_AVAILABLE_TEXTS) {

  const grayGap = MAX_COLOR_PIXELS / texts.length

  /**
   * 灰度转字符函数
   *
   * @param {number} gray
   * @returns
   */
  function grayToText(gray) {
    let textIndex = (gray / grayGap) >> 0
    if (textIndex >= texts.length) {
      textIndex = texts.length - 1
    }
    return texts[textIndex]
  }

  return grayToText
}

/**
 * 将图像的一帧转成字符数组
 *
 * @param {ImageData} imageData
 * @param {Function} [grayToText=defaultGrayToText]
 * @returns
 */
export function transformImageToText(imageData, grayToText = createGrayToTextFunc()) {
  const dataArr = imageData.data
  const width = imageData.width
  const height = imageData.height
  const lines = []
  for (let h = 0; h < height; h += FONT_HEIGHT) {
    let line = ''
    for (let w = 0; w < width; w += FONT_WIDTH) {
      const i = (w + width * h) * 4
      const gray = rgbToGray(dataArr[i], dataArr[i + 1], dataArr[i + 2])
      line += grayToText(gray)
    }
    lines.push(line)
  }
  return lines
}

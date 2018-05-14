/**
 * 获取rbg颜色的灰度
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns
 */
function rgbToGray(r, g, b) {
  return 0.299 * r + 0.578 * g + 0.114 * b
}

const MAX_COLOR_PIXELS = 255
const DEFAULT_AVAILABLE_TEXTS = '@#&$%O!~;*^+-. '
/**
 * 灰度转字符函数生成器
 *
 * @param {string | Array<string>} texts
 * @returns
 */
function createGrayToTextFunc(texts = DEFAULT_AVAILABLE_TEXTS) {
  /**
   * 灰度转字符函数
   *
   * @param {number} gray
   * @returns
   */
  function grayToText(gray) {
    const charRange = MAX_COLOR_PIXELS / texts.length
    return texts[(gray / charRange) >> 0][0] // 只取第一个字符
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
function transformImageFrame(imageData, grayToText = createGrayToTextFunc()) {
  const dataArr = imageData.data
  const width = imageData.width
  const height = imageData.height
  const lines = []
  for (let h = 0; h < height; h += 12) {
    let line = ''
    for (let w = 0; w < width; w += 6) {
      const i = (w + width * h) * 4
      const gray = rgbToGray(dataArr[i], dataArr[i + 1], dataArr[i + 2])
      line += grayToText(gray)
    }
    lines.push(line)
  }
  return lines
}

module.exports = {
  createGrayToTextFunc,
  transformImageFrame
}

import getPixels from 'get-pixels'

const IMAGE_TYPES_RE = {
  PNG: /image\/png/,
  JPG: /image\/jpe?g/,
  GIF: /image\/gif/
}

// /**
//  * 获取图像信息
//  *
//  * @export
//  * @param {HTMLImageElement} image
//  * @returns
//  */
// function canvasFrameDataGetter (image) {
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')
//   const ratio = image.width / image.naturalWidth
//   // 将画布内容缩放到与当前图像一致
//   ctx.scale(ratio, ratio)
//   if (ratio > 1) {
//     // 预览图放大，设置canvas宽高与当前图像相同
//     canvas.width = image.width
//     canvas.height = image.height
//   } else {
//     // 预览图缩小，设置canvas宽高与原始图像相同
//     canvas.width = image.naturalWidth
//     canvas.height = image.naturalHeight
//   }
//   // 绘制当前图像到canvas上
//   ctx.drawImage(image, 0, 0, image.width, image.height)
//   // 获取图像信息(宽高与当前图像相同)
//   const imageData = ctx.getImageData(0, 0, image.width, image.height)
//   return [imageData]
// }

/**
 * 获取图片类型(png, jpg, gif)
 *
 * @param {string} type
 * @returns
 */
function getImageType(type) {
  for (const typeName in IMAGE_TYPES_RE) {
    if (IMAGE_TYPES_RE.hasOwnProperty(typeName)) {
      const typeRe = IMAGE_TYPES_RE[typeName]
      if (typeRe.test(type)) {
        return typeName
      }
    }
  }
}

/**
 * 获取gif图像信息
 *
 * @param {HTMLImageElement} image
 * @returns {Promise<ImageData[]>}
 */
function gif(image) {
  return new Promise((resolve, reject) => {
    function cb(err, image) {
      if (err) {
        reject(err)
        return
      }
      const [frameNum, width, height] = image.shape
      const frames = []
      const perFramePixelsNum = image.data.length / frameNum
      for (let i = 0; i < frameNum; i++) {
        const startIndex = i * perFramePixelsNum
        frames.push({
          width, height, data: image.data.slice(startIndex, startIndex + perFramePixelsNum)
        })
      }
      resolve(frames)
    }

    getPixels(image.src, cb)
  })
}

/**
 * 获取jpg图像信息
 *
 * @param {HTMLImageElement} image
 * @returns {Promise<ImageData[]>}
 */
function jpg(image) {
  return new Promise((resolve, reject) => {
    function cb (err, image) {
      if (err) {
        reject(err)
        return
      }
      const [width, height] = image.shape
      resolve([{
        width,
        height,
        data: image.data
      }])
    }

    getPixels(image.src, cb)
  })
}

/**
 * 获取png图像信息
 *
 * @param {HTMLImageElement} image
 * @returns {Promise<ImageData[]>}
 */
function png(image) {
  return new Promise((resolve, reject) => {
    function cb (err, image) {
      if (err) {
        reject(err)
        return
      }
      const [width, height] = image.shape
      resolve([{
        width,
        height,
        data: image.data
      }])
    }

    getPixels(image.src, cb)
  })
}

/**
 * 获取图像信息
 *
 * @export
 * @param {HTMLImageElement} image
 * @param {File} file
 * @returns {Promise<ImageData[]>}
 */
export default async function getImageDatas(image, file) {
  const type = getImageType(file.type)
  switch (type.toUpperCase()) {
    case 'PNG':
      return await png(image)
    case 'JPG':
      return await jpg(image)
    case 'GIF':
      return await gif(image)
    default:
      return null
  }
}

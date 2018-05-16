const IMAGE_TYPES_RE = {
  PNG: /image\/png/,
  JPG: /image\/jpe?g/,
  GIF: /image\/gif/,
}

/**
 * 获取图片类型(png, jpg, gif)
 *
 * @param {string} type
 * @returns
 */
export function getImageType(type) {
  for (const typeName in IMAGE_TYPES_RE) {
    if (IMAGE_TYPES_RE.hasOwnProperty(typeName)) {
      const typeRe = IMAGE_TYPES_RE[typeName]
      if (typeRe.test(type)) {
        return typeName
      }
    }
  }
}

export function checkImageType(type) {
  for (const typeName in IMAGE_TYPES_RE) {
    if (IMAGE_TYPES_RE.hasOwnProperty(typeName)) {
      const typeRe = IMAGE_TYPES_RE[typeName]
      if (typeRe.test(type)) {
        return true
      }
    }
  }
  return false
}
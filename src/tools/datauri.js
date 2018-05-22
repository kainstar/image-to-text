/**
 * datauri 转 Uint8Array
 * https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 *
 * @export
 * @param {string} uri
 * @returns
 */
export function decode(uri) {
  // 找到分割 metadata 和 data 的逗号位置
  const commaIndex = uri.indexOf(',')

  const meta = uri.substring(5, commaIndex).split(';')  // 头部信息 metadata
  const type = meta[0] || 'text/plain'

  const data = uri.substring(commaIndex + 1)  // 内容信息
  let byteString
  if (meta.indexOf('base64') >= 0) {
    byteString = atob(data)
  } else {
    byteString = unescape(data)
  }
  const buffer = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i)
  }
  buffer.type = type

  return buffer
}

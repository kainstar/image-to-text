/**
 * datauri 转 ArrayBuffer
 * https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 *
 * @export
 * @param {string} uri
 * @returns
 */
export function decode(uri) {
  // 找到分割 metadata 和 data 的逗号位置
  const firstComma = uri.indexOf(',')
  const meta = uri.substring(5, firstComma).split(';')  // 头部信息 metadata
  const data = uri.substring(firstComma + 1)  // 内容信息

  let byteString
  if (meta.indexOf('base64') >= 0) {
    byteString = atob(data)
  } else {
    byteString = unescape(data)
  }

  const type = meta[0] || 'text/plain'

  const buffer = new Uint8Array(byteString.length)
  buffer.type = type
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i)
  }

  return buffer
}

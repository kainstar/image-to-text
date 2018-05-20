/**
 * Gif解析
 * https://github.com/intellilab/GIFParser
 *
 * @param {ArrayLike<number> | ArrayBufferLike} buffer
 * @returns
 */
export default function gifParser (buffer) {
  const view = new Uint8Array(buffer)
  let offset = 0
  const info = {
    /**
     * 署名和版本号信息
     */
    header: '',
    /**
     * 图像宽度
     */
    w: 0,
    /**
     * 图像高度
     */
    h: 0,
    /**
     * m - 全局颜色列表标志
     */
    m: 0,
    /**
     * cr - 颜色深度(Color ResoluTion)
     */
    cr: 0,
    /**
     * s - 分类标志(Sort Flag)
     */
    s: 0,
    /**
     * pixel - 全局颜色列表大小
     */
    pixel: 0,
    /**
     * 背景颜色: 背景颜色在全局颜色列表中的索引
     */
    bgIndex: 0,
    /**
     * 像素宽高比
     */
    radio: 1,
    /**
     * 全局颜色列表信息
     */
    colorTable: [],
    frames: [],
    comment: ''
  }
  let frame

  /**
   * 读取指定长度字节
   *
   * @param {number} len
   * @returns
   */
  function readByte(len) {
    return view.slice(offset, (offset += len))
  }

  /**
   * 读取gif头部信息 (起始 6 byte)
   * 包括署名 (Signature) 和版本号 (Version)
   */
  function getHeader() {
    const GIF_SIGNATURE_RE = /^GIF8[79]a$/
    info.header = ''
    readByte(6).forEach(byte => {
      info.header += String.fromCharCode(byte)
    })
    if (!info.header.match(GIF_SIGNATURE_RE)) {
      throw new Error('GIF署名错误')
    }
  }

  /**
   * 读取逻辑屏幕标识符 (Logical Screen Descriptor), 总共 7 byte
   */
  function getScreenDesc() {
    const arr = readByte(7)

    info.w = arr[0] + (arr[1] << 8)
    info.h = arr[2] + (arr[3] << 8)
    info.m = 1 & (arr[4] >> 7)
    info.cr = 7 & (arr[4] >> 4)
    info.s = 1 & (arr[4] >> 3)
    info.pixel = 7 & arr[4]
    info.bgIndex = arr[5]
    info.radio = arr[6]

    // 若全局颜色列表标志位置数了，则读取全局颜色列表
    if (info.m) {
      // 2 << pixel === 1 << (pixel + 1) === 2^(pixel+1)
      info.colorTable = readByte((2 << info.pixel) * 3)
    }
  }

  function decode() {
    let bytes = readByte(1)

    switch (bytes[0]) {
      case 0x21: //扩展块, 33
        extension()
        break
      case 0x2c: //图像标识符, 44
        bytes = readByte(9)
        frame.img = {
          x: bytes[0] + (bytes[1] << 8),
          y: bytes[2] + (bytes[3] << 8),
          w: bytes[4] + (bytes[5] << 8),
          h: bytes[6] + (bytes[7] << 8),
          m: 1 & (bytes[8] >> 7),
          /**
           * i - 交织标志(Interlace Flag)
           */
          i: 1 & (bytes[8] >> 6),
          s: 1 & (bytes[8] >> 5),
          r: 3 & (bytes[8] >> 3),
          pixel: 7 & bytes[8],
          colorTable: []
        }

        // 读取局部颜色列表信息
        if (frame.img.m) {
          frame.img.colorTable = readByte((2 << frame.img.pixel) * 3)
        }

        // 读取LZW编码的长度
        frame.img.encodeSize = readByte(1)[0]

        const encodeBuf = []
        while (1) {
          bytes = readByte(1)
          if (bytes[0]) {
            // arr[0] 为当前块的大小（不包括自己这个字节）
            // 读取这个数据块的所有数据，并保存为一个数组
            readByte(bytes[0]).forEach(e => {
              encodeBuf.push(e)
            })
          } else {
            frame.img.encodeBuf = encodeBuf
            decode()
            break
          }
        }
        break
      case 0x3b: // 终结符，59
        console.log('Parse Finish.')
        break
      default:
        // 未知标识符，报错
        throw new Error('Unknow Byte Flag:' + bytes[0])
    }
  }

  function extension() {
    let bytes = readByte(1)
    switch (bytes[0]) {
      case 0xff: // 应用程序扩展, 255
        if (readByte(1)[0] == 11) {
          info.appVersion = ''
          readByte(11).forEach(function(e) {
            info.appVersion += String.fromCharCode(e)
          })
          while(1) {
            bytes = readByte(1)
            if (bytes[0]) {
              readByte(bytes[0])
            } else {
              decode()
              break
            }
          }
        } else {
          throw new Error('解析出错')
        }
        break
      case 0xf9: // 图形控制扩展, 249
        // 块大小固定为 4
        if (readByte(1)[0] === 4) {
          bytes = readByte(4)
          frame = {}
          frame.extension = {
            // 处置方法
            disp: 7 & (bytes[0] >> 2),
            // 用户输入标准
            i: 1 & (bytes[0] >> 1),
            // 透明色标志
            t: 1 & bytes[0],
            // 延迟时间
            delay: (bytes[1] + (bytes[2] << 8)) * 10,
            // 透明色索引
            tranIndex: bytes[3]
          }
          info.frames.push(frame)
          // 标识块终结符
          if (readByte(1)[0] == 0) {
            decode()
          } else {
            throw new Error('解析出错')
          }
        } else {
          throw new Error('解析出错')
        }
        break
      case 0xfe: // 注释块, 254
        bytes = readByte(1)
        if (bytes[0]) {
          readByte(bytes[0]).forEach(function(e) {
            info.comment += String.fromCharCode(e)
          })
          if (readByte(1)[0] == 0) {
            decode()
          }
        }
        break
      default:
        console.log(bytes)
        break
    }
  }

  function calcPixel() {
    let lastImageData
    info.frames.forEach(function(frame) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      // 判断使用局部颜色列表还是全局颜色列表
      const colorTable = frame.img.m ? frame.img.colorTable : info.colorTable

      canvas.width = info.w
      canvas.height = info.h
      let imageData = ctx.getImageData(0, 0, info.w, info.h)

      lzw(frame.img.encodeBuf, frame.img.encodeSize)
        .decode()
        .forEach(function(pixel, i) {
          imageData.data[i * 4] = colorTable[pixel * 3]
          imageData.data[i * 4 + 1] = colorTable[pixel * 3 + 1]
          imageData.data[i * 4 + 2] = colorTable[pixel * 3 + 2]
          imageData.data[i * 4 + 3] = 255
          if (frame.extension.t && pixel == frame.extension.tranIndex) {
            imageData.data[i * 4 + 3] = 0
          }
        })
      ctx.putImageData(imageData, frame.img.x, frame.img.y, 0, 0, frame.img.w, frame.img.h)
      imageData = ctx.getImageData(0, 0, info.w, info.h)

      if (lastImageData) {
        for (let i = 0; i < imageData.data.length; i += 4) {
          // 某个像素不透明度为 0，用上一帧的相应位置的数据填补
          if (imageData.data[i + 3] == 0) {
            imageData.data[i] = lastImageData.data[i]
            imageData.data[i + 1] = lastImageData.data[i + 1]
            imageData.data[i + 2] = lastImageData.data[i + 2]
            imageData.data[i + 3] = lastImageData.data[i + 3]
          }
        }
      }
      if (frame.extension.disp === 1 || frame.extension.disp === 0) {
        lastImageData = imageData
      }
      frame.data = imageData.data
    })
  }

  getHeader()
  getScreenDesc()
  decode()
  calcPixel()

  return {
    width: info.w,
    height: info.h,
    frames: info.frames.map(frame => ({
      /**
       * @type {Uint8ClampedArray}
       */
      data: frame.data,
      /**
       * @type {number}
       */
      delay: frame.extension.delay
    }))
  }
}

/**
 * lzw压缩算法（解压缩）
 *
 * @param {Array} arr
 * @param {number} min
 * @returns
 */
const lzw = function(arr, min) {
  const clearCode = 1 << min
  const eofCode = clearCode + 1
  let size = min + 1
  let dict = []
  let pos = 0

  /**
   * 清除已存储的压缩映射表数据
   */
  function clear() {
    dict = []
    size = min + 1
    for (let i = 0; i < clearCode; i++) {
      dict[i] = [i]
    }
    dict[clearCode] = []
    dict[eofCode] = null
  }

  /**
   * 读取指定位数 bit，并转成10进制数字
   *
   * @param {number} size
   * @returns
   */
  function readBit(size) {
    let code = 0
    for (let i = 0; i < size; i++) {
      // arr[pos / 8] & (1 << (pos % 8))
      if (arr[pos >> 3] & (1 << (pos & 7))) {
        code |= 1 << i
      }
      pos++
    }
    return code
  }

  function decode() {
    const out = []
    let last // 前缀
    let code // 后缀
    while (1) {
      last = code
      code = readBit(size)

      if (code == clearCode) {
        // 第一个读到的 code 必然是 clearCode，会初始化数据
        clear()
        continue
      } else if (code == eofCode) {
        break
      } else if (code < dict.length) {
        // code 映射已知
        if (last !== clearCode) {
          dict.push(dict[last].concat(dict[code][0]))
        }
      } else if (code === dict.length) {
        // code 映射未知
        dict.push(dict[last].concat(dict[last][0]))
      } else {
        throw new Error('LZW解析出错')
      }
      out.push.apply(out, dict[code])
      if (dict.length === 1 << size && size < 12) {
        // 取值位数+1
        size++
      }
    }
    return out
  }

  return {
    decode: decode
  }
}

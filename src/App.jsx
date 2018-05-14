import React from 'react'
import Divide from './component/Divide'
import Button from './component/Button'
import ResultModal from './component/ResultModal'
import TransformSetting from './component/TransformSetting'
import Row from './component/Row'
import ImagePreviewUpload from './component/ImagePreviewUpload'
import imageToText from './tools/imageToText'
import imageParser from './tools/imageParser'

const TRANSFORM_TYPES = {
  BORWSER: 'browser',
  SERVER: 'server',
}

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      transformType: 'browser',
      transformWidth: '',
      transformResult: []
    }
    this.imagePreview = React.createRef()
    this.resultModal = React.createRef()
  }

  setTransformType = (ev) => {
    this.setState({
      transformType: ev.target.value
    })
  }

  setTransformWidth = (ev) => {
    const value = ev.target.value
    // 退格到无数字时，设置为0
    const nextNumber = value.length ? parseInt(value, 10) : 0
    // 值为非数字时，直接返回
    if (isNaN(nextNumber)) {
      return
    }
    this.setState({
      // 设置为字符串，防止出现0开头数字的不正确显示
      transformWidth: nextNumber.toString()
    })
  }

  rescale = () => {
    this.imagePreview.current.scaleImageContainer()
  }

  transform = () => {
    switch (this.state.transformType) {
      case TRANSFORM_TYPES.BORWSER:
        this.transformByCanvas()
        break
      case TRANSFORM_TYPES.SERVER:
        this.transformByServer()
        break
      default:
        break
    }
  }

  /**
   * 用Canvas来实现图片转字符
   *
   * @memberof App
   */
  async transformByCanvas() {
    /**
     * @type {HTMLImageElement}
     */
    const image = this.imagePreview.current.getImage()
    const file = this.imagePreview.current.getFile()
    const imageDatas = await imageParser(image, file)
    const frames = imageDatas.map(imageData => {
      return imageToText.transformImageFrame(imageData)
    })
    this.setState({
      transformResult: frames
    }, () => {
      this.resultModal.current.open()
    })
  }

  /**
   * 由服务器来实现图片转字符
   *
   * @memberof App
   */
  transformByServer() {
    console.log('transformByServer')
  }

  render() {
    return (
      <div>
        <header>
          <h1 className="text-center">图片转字符画工具</h1>
        </header>
        <Divide/>
        <Row className="transform-settings-wrapper">
          <TransformSetting label="转化方式:" labelFor="transform-type">
            <select name="transform-type" id="transform-type" onChange={this.setTransformType} value={this.state.transformType}>
              <option value={TRANSFORM_TYPES.BORWSER}>浏览器</option>
              <option value={TRANSFORM_TYPES.SERVER}>服务器</option>
            </select>
          </TransformSetting>
          <TransformSetting label="目标图片宽度:" labelFor="transform-size">
            <input type="number" id="transform-size" className="transform-size-input" name="transform-size" value={this.state.transformWidth} onChange={this.setTransformWidth} />
          </TransformSetting>
          <Button onClick={this.rescale}>重新缩放</Button>
          <Button onClick={this.transform}>开始转化</Button>
        </Row>
        <Divide/>
        <Row>
          <ImagePreviewUpload previewWidth={parseInt(this.state.transformWidth)} ref={this.imagePreview}></ImagePreviewUpload>
        </Row>
        <ResultModal ref={this.resultModal} result={this.state.transformResult} />
      </div>
    )
  }
}
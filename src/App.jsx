import React from 'react'
import Divide from './component/Divide'
import Button from './component/Button'
import FramesModal from './component/FramesModal'
import TransformSetting from './component/TransformSetting'
import Row from './component/Row'
import ImagePreviewUpload from './component/ImagePreviewUpload'
import { transformImageFrame } from './tools/imageToText'
import { getImageDatas } from './tools/imageParser'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      transformWidth: '',
      transformResult: [],
      rawImage: null,
      file: null
    }
    this.imagePreview = React.createRef()
    this.framesModal = React.createRef()
  }

  setImageAndFile = (rawImage, file) => {
    this.setState({rawImage, file})
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

  /**
   * 图片转字符
   *
   * @memberof App
   */
  transform = () => {
    /**
     * @type {HTMLImageElement}
     */
    const image = this.imagePreview.current.getCurrentImage()
    const file = this.state.file
    const imageDatas = getImageDatas(image, file)
    const frames = imageDatas.map(imageData => {
      return transformImageFrame(imageData)
    })
    this.setState({
      transformResult: frames
    }, () => {
      this.framesModal.current.open()
    })
  }

  render() {
    return (
      <div>
        <header>
          <h1 className="text-center">图片转字符画工具</h1>
        </header>
        <Divide/>
        <Row className="transform-settings-wrapper">
          <TransformSetting label="目标图片宽度:" labelFor="transform-size">
            <input type="number" id="transform-size" className="transform-size-input" name="transform-size" value={this.state.transformWidth} onChange={this.setTransformWidth} />
          </TransformSetting>
          {/* <TransformSetting label="是否着色:" labelFor="transform-color">
            <input type="checkbox" id="transform-color" className="transform-color-checkbox" name="transform-color" value={this.state.transformColor} onChange={this.setTransformColor} />
          </TransformSetting> */}
          <Button onClick={this.rescale}>重新缩放</Button>
          <Button onClick={this.transform}>开始转化</Button>
        </Row>
        <Divide/>
        <Row>
          <ImagePreviewUpload file={this.state.file} image={this.state.rawImage} setImageAndFile={this.setImageAndFile} previewWidth={parseInt(this.state.transformWidth)} ref={this.imagePreview}></ImagePreviewUpload>
        </Row>
        <FramesModal ref={this.framesModal} frames={this.state.transformResult} file={this.state.file} />
      </div>
    )
  }
}
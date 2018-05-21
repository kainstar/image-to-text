import React from 'react'
import Divide from './component/Divide'
import Button from './component/Button'
import FramesModal from './component/FramesModal'
import TransformSetting from './component/TransformSetting'
import Row from './component/Row'
import ImagePreviewUpload from './component/ImagePreviewUpload'
import { transformImageToText, createGrayToTextFunc } from './tools/imageToText'
import { getImageDatas } from './tools/imageParser'
import { DEFAULT_AVAILABLE_TEXTS } from './tools/constant'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      transformWidth: '',
      transformResult: [],
      transformPlaceholder: DEFAULT_AVAILABLE_TEXTS,
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

  setTransformPlaceholder = (ev) => {
    this.setState({
      transformPlaceholder: ev.target.value
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
    if (!this.state.file) {
      return
    }
    this.imagePreview.current.scaleImageContainer()
  }

  /**
   * 图片转字符
   *
   * @memberof App
   */
  transform = () => {
    const file = this.state.file
    if (!file) {
      return
    }
    this.setState({
      isParsing: true
    })
    /**
     * @type {HTMLImageElement}
     */
    const image = this.imagePreview.current.getCurrentImage()
    const framesData = getImageDatas(image, file)
    framesData.forEach(frameData => {
      frameData.text = transformImageToText(frameData.data, createGrayToTextFunc(this.state.transformPlaceholder))
    })
    this.setState({
      transformResult: framesData
    }, () => {
      this.framesModal.current.open()
    })
  }

  render() {
    return (
      <div>
        <header className="clear">
          <h1 className="text-center">图片转字符画工具</h1>
        </header>
        {/* github fork me ribbons */}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/kainstar/image-to-text">
          <img style={{position: 'absolute', top: 0, right: 0, border: 0}} src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"/>
        </a>
        <Divide/>
        <Row className="transform-settings-wrapper">
          <TransformSetting label="目标图片宽度:" labelFor="transform-size">
            <input type="number" id="transform-size" className="transform-size-input" name="transform-size" value={this.state.transformWidth} onChange={this.setTransformWidth} />
          </TransformSetting>
          <Button onClick={this.rescale}>重新缩放</Button>
          <TransformSetting label="转换字符:" labelFor="transform-placeholder">
            <input type="text" id="transform-placeholder" className="transform-placeholder-input" name="transform-placeholder" value={this.state.transformPlaceholder} onChange={this.setTransformPlaceholder} />
          </TransformSetting>
          <Button onClick={this.transform}>开始转化</Button>
        </Row>
        <Divide/>
        <Row>
          <ImagePreviewUpload file={this.state.file} image={this.state.rawImage} setImageAndFile={this.setImageAndFile} previewWidth={parseInt(this.state.transformWidth)} ref={this.imagePreview}></ImagePreviewUpload>
        </Row>
        <FramesModal ref={this.framesModal} frames={this.state.transformResult} file={this.state.file} />
        <p className="helps">转化GIF或较大的图片时，可能会出现一定程度的卡顿，属于正常现象，请耐心等待。</p>
        <p className="copyright text-center">
          <a href="https://github.com/kainstar">Author: kainstar</a>, <a href="https://github.com/kainstar/image-to-text">Project Repository</a>
        </p>
      </div>
    )
  }
}
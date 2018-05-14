import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import '../style/imagePreviewUpload.css'
import { execFunction } from '../tools/execFunction'

export default class ImagePreviewUpload extends React.Component {

  static propTypes = {
    onDragEnter: PropTypes.func,
    onDragOver: PropTypes.func,
    onDragLeave: PropTypes.func,
    onDrop: PropTypes.func,
    previewWidth: PropTypes.number
  }

  constructor() {
    super()
    this.state = {
      /**
       * @type {File}
       */
      file: null,
      /**
       * @type {HTMLImageElement}
       */
      image: null,
      width: 400,
      height: 250
    }

    /**
     * @type {React.RefObject<HTMLInputElement>}
     */
    this.fileUpload = React.createRef()
  }

  getFile() {
    return this.state.file
  }

  getImage() {
    return this.state.image
  }

  dragEnter = (ev) => {
    ev.preventDefault()
    execFunction(this.props.onDragEnter, ev)
  }

  dragOver = (ev) => {
    ev.preventDefault()
    execFunction(this.props.onDragOver, ev)
  }

  dragLeave = (ev) => {
    ev.preventDefault()
    execFunction(this.props.onDragLeave, ev)
  }

  drop = (ev) => {
    ev.preventDefault()
    execFunction(this.props.onDrop, ev)
    const file = ev.dataTransfer.files[0]
    this.previewImage(file)
  }

  /**
   * 预览图片文件
   *
   * @param {File} file
   * @memberof ImagePreviewUpload
   */
  previewImage(file) {
    if (!file.type.match(/image\/.*/)) {
      alert('请选择图片文件')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('load', () => {
      const image = new Image()
      image.addEventListener('load', () => {
        this.scaleImageContainer(image)
        this.setState({
          file: file,
          image: image
        })
      })
      image.src = reader.result
    })
  }

  /**
   * 等比例缩放图片尺寸
   *
   * @param {HTMLImageElement} image
   */
  scaleImageContainer(image) {
    if (!image) {
      // 不传递image时，使用当前的image（App组件调用）
      image = this.state.image
    }
    let targetWidth = this.props.previewWidth
    if (!targetWidth) {
      // 没有指定宽度, 使用容器宽度
      targetWidth = window.innerWidth
      // 容器宽度比图片原宽度大，使用图片原宽度
      if (image.width < targetWidth) {
        targetWidth = image.width
      }
    }
    const ratio = image.width / targetWidth
    const targetHeight = image.height / ratio
    this.setState({
      width: targetWidth,
      height: targetHeight
    })
  }

  openFileInput = () => {
    this.fileUpload.current.click()
  }

  setFile = (ev) => {
    const file = ev.target.files[0]
    if (file) {
      this.previewImage(file)
    }
  }

  render() {
    const uploadBlockClasses = classNames('upload-image-block', this.props.className)
    return (
      <div onDragEnter={this.dragEnter} onDragOver={this.dragOver} onDragLeave={this.dragLeave} onDrop={this.drop} onClick={this.openFileInput} className={uploadBlockClasses} style={{width: this.state.width, height: this.state.height}}>
        <input type="file" style={{display: 'none'}} accept="image/*" ref={this.fileUpload} onChange={this.setFile} />
        <span className="upload-label">上传图片</span>
        {
          this.state.image ? <img src={this.state.image.src} className="preview-image" /> : null
        }
      </div>
    )
  }
}
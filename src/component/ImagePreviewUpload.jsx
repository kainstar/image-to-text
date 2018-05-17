import React from 'react'
import classNames from 'classnames'
import { checkImageType } from '../tools/imageCommon'
import '../style/imagePreviewUpload.css'
/**
 * 图片上传预览组件
 *
 * @export
 * @class ImagePreviewUpload
 * @extends {React.Component}
 */
export default class ImagePreviewUpload extends React.Component {

  /**
   * Creates an instance of ImagePreviewUpload.
   *
   * @param {object} props
   * @param {HTMLImageElement} props.image
   * @param {File} props.file
   * @param {number} props.previewWidth
   * @param {Function} props.setImageAndFile
   *
   * @memberof ImagePreviewUpload
   */
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
      width: 400,
      height: 250
    }

    /**
     * @type {React.RefObject<HTMLInputElement>}
     */
    this.fileUpload = React.createRef()
    this.currentImageRef = React.createRef()
    this.componentRef = React.createRef()
  }

  getCurrentImage() {
    return this.currentImageRef.current
  }

  size = () => {
    return {
      width: this.state.width,
      height: this.state.height
    }
  }

  dragEnter = ev => {
    ev.preventDefault()
    this.setState({
      isDragging: true
    })
  }

  dragOver = ev => {
    ev.preventDefault()
  }

  dragLeave = ev => {
    ev.preventDefault()
    this.setState({
      isDragging: false
    })
  }

  drop = ev => {
    ev.preventDefault()
    this.setState({
      isDragging: false
    })
    const file = ev.dataTransfer.files[0]
    this.previewImage(file)
  }

  openFileInput = () => {
    this.fileUpload.current.click()
  }

  setFile = ev => {
    const file = ev.target.files[0]
    if (file) {
      this.previewImage(file)
    }
  }

  /**
   * 预览图片文件
   *
   * @param {File} file
   * @memberof ImagePreviewUpload
   */
  previewImage(file) {
    if (!checkImageType(file.type)) {
      alert('不支持该格式的文件')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('load', () => {
      const image = new Image()
      image.addEventListener('load', () => {
        this.scaleImageContainer(image)
        this.props.setImageAndFile(image, file)
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
      // 不传递image时，使用当前的image（App组件传递）
      image = this.props.image
    }
    const container = this.componentRef.current.parentElement
    let targetWidth = this.props.previewWidth

    // 缩放宽度检测
    if (!targetWidth) {
      // 没有指定宽度(或为0), 使用容器宽度
      targetWidth = container.clientWidth
      // 容器宽度比图片原宽度大，使用图片原宽度
      if (image.width < targetWidth) {
        targetWidth = image.width
      }
    } else if (targetWidth > container.clientWidth) {
      alert('超过容器大小！请重新输入图片宽度')
      return
    }

    const ratio = image.width / targetWidth
    const targetHeight = image.height / ratio
    this.setState({
      width: targetWidth,
      height: targetHeight
    })
  }

  render() {
    const uploadBlockClasses = classNames('upload-image-block', {active: this.state.isDragging}, this.props.className)
    return (
      <div
        onDragEnter={this.dragEnter}
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDrop={this.drop}
        onClick={this.openFileInput}
        className={uploadBlockClasses}
        style={{ width: this.state.width, height: this.state.height }}
        ref={this.componentRef}
      >
        <input type="file" style={{ display: 'none' }} accept="image/*" ref={this.fileUpload} onChange={this.setFile} />
        <span className="upload-label">上传图片</span>
        {this.props.image ? <img ref={this.currentImageRef} src={this.props.image.src} className="preview-image" /> : null}
      </div>
    )
  }
}

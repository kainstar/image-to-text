import React from 'react'
import classNames from 'classnames'
import Button from './Button'
import Divide from './Divide'
import { createImage } from '../tools/imageCreater'
import '../style/modal.css'

const DEFAULT_PLAY_DELAY = 200

/**
 * 显示图片转字符结果的模态框
 *
 * @export
 * @class FramesModal
 * @extends {React.PureComponent}
 */
export default class FramesModal extends React.PureComponent {

  /**
   * Creates an instance of FramesModal.
   *
   * @param {object} props
   * @param {string[][]} props.frames
   * @param {File} props.file
   *
   * @memberof FramesModal
   */
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      frameIndex: 0,
      playDelay: DEFAULT_PLAY_DELAY
    }
    this.playTimer = null
    this.playDelayInput = React.createRef()
    this.outputRef = React.createRef()
  }

  componentWillUnmount() {
    // 组件销毁时，取消定时器
    this.stop()
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.file) {
      // 更换文件时，将播放帧序号重置回0
      return {
        frameIndex: 0
      }
    }
    return null
  }

  /**
   * 保存图片为文件
   *
   * @memberof FramesModal
   */
  savePic = () => {
    createImage(this.outputRef.current, this.props.frames, this.props.file)
  }

  updatePlayDelay = () => {
    const value = this.playDelayInput.current.value
    // 退格到无数字时，设置为默认间隔
    let nextNumber = value.length ? parseInt(value, 10) : DEFAULT_PLAY_DELAY
    // 值为非数字时，直接返回
    if (isNaN(nextNumber)) {
      nextNumber = DEFAULT_PLAY_DELAY
    }
    this.setState({
      // 设置为字符串，防止出现0开头数字的不正确显示
      playDelay: nextNumber
    })
  }

  play() {
    if (this.props.frames.length <= 1) {
      return
    }
    const nextFrame = () => {
      this.playTimer = setTimeout(() => {
        let nextIndex = this.state.frameIndex + 1
        if (nextIndex === this.props.frames.length) {
          nextIndex = 0
        }
        this.setState({
          frameIndex: nextIndex
        })
        nextFrame()
      }, this.state.playDelay)
    }
    nextFrame()
  }

  stop() {
    if (this.playTimer) {
      clearTimeout(this.playTimer)
    }
  }

  close = ev => {
    ev.preventDefault()
    this.stop()
    this.setState({
      open: false
    })
  }

  open = () => {
    this.play()
    this.setState({
      open: true
    })
  }

  render() {
    const modalClasses = classNames({
      modal: true,
      open: this.state.open
    })
    return (
      <div className={modalClasses}>
        <div className="modal-overlay" />
        <div className="modal-box">
          <div className="modal-header">
            <a href="#" className="modal-close" onClick={this.close}>X</a>
            <h3 className="modal-title">图片转化结果</h3>
          </div>
          <Divide />
          <div className="output-options">
            {this.props.file && this.props.file.type === 'image/gif' ?
              <span>
                <input
                  defaultValue={DEFAULT_PLAY_DELAY}
                  className="play-delay-input"
                  ref={this.playDelayInput}
                  placeholder="播放帧间隔(ms)" />
                <Button className="update-btn" onClick={this.updatePlayDelay}>
                  更新间隔时间(ms)
                </Button>
              </span>: null
            }
            <Button className="save-btn" onClick={this.savePic}>
              保存为图片
            </Button>
          </div>
          <Divide />
          <div className="output-text-wrapper">
            <div id="output-text-block" className="output-text-block" ref={this.outputRef}>
              {this.props.frames.length
                ? this.props.frames[this.state.frameIndex].map((line, index) => <pre key={index}>{line}</pre>)
                : null}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

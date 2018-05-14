import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import Divide from './Divide'
import '../style/modal.css'

const DEFAULT_PLAY_DELAY = 200

export default class ResultModal extends React.PureComponent {

  static propTypes = {
    result: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
  }

  constructor() {
    super()
    this.state = {
      open: false,
      playingIndex: 0,
      playDelay: DEFAULT_PLAY_DELAY
    }
    this.playTimer = null
    this.playDelayInput = React.createRef()
  }

  componentWillUnmount() {
    // 组件销毁时，取消定时器
    this.stop()
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
    if (this.props.result.length <= 1) {
      return
    }
    const nextFrame = () => {
      this.playTimer = setTimeout(() => {
        let nextIndex = this.state.playingIndex + 1
        if (nextIndex === this.props.result.length) {
          nextIndex = 0
        }
        this.setState({
          playingIndex: nextIndex
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

  close = (ev) => {
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
        <div className="modal-overlay"></div>
        <div className="modal-box">
          <div className="modal-header">
            <a href="#" className="modal-close" onClick={this.close}>X</a>
            <h3 className="modal-title">图片转化结果</h3>
            <div className="output-options">
              <input defaultValue={DEFAULT_PLAY_DELAY} className="play-delay-input" ref={this.playDelayInput} placeholder="播放帧间隔(ms)" />
              <Button className="update-btn" onClick={this.updatePlayDelay}>更新间隔时间(ms)</Button>
              <Button className="save-btn" disabled>保存为图片</Button>
            </div>
          </div>
          <Divide/>
          <div className="output-text-wrapper">
            <div className="output-text-block">
              {this.props.result.length ? this.props.result[this.state.playingIndex].map((line, index) => <pre key={index}>{line}</pre>) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

}

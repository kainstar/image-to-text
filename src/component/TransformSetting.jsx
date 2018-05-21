import React from 'react'
import '../style/transformSetting.css'

export default class TransformSetting extends React.PureComponent {

  static defaultProps = {
    label: '',
    labelFor: ''
  }

  render() {
    return (
      <div className="transform-setting">
        {this.props.label ? <label htmlFor={this.props.labelFor}>{this.props.label}</label> : null}
        {this.props.children}
      </div>
    )
  }
}

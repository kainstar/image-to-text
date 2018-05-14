import React from 'react'
import PropTypes from 'prop-types'
import '../style/transformSetting.css'

export default class TransformSetting extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string,
    labelFor: PropTypes.string
  }

  static defaultProps = {
    label: '',
    labelFor: ''
  }

  render() {
    return (
      <div className="transform-setting">
        {
          this.props.label ? <label htmlFor={this.props.labelFor}>{this.props.label}</label> : null
        }
        {this.props.children}
      </div>
    )
  }
}
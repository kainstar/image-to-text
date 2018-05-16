import React from 'react'
import classNames from 'classnames'

/**
 * 按钮组件
 *
 * @export
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 * @returns
 */
export default function Button(props) {
  let { children, className, ...attrs } = props
  className = classNames(className, 'btn')
  return (
    <button {...attrs} type="button" className={className}>
      {children}
    </button>
  )
}

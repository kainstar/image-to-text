import React from 'react'
import classNames from 'classnames'

/**
 * 行组件
 *
 * @export
 * @param {React.HTMLAttributes<HTMLDivElement>} props
 * @returns
 */
export default function Row(props) {
  let { children, className, ...attrs } = props
  className = classNames(className, 'row')
  return (
    <div {...attrs} className={className}>
      {children}
    </div>
  )
}

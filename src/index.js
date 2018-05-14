import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './style/normalize.css'
import './style/index.css'

if (module.hot) {
  module.hot.accept()
}

ReactDOM.render(<App />, document.getElementById('app'))

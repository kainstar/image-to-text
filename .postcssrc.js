// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: {
    // to edit target browsers: use "browserslist" field in package.json
    autoprefixer: {
      browsers: [
        "> 1%",
        "last 40 versions",
        "not ie <= 10"
      ]
    }
  }
}

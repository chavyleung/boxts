module.exports = {
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime']
    }
  },
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '12' }
      }
    ],
    '@babel/preset-typescript'
  ]
}

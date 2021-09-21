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
        targets: { node: 'current' }
      }
    ],
    '@babel/preset-typescript'
  ]
}

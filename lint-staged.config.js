export default {
  '*.{js,ts,json,md,yaml,yml}': ['prettier --write'],
  '*.{js,ts}': ['eslint --fix'],
  '*.{css,scss}': ['stylelint --fix'],
}

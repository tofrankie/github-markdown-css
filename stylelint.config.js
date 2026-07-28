export default {
  ignoreFiles: ['**/dist/**', '**/node_modules/**', '**/artifacts/**'],
  extends: ['@tofrankie/stylelint', '@tofrankie/stylelint/scss'],
  rules: {
    'custom-property-pattern': null,
    'selector-no-vendor-prefix': null,
    'property-no-vendor-prefix': null,
    'declaration-empty-line-before': null,
    'no-invalid-position-at-import-rule': null,
  },
  overrides: [
    {
      files: ['**/*.scss'],
      rules: {
        'scss/comment-no-empty': null,
        'scss/load-partial-extension': null,
        'scss/double-slash-comment-empty-line-before': null,
        'scss/at-mixin-argumentless-call-parentheses': null,
      },
    },
  ],
}

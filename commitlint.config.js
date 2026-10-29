// Conventional-commit tags enforced on every commit message (husky commit-msg).
// Valid: feat:, fix:, docs:, style:, refactor:, perf:, test:, build:, ci:, chore:, revert:
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', 'sentence-case'],
    'body-max-line-length': [1, 'always', 200], // warn only — commit bodies stay readable
  },
}

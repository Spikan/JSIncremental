export default {
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,html,css}': ['prettier --write'],
  '*.{ts}': ['tsc --noEmit'],
};

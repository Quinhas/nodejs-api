export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (commit) => /\[skip ci\]/.test(commit),
    (commit) => /^chore\(release\):/.test(commit),
  ],
};

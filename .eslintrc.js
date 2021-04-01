const eslintConfig = {
    parser: '@typescript-eslint/parser',
    plugins: ['typescript', '@typescript-eslint'],
    extends: [
        'airbnb',
        'plugin:prettier/recommended', // 支持perttier作为rules
        'plugin:import/typescript',
    ],
    env: {
        browser: true,
        node: true,
        jest: true,
    },
    globals: {
        document: true,
    },
    // error warning off
    rules: {
        'no-console': 'off',
        'import/extensions': [
            'error',
            'always',
            {
                ts: 'never',
                tsx: 'never',
                js: 'never',
                jsx: 'never',
            },
        ],
    },
};

module.exports = eslintConfig;

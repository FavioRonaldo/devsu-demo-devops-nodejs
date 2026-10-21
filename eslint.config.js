import js from '@eslint/js'
import jest from 'eslint-plugin-jest'
import globals from 'globals'

export default [
    { ignores: ['coverage/', 'node_modules/'] },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            eqeqeq: ['error', 'smart'],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['test/**/*.js'],
        ...jest.configs['flat/recommended'],
    },
]

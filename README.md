# eslint-plugin-rezor

Forked from [eslint-plugin-react-hooks](https://github.com/react/react/tree/main/packages/eslint-plugin-react-hooks)

Rezor 的 ESLint 插件，用于强制执行 Hooks 规则等。

## 安装

```sh
npm install eslint-plugin-rezor --save-dev
```

## 使用（Flat Config）

```js
// eslint.config.js
import rezor from 'eslint-plugin-rezor'

const config = [
  // ...
  { files: ['**/*.js'], ...rezor.configs.recommended },
  // ...
]

export default config
```

## 自定义配置（Flat Config）

```js
// eslint.config.js
import rezor from 'eslint-plugin-rezor'

const config = [
  // ...
  {
    files: ['**/*.js'],
    plugins: { rezor },
    rules: { 'rezor/rules-of-hooks': 'error', 'rezor/exhaustive-deps': 'warn' },
  },
  // ...
]

export default config
```

## 选项

你可以使用共享的 ESLint settings 来配置自定义的 effect hooks：

```js
{
  settings: {
    rezor: {
      additionalEffectHooks: '(useMyEffect|useCustomEffect)'
    }
  }
}
```

- `additionalEffectHooks`：此正则表达式匹配上的自定义 hooks 将被视作与 `useEffect` 等同。这个配置在插件的所有规则中共享。

## License

[MIT](https://opensource.org/licenses/MIT)

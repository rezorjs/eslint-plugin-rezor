import type { Linter, Rule } from 'eslint'
import ExhaustiveDeps from './rules/exhaustive-deps.js'
import RulesOfHooks from './rules/rules-of-hooks.js'

const rules = {
  'exhaustive-deps': ExhaustiveDeps,
  'rules-of-hooks': RulesOfHooks,
} satisfies Record<string, Rule.RuleModule>

const recommendedRuleConfigs = {
  'rezor/rules-of-hooks': 'error',
  'rezor/exhaustive-deps': 'warn',
} as const satisfies Linter.RulesRecord

type ReactHooksFlatConfig = {
  plugins: { rezor: unknown }
  rules: Linter.RulesRecord
}

const configs = { recommended: {} as ReactHooksFlatConfig }

const plugin = {
  meta: { name: 'eslint-plugin-rezor', version: '0.0.0' },
  rules,
  configs,
}

Object.assign(configs.recommended, {
  plugins: { rezor: plugin },
  rules: recommendedRuleConfigs,
})

export default plugin

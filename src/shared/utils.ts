import type { Rule } from 'eslint'

const SETTINGS_KEY = 'react-hooks'
const SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY = 'additionalEffectHooks'

export function getAdditionalEffectHooksFromSettings(
  settings: Rule.RuleContext['settings'],
): RegExp | undefined {
  const additionalHooks =
    settings[SETTINGS_KEY]?.[SETTINGS_ADDITIONAL_EFFECT_HOOKS_KEY]
  if (additionalHooks != null && typeof additionalHooks === 'string') {
    return new RegExp(additionalHooks)
  }

  return undefined
}

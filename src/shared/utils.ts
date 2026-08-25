export function getAdditionalEffectHooksFromSettings(settings: {
  rezor?: { additionalEffectHooks: string }
}): RegExp | undefined {
  const additionalEffectHooks = settings.rezor?.additionalEffectHooks
  if (
    additionalEffectHooks != null &&
    typeof additionalEffectHooks === 'string'
  ) {
    return new RegExp(additionalEffectHooks)
  }

  return undefined
}

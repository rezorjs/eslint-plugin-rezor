export function getAdditionalEffectHooksFromSettings(settings: {
  rezor?: { additionalEffectHooks: string }
}): RegExp | undefined {
  const additionalHooks = settings.rezor?.additionalEffectHooks
  if (additionalHooks != null && typeof additionalHooks === 'string') {
    return new RegExp(additionalHooks)
  }

  return undefined
}

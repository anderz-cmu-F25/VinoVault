export function moduleHealth(module, message, nextSteps = []) {
  return {
    module,
    status: 'ready-for-feature-work',
    message,
    nextSteps,
  }
}

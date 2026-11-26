export const CHALLENGE_TYPE = Object.freeze({
  UNITY: 'unity',
  LINUX_ENV: 'linux_env',
  CHOICE: 'choice',
  CODE: 'code',
  HYBRID: 'hybrid',
  EMPTY: 'empty',
});

/**
 * Classifies a normalized challenge model into an ordered solving plan.
 *
 * Returns:
 * - `kind`: primary challenge classification (`unity` | `linux_env` | `choice` | `code` | `hybrid` | `empty`)
 * - `steps`: ordered list of strategy keys to execute for this challenge
 */
export function classifyChallenge(model) {
  if (model.unity) {
    return { kind: CHALLENGE_TYPE.UNITY, steps: [CHALLENGE_TYPE.UNITY] };
  }

  const steps = [];
  if (model.questions.length > 0) steps.push(CHALLENGE_TYPE.CHOICE);
  if (model.linuxEnv) steps.push(CHALLENGE_TYPE.LINUX_ENV);
  else if (model.paths.length > 0) steps.push(CHALLENGE_TYPE.CODE);

  const kind = steps.length === 0
    ? CHALLENGE_TYPE.EMPTY
    : steps.length === 1
      ? steps[0]
      : CHALLENGE_TYPE.HYBRID;

  return { kind, steps };
}

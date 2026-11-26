import { MSG_LEVEL } from '../../core/constants.js';
import { CHALLENGE_TYPE } from '../classifier.js';

/**
 * Strategy for Unity 3D simulation challenges.
 *
 * Scoring runs inside the 3D scene and reports back via `postMessage`,
 * so API-only automation skips these stages with an explicit notice.
 */
export const unityStrategy = {
  name: CHALLENGE_TYPE.UNITY,

  /** Logs an informative notice and skips Unity 3D stages gracefully. */
  solve(ctx) {
    const { model, log, onNotice } = ctx;
    onNotice('Unity 3D 仿真题需在 3D 场景内操作，已跳过', MSG_LEVEL.WARN);
    log(`→ ${model.title}　Unity 3D 仿真题：需在 3D 场景内完成，脚本跳过`, MSG_LEVEL.WARN);
    return {
      status: 'skipped',
      title: model.title,
      reason: 'Unity 3D 仿真题（需在 3D 场景内操作）',
    };
  },
};

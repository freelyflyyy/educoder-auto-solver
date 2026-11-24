import { norm, normalizeMatchRule, splitPaths } from '../core/utils.js';

/**
 * Normalizes raw challenge detail payloads into structured domain models.
 */
export const Model = {
  /** Extracts attachment URLs explicitly tagged with an `image/*` MIME type from HTML problem statements. */
  imagesOfHtml(html) {
    const text = String(html || '');
    if (!text.includes('attachments/')) return [];
    const found = new Set();
    for (const hit of text.matchAll(/attachments\/(\d+)(?:\?[^\s"')<>\]]*)?/g)) {
      const declared = /type=([^&\s"')<>\]]+)/i.exec(hit[0])?.[1] || '';
      let type = '';
      try {
        type = decodeURIComponent(declared).toLowerCase();
      } catch {
        continue;
      }
      if (!type.startsWith('image/')) continue;
      found.add(`${location.origin}/api/attachments/${hit[1]}?type=${type}`);
    }
    return [...found];
  },
  /**
   * Maps raw task detail JSON into a normalized challenge descriptor.
   *
   * @param detail Raw response from `GET /tasks/{gameId}.json`.
   * @returns Normalized challenge model.
   */
  read(detail) {
    const challenge = detail.challenge || {};
    const game = detail.game || {};
    const env = (detail.shixun_environments || [])[0] || {};
    const questions = (detail.chooses || [])
      .filter(item => Array.isArray(item.challenge_question) && item.challenge_question.length > 0)
      .map(item => ({
        position: Number(item.position) || 0,
        multi: Number(item.category) === 2,
      }));
    const paths = splitPaths(challenge.path);
    const linuxEnv = env.tab_type === 3
      || /StarUML|VNC|Logisim/i.test(String(detail.mirror_name || ''));
    // Unity 3D 仿真题：判分在 3D 场景内完成，结果由应用 postMessage 回传平台，
    // 容器里没有判分脚本、也没有 test_sets，脚本无从下手。
    const unity = detail.unity_3d === true || detail.unity_3d === 'true';
    const sets = (detail.test_sets || []).map(item => ({ matchRule: item.matchRule || '' }));
    return {
      title: norm(challenge.subject) || '(未命名关卡)',
      position: Number(challenge.position) || 0,
      shixunId: String(detail.myshixun?.identifier || ''),
      gameDbId: Number(game.id) || 0,
      body: String(challenge.task_pass ?? ''),
      passed: game.status === 2,
      questions,
      images: this.imagesOfHtml(challenge.task_pass),
      cases: (detail.test_sets || [])
        .filter(item => !item.is_invisible && item.input !== undefined)
        .map(item => ({ input: item.input, output: item.output })),
      paths,
      linuxEnv,
      unity,
      env,
      rules: {
        matchRule: normalizeMatchRule(sets, challenge),
        ignoreSpace: Number(challenge.ignore_space) === 1,
      },
    };
  },
};

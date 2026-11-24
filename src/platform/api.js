import { TIMING } from '../core/constants.js';
import { abortError, isAbortError, sleep } from '../core/utils.js';
import { Session } from '../core/session.js';
import { Http } from '../core/transport.js';

const UTF8_DECODER = new TextDecoder();

function withQuery(path, params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    parts.push(`${key}=${encodeURIComponent(value ?? '')}`);
  }
  parts.push(`zzud=${encodeURIComponent(Session.zzud())}`);
  return `${path}?${parts.join('&')}`;
}

/**
 * Client wrapper for Educoder REST API endpoints and resilient evaluation triggering.
 */
export const Api = {
  /** Builds the shared `extras` metadata object required by file update and grading requests. */
  gradeExtras(detail, key) {
    return {
      challenge_id: detail.challenge?.id,
      homework_common_id: key.homeworkId,
      currentUserId: detail.user?.user_id,
      exercise_id: '',
      question_id: '',
      subject_id: '',
      competition_entry_id: '',
    };
  },
  gradePayload(detail, key, { env, commitId, tabType }) {
    return {
      sec_key: detail.sec_key || '',
      resubmit: '',
      first: 1,
      content_modified: 0,
      shixun_environment_id: env.shixun_environment_id,
      tab_type: tabType,
      extras: { ...this.gradeExtras(detail, key), commitID: String(commitId || '') },
    };
  },
  courses(signal = null) {
    return Http.get(withQuery('/courses.json', {
      page: 1,
      limit: 100,
      order: 'mine',
      search: '',
    }), signal).then(data => data.courses || []);
  },
  homeworks(courseId, signal = null) {
    return Http.get(withQuery(`/courses/${encodeURIComponent(courseId)}/homework_commons.json`, {
      limit: 100,
      status: 0,
      id: courseId,
      type: 4,
      order: 0,
    }), signal).then(data => data.homeworks || []);
  },
  entryGame(shixunId, homeworkId, signal = null) {
    return Http.get(withQuery(`/shixuns/${encodeURIComponent(shixunId)}/shixun_exec.json`, {
      homework_common_id: homeworkId,
    }), signal).then(data => (data.game_identifier ? String(data.game_identifier) : ''));
  },
  detail(gameId, homeworkId, signal = null) {
    return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}.json`, {
      homework_common_id: homeworkId,
    }), signal);
  },
  choose(gameId, body, signal = null) {
    return Http.post(withQuery(`/tasks/${encodeURIComponent(gameId)}/choose_build.json`), body, signal);
  },
  /** Fetches and decodes a base64-encoded repository file from the task workspace. */
  async readFile(gameId, homeworkId, path, signal = null) {
    const data = await Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/rep_content.json`, {
      path,
      homework_common_id: homeworkId,
      exercise_id: '',
    }), signal);
    const encoded = data?.content?.content ?? '';
    if (!encoded) return '';
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return UTF8_DECODER.decode(bytes);
  },
  /** Retrieves official reference answers (`get_answer_info.json`). */
  answerInfo(gameId, homeworkId, signal = null) {
    return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/get_answer_info.json`, {
      homework_common_id: homeworkId,
      cost_time: 0,
    }), signal);
  },
  /** Retrieves all grading test sets (`check_test_sets.json`), including hidden cases. */
  checkTestSets(gameId, homeworkId, signal = null) {
    return Http.get(withQuery(`/tasks/${encodeURIComponent(gameId)}/check_test_sets.json`, {
      homework_common_id: homeworkId,
    }), signal);
  },
  /** Commits updated file content to the task repository without triggering immediate evaluation. */
  saveFile(shixunId, payload, signal = null) {
    return Http.post(withQuery(`/myshixuns/${encodeURIComponent(shixunId)}/update_file.json`), payload, signal);
  },
  /** Triggers a single asynchronous grading build (`game_build.json`). */
  grade(gameId, payload, signal = null) {
    return Http.post(withQuery(`/tasks/${encodeURIComponent(gameId)}/game_build.json`), payload, signal);
  },
  /**
   * Launch the experiment container and retrieve the SSH/VNC connection information (start.json).
   */
  startEnv(shixunId, { envId, gameDbId, tabType = 3, homeworkId }, signal = null) {
    return Http.get(withQuery(`/myshixuns/${encodeURIComponent(shixunId)}/start.json`, {
      shixun_environment_id: envId,
      game_id: gameDbId,
      tab_type: tabType,
      homework_common_id: homeworkId,
    }), signal);
  },
  /**
   * Triggers an evaluation build with linear backoff on platform queue congestion (`status: -2`).
   *
   * @returns `true` if accepted (or timed out after submission); `false` if rejected.
   */
  async gradeWithRetry(gameId, payload, { log = () => {}, signal = null } = {}) {
    const total = TIMING.gradeAttempts;
    for (let attempt = 1; attempt <= total; attempt += 1) {
      if (signal?.aborted) throw abortError();
      try {
        await this.grade(gameId, payload, signal);
        return true;
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        if (error.code === 'TIMEOUT') {
          log('　评测请求响应超时，转为后台轮询结果…');
          return true;
        }
        if (error.code !== -2) {
          log(`　提交评测请求失败（${error.message}）`);
          return false;
        }
        if (attempt >= total) {
          log(`　平台评测队列持续繁忙（已重试 ${total} 次），本次评测未能入队`);
          return false;
        }
        const waitMs = attempt * TIMING.gradeBackoff;
        log(`　平台评测队列繁忙，${Math.round(waitMs / 1000)} 秒后自动重试（第 ${attempt}/${total} 次）…`);
        await sleep(waitMs, signal);
      }
    }
    return false;
  },
};

// ==UserScript==
// @name         头歌自动答题助手
// @namespace    edu-helper.local
// @version      1.1.0
// @author       如风
// @description  头歌实训纯接口自动化：扫描 → 队列 → 逐关答题，全程不跳页
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABGUUKwAAAF1ElEQVR4Ae1beWwVRRj/bVuOnjyttbVSaa1QNB4ttB6ExiIRPLBpQtJCNHj9Y62CGAxRhECIQv9orFVoSI1KTEzB9DAC1gOkEYjWatE2toVXS6X0ooXeJG1f1/kWd7Pv9R27723f233lSzYzu/N9M9/vtzOzM7MzwA2Z2QxwauDX1vKz5kdgNQKwihmmMttEdpk4DrPV5KOVLs9jjOXVz64WHqjFJL5vH8R3qancuNIyFBHQWsebQsLwBjjkMbC3KM3cF3qMlF7w2Dc6jMKEFI7IcSouCegy8zlMqYgBv9VpTjpLZET0sFqxMeYu7pAz1wIcJR4+zAd2t/D7AziUGg08YSKfyXfCQFgc4bRbA8jg0aU4xBLXOjI00nNWE8qqf0dOdjZnsfXbLgHEGkvItVU28j0joTg6kXvVFsMUAqjNU9WxVfSH+0ke62z7BCsChN4+HM1GbPNKXhB1jKNDSJJ/Haw6QfrU+St4IoiwCZ9zGVtSDaBBTpwJHUxJ1995me9uRWmccLEfseJgSaoBNMLzJvihwRGUfFiOo2U/uwXEXSPCKIxm/89AIoCGt+5m6o7d0OAoPimqRPmXJ9wx98xGhlUigLUFGtt7XTov9Xq9TDlWiQDmBU1svC59lwfQar7k7XIlrHICTN72Qizv43ynw3VRTctQwioRwDoHn0xpCdWpE2fx7qZ96Osd0BKkw7zkWCUCHGp7KeGHI78iK/1N7NpyAHU1TV4qFQjyWkkKChobG8exitPCFZ8Yi5znH0dmTgaCghxO5hTk6lxFNzXA1s0LLR3I33EQzz61DXW/Ndsma3avWwJEhERE3nN7UVn6k/hI09DnTSAyah6S05IwMnwNPV1X0NbSCYtl0gqkZcKCPds+Q2SUCekrU6zSPL3xOQEJC2/H+x+9JuEYH5tAw1kzjh+rQdXXZ0AjRlF2by1BxckChIYFi488DnXXBGbNDkLKg4uxZecGVFQXYMMraxDAFihIBq4O46svfvQYtDwD3REgdy48IhR5b2Wj6OBWhIWHCElVlaflKh7HdU2AiC5t2T3YXZjL5vMcGzZ3oLvzipjkcWgIAgjlsowHkLFqqQD4fGObx8DFDAxDADn89Np0we/L3S7/d4j4XIaGImDBnTECoNGRay6BKVUwFAFzg+cIuMRQKUhneoYigAZLJDdHRjjDpCrNUAR0tl9fPUq6N14VSGfKhiKg+e82xMRGInZ+lDNMqtIMRQAtnKzOfEQVQFfKhiHA3HwRTQ2tyFq/whUmVemGIaC3px8v5GZqWv2JKZ/PBpW+rofT7wNdWothaoDWwMX8pr0G0ErvL9V/obHhAq72DSIkdC7uSIjB/UsWij74NJw2AqjNHvigDEfLT4FWdPQq00LAmZN/Yidb3qYFDL2L5gQc/7YG2zftn7Kup1ciNO0Ezzf9ix2bi1WBDwycvjV/JaRrSkD+9s8xMa6uvUdFS7/plPiruY5mBPxzrh31f5hVO7jkobtV22hpoBkBjfWtqv2ifwIrn0xTbaelgUQA2ztDG4/dloGBEdW27+x5GVoubih1QI5VIoAZe7TQFrcgWmn5gt7b772I5SuSVdloqCxhlRPQ4kkBNE6Pi3dNwrybwlBQshlZ67Sd1an0XcIqEcC2ktaqzMRKnf7oFH66BYsdrNYEh8zB+peeQGnVXix/TNv/e1aOKLiRY73+z4kZdZ3j1wQE4hsF9i5V6uvMoE5xZGgUEaYwNva/Dcmpi0Ak6UEmLXgmZhF3hHyRCJjxGyWFnZPspIUe3tC0+sAwirtEqRypD6AbOmZCG4op7o9C2AijHJsVAbSLmnUQG+UK/hQnbPKd4oTNigB6QPvpmWIxxf1JCJPtWQHCN4UAesiOl7zODMoo7g9CWAiTPSx2CaCzNXTGxh9qAmFwdF6ICJE+g/bYoWcz9ticSAi1Gzpmwk9iF+tFvb+1W3REYUg+kq/ks702b5uNyxogN/DHo7NyfDfiM5GB/wCnrr/cYlI1tAAAAABJRU5ErkJggg==
// @match        https://www.educoder.net/*
// @match        https://educoder.net/*
// @run-at       document-idle
// @noframes
// @grant        GM_xmlhttpRequest
// @connect      data.educoder.net
// @connect      *
// 说明：@connect * 允许用户填写任意 OpenAI 兼容端点，不绑定具体服务商
// ==/UserScript==

/*
 * 分层结构（自下而上，上层只依赖下层）：
 *
 * ① 基础设施
 *    Session     身份：Cookie / 会话 / zzud
 *    Http        签名、超时、读接口重试
 *    Api         平台接口，含统一的评测重试（-2 退避 / TIMEOUT 交给轮询）
 *
 * ② 平台模型
 *    Model       接口数据 → 领域对象（题面、选择题、文件路径、是否图形化）
 *    Route       URL → 课程/作业/关卡标识
 *    Scanner     发现：课程 → 作业 → 关卡链（入口双向遍历）
 *
 * ③ 作答策略（互不依赖，按题型择一）
 *    AnswerSource    代码题：判分脚本字面量 / 参考答案 / 全部用例 → 查表映射
 *    CodeGenerator   代码题：模型生成（默认关闭，作为兜底）
 *    Solver          代码题编排：写文件 → 评测 → 等结果
 *
 * 支持范围：选择题、文本填空（同目录 evaluate.py 可读的那些）、代码题。
 * 图形化环境（StarUML / VNC / Logisim）的关卡直接跳过，不做作图。
 *
 * ④ 编排
 *    Prefs / AiSettings / TemplateCache   配置与缓存
 *    State / Runner                       运行状态与队列调度（唯一状态机）
 *
 * ⑤ 界面
 *    Dock / View / SettingsPanel
 */
(() => {
  'use strict';
  if (document.querySelector('tg-answer-assistant')) return;

  const VERSION = '1.1.0';
  const API = 'https://data.educoder.net/api';
  const AK = 'e9dd5b4322f9f7d83d009de9bfa100c3';
  const SK = '2e3da06ae26ba9f76a5d8d355746f2fe';
  /* 所有等待、重试与退避的参数集中在这里，改节奏只动这一处。 */
  const TIMING = Object.freeze({
    poll: 1500,             // 评分轮询间隔
    passTimeout: 25000,     // 单关等通过上限
    stepGap: 300,           // 关卡之间间隔
    codeGradeTimeout: 120000,   // 代码题等评测上限
    commitSettle: 4000,     // update_file 返回即已提交，留时间给平台传播
    sourceAttempts: 2,      // 参考答案 / 映射表的提交次数
    retryGap: 3000,         // 同一份内容重新写入前的间隔
    gradeBackoff: 6000,     // 平台繁忙（-2）时的退避基数（6/12/18/24 秒）
    gradeAttempts: 8,       // 评测请求总尝试次数：实测有连续 2 分钟繁忙的情况
    httpRetryBackoff: 1500, // 读接口失败重试基数
    httpTimeout: 30000,     // 单次接口超时
    uiTick: 900,            // 界面轮询间隔
  });

  const POLL_MS = TIMING.poll;
  const PASS_TIMEOUT = TIMING.passTimeout;
  const STEP_MS = TIMING.stepGap;
  const CODE_GRADE_TIMEOUT = TIMING.codeGradeTimeout;
  const CODE_COMMIT_SETTLE_MS = TIMING.commitSettle;
  const CODE_SOURCE_ATTEMPTS = TIMING.sourceAttempts;
  const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true">'
    + '<rect class="mark-surface" x="2" y="2" width="60" height="60" rx="15"/>'
    + '<path class="mark-symbol" d="M32.74 12.50 Q32.74 14.67 33.28 15.84 Q33.82 17.00 34.70 17.53 '
    + 'Q35.58 18.06 37.27 18.66 Q42.00 20.29 43.74 23.05 Q45.47 25.80 45.47 29.71 '
    + 'Q45.47 33.26 43.45 36.83 L42.39 36.39 Q43.92 33.82 43.92 30.05 Q43.92 26.68 40.75 24.65 '
    + 'Q37.58 22.62 32.74 22.62 L32.74 43.50 Q32.74 46.58 29.85 49.04 Q26.97 51.50 23.52 51.50 '
    + 'Q21.17 51.50 19.85 50.39 Q18.53 49.27 18.53 47.31 Q18.53 44.23 21.42 41.77 '
    + 'Q24.30 39.31 27.77 39.31 Q29.63 39.31 30.87 40.06 L30.87 12.50 Z"/></svg>';

  const ERROR_TEXT = {
    401: '登录已过期',
    '-102': '签名被拒绝',
    '-2': '平台繁忙',
    '-1': '参数错误',
    404: '关卡不存在',
    403: '没有权限（作业可能已完成或已关闭）',
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  /** 队列被暂停/停止时的中断信号：所有长循环都靠它及时收手。 */
  const abortError = () => {
    const error = new Error('已中断');
    error.code = 'ABORTED';
    return error;
  };
  const raf = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : callback => setTimeout(callback, 16);
  const norm = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  const splitPaths = raw => String(raw ?? '').split(/[；;]/).map(part => part.trim()).filter(Boolean);
  /** 判分比对方式：用例自己带 matchRule 就用它，否则按平台默认的全文比对。 */
  const normalizeMatchRule = (sets, challenge) => {
    const hit = (sets || []).map(item => String(item.matchRule || '').trim()).find(Boolean);
    if (hit) return hit;
    return Number(challenge?.ignore_space) === 1 ? 'full 且忽略空格' : 'full';
  };

  /* ============================================================
   * Crypto —— 签名用 MD5（浏览器没有内置实现）
   * ========================================================== */
  const Crypto = (() => {
    function md5Ascii(text) {
      const bytes = new Uint8Array(Math.ceil((text.length + 9) / 64) * 64);
      for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
      bytes[text.length] = 128;
      const view = new DataView(bytes.buffer);
      view.setUint32(bytes.length - 8, text.length * 8, true);
      const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
      const shifts = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
      for (let offset = 0; offset < bytes.length; offset += 64) {
        let [a, b, c, d] = state;
        for (let i = 0; i < 64; i++) {
          const round = i >>> 4;
          const f = [(b & c) | (~b & d), (d & b) | (~d & c), b ^ c ^ d, c ^ (b | ~d)][round];
          const word = [i, 5 * i + 1, 3 * i + 5, 7 * i][round] % 16;
          const k = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
          const sum = (a + f + k + view.getUint32(offset + word * 4, true)) | 0;
          const shift = shifts[round][i % 4];
          [a, b, c, d] = [d, (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0, b, c];
        }
        [a, b, c, d].forEach((x, i) => { state[i] = (state[i] + x) | 0; });
      }
      return state.flatMap(x => [0, 8, 16, 24].map(n => ((x >>> n) & 255).toString(16).padStart(2, '0'))).join('');
    }
    const b64 = text => btoa(text);
    return {
      sign(method) {
        const time = Date.now();
        const payload = `method=${method}&ak=${AK}&sk=${SK}&time=${time}`;
        return [time, md5Ascii(b64(payload))];
      },
    };
  })();

  /* ============================================================
   * Session —— 身份
   * ========================================================== */
  const Session = {
    read(name) {
      const hit = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
      return hit ? hit.slice(name.length + 1) : '';
    },
    value() { return this.read('_educoder_session'); },
    autologin() { return this.read('autologin_trustie'); },
    cookieHeader() {
      const parts = [];
      if (this.autologin()) parts.push(`autologin_trustie=${this.autologin()}`);
      if (this.value()) parts.push(`_educoder_session=${this.value()}`);
      return parts.join('; ');
    },
    zzud() {
      return new URL(location.href).searchParams.get('zzud')
        || sessionStorage.getItem('tg.zzud')
        || localStorage.getItem('tg.zzud')
        || '';
    },
  };

  /* ============================================================
   * Http —— 单次请求 + 统一错误
   * ========================================================== */
  const Http = {
    /** 读接口带重试：超时和网络错误自动再试，避免个别慢请求直接判失败 */
    async call(method, path, body) {
      const attempts = method === 'GET' ? 2 : 1;
      let last;
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
          return await this.once(method, path, body);
        } catch (error) {
          last = error;
          const retryable = error.code === 'TIMEOUT' || /网络错误/.test(error.message);
          if (!retryable || attempt >= attempts) break;
          await sleep(TIMING.httpRetryBackoff * attempt);
        }
      }
      throw last;
    },
    once(method, path, body) {
      const [time, signature] = Crypto.sign(method);
      const headers = {
        'X-EDU-Type': 'pc',
        'X-EDU-Timestamp': String(time),
        'X-EDU-Signature': signature,
        'Pc-Authorization': Session.value() || 'null',
        'Accept': 'application/json',
      };
      const cookie = Session.cookieHeader();
      if (cookie) headers.Cookie = cookie;
      let data;
      if (body !== undefined) {
        data = JSON.stringify(body);
        headers['Content-Type'] = 'application/json; charset=utf-8';
      }
      const LIMIT = TIMING.httpTimeout;
      return new Promise((resolve, reject) => {
        // GM_xmlhttpRequest 的 timeout 在某些环境不生效，这里再用定时器兜一层
        let settled = false;
        const finish = (fn, value) => { if (settled) return; settled = true; clearTimeout(guard); fn(value); };
        const guard = setTimeout(() => {
          const error = new Error('请求超时（无响应）');
          error.code = 'TIMEOUT';
          finish(reject, error);
        }, LIMIT + 5000);
        const fail = message => { const error = new Error(message); finish(reject, error); };
        GM_xmlhttpRequest({
          method,
          url: API + path,
          headers,
          data,
          timeout: LIMIT,
          responseType: 'json',
          onerror: () => fail('网络错误'),
          ontimeout: () => {
            const error = new Error('请求超时');
            error.code = 'TIMEOUT';
            finish(reject, error);
          },
          onload: res => {
            const payload = res.response;
            if (res.status !== 200 || !payload || typeof payload !== 'object') {
              fail(`请求失败 HTTP ${res.status}`);
              return;
            }
            const code = payload.status;
            if (ERROR_TEXT[code] !== undefined) {
              const error = new Error(ERROR_TEXT[code]);
              error.code = code;
              finish(reject, error);
              return;
            }
            finish(resolve, payload);
          },
        });
      });
    },
    get(path) { return this.call('GET', path); },
    post(path, body) { return this.call('POST', path, body); },
  };

  /**
   * 评测请求的 extras 段与请求体。图形化与代码题用的是同一份结构，
   * 只有 commitID 的来源不同（add_file 走详情里的 commit_id，update_file 用返回值）。
   */
  const gradeExtras = (detail, key) => ({
    challenge_id: detail.challenge?.id,
    homework_common_id: key.homeworkId,
    currentUserId: detail.user?.user_id,
    exercise_id: '', question_id: '', subject_id: '', competition_entry_id: '',
  });
  const gradePayload = (detail, key, { env, commitId, tabType }) => ({
    sec_key: detail.sec_key || '',
    resubmit: '', first: 1, content_modified: 0,
    shixun_environment_id: env.shixun_environment_id,
    tab_type: tabType,
    extras: { ...gradeExtras(detail, key), commitID: String(commitId || '') },
  });

  /* ============================================================
   * Api —— 平台接口
   * ========================================================== */
  const Api = {
    courses() {
      const query = `page=1&limit=100&order=mine&search=&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/courses.json?${query}`).then(data => data.courses || []);
    },
    homeworks(courseId) {
      const query = `limit=100&status=0&id=${encodeURIComponent(courseId)}&type=4&order=0&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/courses/${encodeURIComponent(courseId)}/homework_commons.json?${query}`)
        .then(data => data.homeworks || []);
    },
    entryGame(shixunId, homeworkId) {
      const query = `homework_common_id=${homeworkId}&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/shixuns/${encodeURIComponent(shixunId)}/shixun_exec.json?${query}`)
        .then(data => (data.game_identifier ? String(data.game_identifier) : ''));
    },
    detail(gameId, homeworkId) {
      const query = `homework_common_id=${homeworkId}&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/tasks/${encodeURIComponent(gameId)}.json?${query}`);
    },
    choose(gameId, homeworkId, body) {
      const query = `zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.post(`/tasks/${encodeURIComponent(gameId)}/choose_build.json?${query}`, body);
    },
    /** 读答案文件，平台以 base64 传输。 */
    async readFile(gameId, homeworkId, path) {
      const query = `path=${encodeURIComponent(path)}&homework_common_id=${homeworkId}`
        + `&exercise_id=&zzud=${encodeURIComponent(Session.zzud())}`;
      const data = await Http.get(`/tasks/${encodeURIComponent(gameId)}/rep_content.json?${query}`);
      const encoded = data?.content?.content ?? '';
      if (!encoded) return '';
      const bytes = Uint8Array.from(atob(encoded), ch => ch.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    },
    /** 老师参考答案（get_answer_info.json），学生号也能读。 */
    answerInfo(gameId, homeworkId) {
      const query = `homework_common_id=${homeworkId}&cost_time=0&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/tasks/${encodeURIComponent(gameId)}/get_answer_info.json?${query}`);
    },
    /** 全部用例（含详情页隐藏的），判分用的就是这份。 */
    checkTestSets(gameId, homeworkId) {
      const query = `homework_common_id=${homeworkId}&zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.get(`/tasks/${encodeURIComponent(gameId)}/check_test_sets.json?${query}`);
    },
    /** 写答案文件；evaluate 固定 0，评测单独触发。 */
    saveFile(shixunId, payload) {
      const query = `zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.post(`/myshixuns/${encodeURIComponent(shixunId)}/update_file.json?${query}`, payload);
    },
    /** 触发一次评测。 */
    grade(gameId, payload) {
      const query = `zzud=${encodeURIComponent(Session.zzud())}`;
      return Http.post(`/tasks/${encodeURIComponent(gameId)}/game_build.json?${query}`, payload);
    },
    /**
     * 触发评测，统一处理重试：
     *   -2（平台繁忙）指数退避重试，最多 3 次
     *   TIMEOUT 不再重试，交给调用方轮询结果
     */
    /**
     * 触发评测，统一处理平台繁忙（-2）。
     * 返回值说明这次请求到底有没有被受理：
     *   true  = 受理了（或超时但很可能已排队）→ 调用方应该去轮询结果
     *   false = 一直没受理 → 调用方不要再傻等结果，那一定会白等一轮并误判失败
     */
    async gradeWithRetry(gameId, payload, log = () => {}, cancelled = null) {
      const total = TIMING.gradeAttempts;
      for (let attempt = 1; attempt <= total; attempt += 1) {
        if (cancelled && cancelled()) throw abortError();
        try {
          await this.grade(gameId, payload);
          return true;
        } catch (error) {
          // 请求超时：平台多半已经受理，只是没回包，继续轮询是对的
          if (error.code === 'TIMEOUT') {
            log('　评测请求没回应，改为轮询结果');
            return true;
          }
          if (error.code !== -2) {
            log(`　评测请求失败：${error.message}，改为轮询结果`);
            return false;
          }
          if (attempt >= total) {
            log(`　平台持续繁忙（已试 ${total} 次），这次评测没有受理`);
            return false;
          }
          const waitMs = attempt * TIMING.gradeBackoff;
          log(`　平台繁忙，${Math.round(waitMs / 1000)}s 后重试评测（${attempt}/${total}）`);
          await sleep(waitMs);
        }
      }
      return false;
    },
  };

  /* ============================================================
   * Model —— 接口数据 → 领域对象
   * ========================================================== */
  const Model = {
    /** @returns {{title,body,passed,questions,images,cases,paths,graphics,env,rules}} */
    read(detail) {
      const challenge = detail.challenge || {};
      const game = detail.game || {};
      const env = (detail.shixun_environments || [])[0] || {};
      // 单选/多选不做区分：一律「选出全部正确项」，答案就是字母拼接（"A" / "ACD"）。
      // category 仅用于界面提示，2 = 多选，1 = 单选。
      const questions = (detail.chooses || []).map(item => ({
        position: Number(item.position) || 0,
        title: norm(item.subject),
        multi: Number(item.category) === 2,
        options: (item.challenge_question || [])
          .slice()
          .sort((a, b) => Number(a.position) - Number(b.position))
          .map((option, index) => ({ letter: String.fromCharCode(65 + index), text: norm(option.option_name) })),
      })).filter(item => item.options.length);
      const paths = splitPaths(challenge.path);
      const graphics = env.tab_type === 3
        || /StarUML|VNC|Logisim/i.test(String(detail.mirror_name || ''));
      // 判分规则：用例自带 matchRule，challenge.ignore_space 说明是否忽略空格
      const sets = (detail.test_sets || []).map(item => ({ matchRule: item.matchRule || '' }));
      return {
        title: norm(challenge.subject) || '(未命名关卡)',
        body: String(challenge.task_pass ?? ''),
        passed: game.status === 2,
        questions,
        // 只认附件头里标了 image/* 的；text/plain 之类是数据文件，不能当图片下载
        images: imagesOfHtml(challenge.task_pass),
        cases: (detail.test_sets || [])
          .filter(item => !item.is_invisible && item.input !== undefined)
          .map(item => ({ input: item.input, output: item.output })),
        paths,
        graphics,
        env,
        rules: {
          // full = 全文完全相等；其余取值原样透出，交给提示词说明
          matchRule: normalizeMatchRule(sets, challenge),
          // challenge.ignore_space = 1 时比对会去掉空格
          ignoreSpace: Number(challenge.ignore_space) === 1,
        },
      };
    },
  };

  /* ============================================================
   * 路由 —— 从 URL 取上下文
   * ========================================================== */
  const Route = {
    path() { return location.pathname.replace(/\/$/, ''); },
    /** 班级作业列表页 /classrooms/{课程标识}/... */
    courseId() {
      const hit = location.pathname.match(/^\/classrooms\/([^/]+)/);
      return hit ? hit[1] : '';
    },
    isTask(path = this.path()) { return /^\/tasks\/[^/]+\/[^/]+\/[^/]+\/?$/.test(path); },
    /** 作业详情页 /classrooms/{课程}/shixun_homework/{作业}/... → 只处理这一份。 */
    homeworkId() {
      const hit = location.pathname.match(/\/shixun_homework\/(\d+)/);
      return hit ? Number(hit[1]) : 0;
    },
    taskUrl(courseId, homeworkId, gameId) {
      return `${location.origin}/tasks/${encodeURIComponent(courseId)}/${homeworkId}/${encodeURIComponent(gameId)}`;
    },
    keyOf(url = location.href) {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      if (parts[0] !== 'tasks' || parts.length < 3) throw new Error('不是关卡地址');
      const homeworkId = new URL(url).searchParams.get('homework_common_id') || parts[2];
      return { gameId: parts[3] || parts[parts.length - 1], homeworkId, courseId: parts[1] };
    },
  };

  /* ============================================================
   * Scanner —— 发现课程 / 作业 / 关卡链
   * ========================================================== */
  const Scanner = {
    /** 还有关卡没做完的作业。 */
    open(works) {
      return works.filter(work => {
        const total = Number(work.challenge_count) || 0;
        const done = Number(work.finished_challenge_count) || 0;
        return total > 0 && done < total;
      });
    },
    /** 入口关卡是链尾，沿 prev_game 回溯到链头。 */
    async chain(work, courseId) {
      const entry = await Api.entryGame(work.shixun_identifier, work.homework_id);
      if (!entry) return [];
      const read = async gameId => {
        // 读不到就当作这一关不存在，由上层统计跳过数
        try { return await Api.detail(gameId, work.homework_id); } catch { return null; }
      };
      const seed = String(entry);
      const entryDetail = await read(seed);
      if (!entryDetail) return [];

      const seen = new Set();
      const ordered = [];   // 从链头到链尾
      const note = (gameId, detail) => ({ gameId, passed: detail?.game?.status === 2 });

      // ① 从入口沿 prev_game 回溯到链头（入口本身已读过，不重复请求）
      let cursor = seed;
      while (cursor && cursor !== 'null' && !seen.has(cursor)) {
        seen.add(cursor);
        const detail = cursor === seed ? entryDetail : await read(cursor);
        if (!detail) break;
        ordered.unshift(note(cursor, detail));
        cursor = detail?.prev_game ? String(detail.prev_game) : '';
      }

      // ② 从入口沿 next_game 前进到链尾（入口之后尚未解锁的关卡也要算进来）
      cursor = entryDetail?.next_game ? String(entryDetail.next_game) : '';
      while (cursor && cursor !== 'null' && !seen.has(cursor)) {
        seen.add(cursor);
        const detail = await read(cursor);
        if (!detail) break;
        ordered.push(note(cursor, detail));
        cursor = detail?.next_game ? String(detail.next_game) : '';
      }

      // 队列只放还没通过的关卡，和扫描时显示的「未完成数」保持一致
      return ordered
        .filter(item => !item.passed)
        .map(item => ({
          gameId: item.gameId,
          homeworkId: work.homework_id,
          courseId,
          url: Route.taskUrl(courseId, work.homework_id, item.gameId),
        }));
    },
    /** 当前页面能覆盖到的作业：班级页 → 本课程；关卡页 → 该作业。 */
    async homeworkList(courseId) {
      // 停在某份作业的详情页时，只处理这一份，且不受「是否已完成」限制。
      const pinned = Route.homeworkId();
      if (pinned) {
        const works = await Api.homeworks(courseId || Route.keyOf().courseId);
        return works.filter(work => Number(work.homework_id) === pinned);
      }
      if (courseId) return this.open(await Api.homeworks(courseId));
      if (!Route.isTask()) throw new Error('请先打开班级作业列表页、作业详情页或任意关卡');
      const key = Route.keyOf();
      const works = await Api.homeworks(key.courseId);
      const one = works.find(work => Number(work.homework_id) === Number(key.homeworkId));
      return one ? [one] : [];
    },
    async courseName(courseId) {
      if (!courseId) return '';
      try {
        const courses = await Api.courses();
        const hit = courses.find(course => course.identifier === courseId);
        return hit ? norm(hit.name) : courseId;
      } catch {
        // 课程名只用于界面展示，取不到就退回标识
        return courseId;
      }
    },
  };

  /* ============================================================
   * Settings —— 默认值、旧配置读取与保存
   * ========================================================== */
  function readStoredSettings(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch {
      // 本地配置损坏时按「没有任何设置」处理，不要因为读配置失败就中断
      return {};
    }
  }

  function numericSetting(value, min, max, fallback, integer = false) {
    if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max && (!integer || Number.isInteger(number))
      ? number : fallback;
  }

  const Prefs = {
    KEY: 'tg.prefs.v6',
    defaults: Object.freeze({
      delay: 1, auto: false, codeRetries: 2, logRows: 6, titleProgress: true,
      // 平台没给参考答案/用例时，是否允许退到模型生成
      aiFallback: false,
    }),
    data: null,
    normalize(values) {
      const defaults = this.defaults;
      const delay = Number(values.delay);
      const logRows = Number(values.logRows);
      return {
        delay: [1, 3, 5, 10].includes(delay) ? delay : defaults.delay,
        auto: values.auto === true,
        codeRetries: numericSetting(values.codeRetries, 0, 4, defaults.codeRetries, true),
        logRows: [6, 12, 24, 40].includes(logRows) ? logRows : defaults.logRows,
        titleProgress: values.titleProgress !== false,
        aiFallback: values.aiFallback === true,
      };
    },
    load() {
      this.data = this.normalize(readStoredSettings(this.KEY));
    },
    save(values) {
      const data = this.normalize(values);
      localStorage.setItem(this.KEY, JSON.stringify(data));
      this.data = data;
    },
  };

  /** 从题干里挑出真正的图片附件（type=image/*），忽略 text/plain 等数据文件。 */
  function imagesOfHtml(html) {
    const text = String(html || '');
    if (!text.includes('attachments/')) return [];
    const found = new Set();
    for (const hit of text.matchAll(/attachments\/(\d+)(?:\?[^\s"')<>\]]*)?/g)) {
      const declared = /type=([^&\s"')<>\]]+)/i.exec(hit[0])?.[1] || '';
      const type = decodeURIComponent(declared).toLowerCase();
      // 没有类型声明时不下载，避免把数据文件当图片
      if (!type.startsWith('image/')) continue;
      found.add(`${location.origin}/api/attachments/${hit[1]}?type=${type}`);
    }
    return [...found];
  }

  const AiSettings = {
    KEY: 'tg.ai.v7',
    defaults: Object.freeze({
      base: 'https://api.deepseek.com/v1', key: '', model: 'deepseek-v4-pro',
      maxTokens: 16384, timeout: 150, sampling: 'temperature', temperature: 0.15, topP: 1,
      frequencyPenalty: 0, presencePenalty: 0,
      thinking: 'auto', thinkLevel: 'high', jsonMode: 'auto', extraBody: '', extraPrompt: '',
      vision: false,
    }),
    normalize(values) {
      const defaults = this.defaults;
      const thinking = values.thinking === true ? 'on' : values.thinking === false ? 'off' : values.thinking;
      const topP = numericSetting(values.topP, 0.01, 1, defaults.topP);
      const string = key => typeof values[key] === 'string' ? values[key].trim() : defaults[key];
      return {
        base: string('base'),
        key: string('key'),
        model: string('model'),
        maxTokens: numericSetting(values.maxTokens, 1, 393216, defaults.maxTokens, true),
        timeout: numericSetting(values.timeout, 15, 600, defaults.timeout, true),
        sampling: ['temperature', 'topP'].includes(values.sampling) ? values.sampling : topP < 1 ? 'topP' : defaults.sampling,
        temperature: numericSetting(values.temperature, 0, 2, defaults.temperature),
        topP,
        frequencyPenalty: numericSetting(values.frequencyPenalty, -2, 2, defaults.frequencyPenalty),
        presencePenalty: numericSetting(values.presencePenalty, -2, 2, defaults.presencePenalty),
        thinking: ['auto', 'on', 'off'].includes(thinking) ? thinking : defaults.thinking,
        thinkLevel: ['low', 'medium', 'high'].includes(values.thinkLevel) ? values.thinkLevel : defaults.thinkLevel,
        jsonMode: ['auto', 'on', 'off'].includes(values.jsonMode) ? values.jsonMode : defaults.jsonMode,
        extraBody: string('extraBody'),
        extraPrompt: string('extraPrompt'),
        vision: values.vision === true,
      };
    },
    load() {
      return this.normalize(readStoredSettings(this.KEY));
    },
    save(values) {
      const cfg = this.normalize(values);
      if (cfg.base) this.endpoint(cfg.base);
      this.extraParams(cfg.extraBody);
      localStorage.setItem(this.KEY, JSON.stringify(cfg));
      return cfg;
    },
    ready(cfg = this.load()) {
      return Boolean(cfg.base && cfg.key && cfg.model);
    },
    modelOptions(cfg, forCode = true) {
      let deepSeek = false;
      try { deepSeek = new URL(cfg.base).hostname === 'api.deepseek.com'; } catch { /* 地址输入期间按兼容接口展示 */ }
      const flash = deepSeek && /^deepseek-(?:flash|v4-flash(?:-vision-exp)?)$/.test(cfg.model);
      const nativeThinking = flash || (deepSeek && cfg.model === 'deepseek-v4-pro');
      const thinking = nativeThinking ? forCode && cfg.thinking !== 'off' : cfg.thinking === 'on';
      const chooseSampler = !thinking && !flash;
      return {
        deepSeek, flash, nativeThinking, thinking, chooseSampler,
        sampler: chooseSampler ? cfg.sampling : flash && thinking ? 'topP' : null,
        penalties: !deepSeek && !thinking,
      };
    },
    endpoint(base) {
      let url;
      try { url = new URL(base); } catch { /* 统一报告格式错误 */ }
      if (!url || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error('请填写有效的 HTTP 或 HTTPS 接口基础地址');
      }
      const path = url.pathname.replace(/\/+$/, '');
      url.pathname = path.endsWith('/chat/completions') ? path : path + '/chat/completions';
      return url;
    },
    extraParams(value) {
      if (!value) return {};
      let data;
      try { data = JSON.parse(value); } catch { /* 统一报告格式错误 */ }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('额外请求体必须是有效的 JSON 对象');
      const managed = ['model', 'messages', 'stream', 'stream_options', 'max_tokens', 'max_completion_tokens', 'response_format', 'n'];
      const conflict = managed.find(field => Object.hasOwn(data, field));
      if (conflict) throw new Error(`额外请求体中的 ${conflict} 由脚本管理`);
      return data;
    },
  };

  /* ============================================================
   * 模型请求与代码生成
   * ========================================================== */
  class AiRequestError extends Error {
    constructor(message, retryable = true) {
      super(message);
      this.retryable = retryable;
    }
  }

  class AiConnectionError extends AiRequestError {}

  /* 原始模板缓存：多次重试时始终以平台初始模板为基础，避免在错误代码上反复修改 */
  const TemplateCache = {
    KEY: 'tg.tpl.v1',
    limit: 300,
    all() {
      // 缓存损坏当作空缓存，下一次写入会重建
      try { return JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}; } catch { return {}; }
    },
    get(gameId, path) {
      const hit = this.all()[`${gameId}:${path}`];
      return typeof hit === 'string' ? hit : null;
    },
    set(gameId, path, content) {
      const all = this.all();
      all[`${gameId}:${path}`] = content;
      const keys = Object.keys(all);
      if (keys.length > this.limit) {
        for (const key of keys.slice(0, keys.length - this.limit)) delete all[key];
      }
      try { localStorage.setItem(this.KEY, JSON.stringify(all)); } catch { /* 空间不足忽略 */ }
    },
    clear() {
      try { localStorage.removeItem(this.KEY); } catch { /* 忽略 */ }
    },
  };

  const AiClient = {
    async post(url, headers, body, timeoutMs) {
      if (this.gmUrl === url) return this.viaGM(url, headers, body, timeoutMs);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let receivedHeaders = false;
      try {
        const response = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
        receivedHeaders = true;
        return {
          status: response.status,
          text: await response.text(),
          retryAfter: response.headers.get('Retry-After'),
        };
      } catch (error) {
        if (controller.signal.aborted) throw new AiRequestError('模型请求超时');
        // 响应已开始时重新发送 POST 可能造成重复推理。
        if (receivedHeaders || error?.name !== 'TypeError') {
          throw new AiRequestError('模型连接中断');
        }
        if (typeof GM_xmlhttpRequest !== 'function') throw new AiConnectionError('模型连接失败');
      } finally {
        clearTimeout(timer);
      }
      const result = await this.viaGM(url, headers, body, timeoutMs);
      this.gmUrl = url;
      return result;
    },
    viaGM(url, headers, body, timeoutMs) {
      return new Promise((resolve, reject) => {
        let request;
        const finish = (settle, value) => {
          clearTimeout(guard);
          settle(value);
        };
        const fail = message => finish(reject, new AiRequestError(message));
        const guard = setTimeout(() => {
          fail('模型请求超时');
          request?.abort?.();
        }, timeoutMs);
        try {
          request = GM_xmlhttpRequest({
            method: 'POST',
            url,
            headers,
            data: body,
            timeout: timeoutMs,
            onerror: () => fail('模型连接失败'),
            ontimeout: () => fail('模型请求超时'),
            onabort: () => fail('模型请求已中断'),
            onload: response => finish(resolve, {
              status: response.status,
              text: response.responseText || '',
              retryAfter: response.responseHeaders?.match(/^retry-after:\s*([^\r\n]+)/im)?.[1],
            }),
          });
        } catch {
          fail('模型连接失败');
        }
      });
    },
    retryDelay(status, retryAfter) {
      if (![429, 500, 502, 503, 504].includes(status)) return null;
      if (!retryAfter) return 800 + Math.random() * 400;
      const seconds = Number(retryAfter);
      const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
      return Number.isFinite(delay) ? Math.max(0, delay) : 1000;
    },
    /** 带登录态抓取题干图片，转成 data URL 给视觉模型用。 */
    /** 带登录态抓取题干图片，转成 data URL 交给视觉模型。 */
    async loadImages(urls) {
      const maxBytes = 3 * 1024 * 1024;
      const images = [];
      for (const raw of urls.slice(0, 4)) {
        if (typeof raw !== 'string' || !raw) continue;
        let url;
        // 题干里混进来的相对路径/坏链接直接跳过
        try { url = new URL(raw, location.origin); } catch { continue; }
        if (!['http:', 'https:'].includes(url.protocol)) continue;
        const dataUrl = await this.fetchImage(url.href, maxBytes);
        if (dataUrl) images.push(dataUrl);
      }
      return images;
    },
    /**
     * 下载单张图片并转成 data URL。
     * 附件会 302 跳到阿里云 OSS，而 OSS 不返回 CORS 头，
     * 浏览器 fetch 会被拦掉，所以优先走 GM 请求。
     */
    fetchImage(url, maxBytes) {
      const toDataUrl = blob => new Promise(resolve => {
        if (!blob || !String(blob.type).startsWith('image/') || blob.size > maxBytes) {
          resolve('');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });

      if (typeof GM_xmlhttpRequest === 'function') {
        return new Promise(resolve => {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 20000,
            responseType: 'arraybuffer',
            onload: async res => {
              if (res.status !== 200 || !res.response) { resolve(''); return; }
              const match = /content-type:\s*([^\r\n;]+)/i.exec(String(res.responseHeaders || ''));
              const type = (match?.[1] || 'image/png').trim();
              resolve(await toDataUrl(new Blob([res.response], { type })));
            },
            onerror: () => resolve(''),
            ontimeout: () => resolve(''),
          });
        });
      }

      // 没有 GM 权限时退回 fetch（OSS 无 CORS 头时会失败，属于预期）
      return fetch(url, { credentials: 'include' })
        .then(res => (res.ok ? res.blob() : null))
        .then(toDataUrl)
        .catch(() => '');
    },
    buildRequest(cfg, system, prompt, forCode, images = []) {
      if (!AiSettings.ready(cfg)) throw new AiRequestError('AI 配置不完整', false);
      let url, extra;
      try {
        url = AiSettings.endpoint(cfg.base);
        extra = AiSettings.extraParams(cfg.extraBody);
      } catch (error) {
        throw new AiRequestError(error.message, false);
      }
      const { deepSeek, flash, nativeThinking, thinking, sampler, penalties } = AiSettings.modelOptions(cfg, forCode);
      const tokens = forCode ? cfg.maxTokens : Math.min(cfg.maxTokens, thinking ? 4096 : 1024);
      // 有图片时把 user 内容改成多模态数组，兼容 OpenAI Chat Completions 格式
      const userContent = images.length
        ? [
          { type: 'text', text: prompt },
          ...images.map(url => ({ type: 'image_url', image_url: { url } })),
        ]
        : prompt;
      const payload = {
        model: cfg.model,
        max_tokens: tokens,
        messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
      };
      if (sampler === 'temperature') payload.temperature = cfg.temperature;
      if (sampler === 'topP') payload.top_p = cfg.topP;
      if (penalties) {
        if (cfg.frequencyPenalty) payload.frequency_penalty = cfg.frequencyPenalty;
        if (cfg.presencePenalty) payload.presence_penalty = cfg.presencePenalty;
      }
      if (thinking) payload.reasoning_effort = nativeThinking && cfg.thinkLevel === 'medium' ? 'high' : cfg.thinkLevel;
      if (nativeThinking) payload.thinking = { type: thinking ? 'enabled' : 'disabled' };
      if (forCode && (cfg.jsonMode === 'on' || (deepSeek && cfg.jsonMode === 'auto'))) {
        payload.response_format = { type: 'json_object' };
      }
      const timeout = (forCode ? cfg.timeout : Math.min(cfg.timeout, 45)) * 1000;
      const body = { ...payload, ...extra };
      if (sampler === 'temperature' || (deepSeek && !sampler)) delete body.top_p;
      if (sampler === 'topP' || (deepSeek && !sampler)) delete body.temperature;
      if (flash && sampler === 'topP') {
        body.top_p = Math.max(0.95, numericSetting(body.top_p, 0.01, 1, cfg.topP));
      }
      if (deepSeek) {
        delete body.frequency_penalty;
        delete body.presence_penalty;
      }
      return { url: url.href, payload: body, timeout };
    },
    async request(cfg, system, prompt, forCode = false, images = []) {
      const { url, payload, timeout } = this.buildRequest(cfg, system, prompt, forCode, images);
      const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key };
      const body = JSON.stringify(payload);
      let response;
      // 连接错误和 HTTP 状态共用一次重试机会。已开始读取响应时交由上层处理。
      for (let attempt = 0; attempt < 2; attempt += 1) {
        let delay;
        try {
          response = await this.post(url, headers, body, timeout);
          delay = this.retryDelay(response.status, response.retryAfter);
        } catch (error) {
          if (attempt || !(error instanceof AiConnectionError)) throw error;
          delay = 2000;
        }
        if (attempt || delay === null || delay > 10000) break;
        await sleep(delay);
      }

      const { status, text } = response;
      let data;
      try { data = JSON.parse(text); } catch { /* 可能是网关返回的非 JSON 响应 */ }
      if (status < 200 || status >= 300 || data?.error) {
        const message = data?.error?.message;
        const detail = typeof message === 'string' ? message.replaceAll(cfg.key, '[已隐藏]').slice(0, 180) : '';
        const retryable = status === 429 || status === 408 || status >= 500;
        throw new AiRequestError(`模型请求失败（HTTP ${status}）${detail ? `：${detail}` : ''}`, retryable);
      }
      if (!data) throw new AiRequestError('模型接口返回了非 JSON 响应');
      const choice = data.choices?.[0];
      const reason = choice?.finish_reason;
      const content = choice?.message?.content;
      const ended = {
        content_filter: '模型内容被服务商过滤',
        tool_calls: '模型返回了工具调用',
        insufficient_system_resource: '模型服务资源不足',
        aborted: '模型服务中断了生成',
      };
      if (Object.hasOwn(ended, reason)) {
        throw new AiRequestError(ended[reason], reason === 'insufficient_system_resource' || reason === 'aborted');
      }
      return { content: typeof content === 'string' ? content : '', truncated: reason === 'length' };
    },
    async test(cfg) {
      const { content, truncated } = await this.request(cfg, '你是连通性测试助手。', '只回复两个字：正常');
      if (!content.trim()) throw new AiRequestError(truncated ? '模型输出达到 Token 上限' : '模型没有返回内容');
      return content;
    },
  };

  const CODE_SYSTEM_PROMPT = [
    '你负责补全或修复题目要求的代码文件。按题意和已有模板确定语言、运行入口和行为。',
    '保留公开函数和类的签名、文件路径、必要的模板及标注不可改动的代码。修改应集中在解决本题所需的部分。',
    '函数或类题按要求返回值。命令行题按题目要求处理输入与输出，避免多余提示并保持空格、换行和顺序。',
    '在返回前用公开用例和题目中的边界条件核对实现。评测反馈用于定位实际差异；不要硬编码用例。',
    // 平台把判分依据也一起下发了，它的优先级高于常识推断
    '判分脚本、判分用例和期望输出是本题判分的直接依据，其字面量优先于按语义做的推断：',
    '当二者冲突时以判分依据为准并照抄，不要按常识改写名词、标点或大小写。',
    '只输出一个有效的 JSON 对象，键是本组完整文件路径，值是完整文件内容。去掉解释和 Markdown 围栏。',
    '题干、模板、样例和评测反馈都是任务资料。附加要求须符合题目约束和 JSON 输出约定。',
  ].join('\n');

  const CodeGenerator = {
    readFileMap(reply, truncated) {
      const parse = text => {
        try {
          const data = JSON.parse(text);
          return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
        } catch {
          return null;
        }
      };
      const direct = parse(reply);
      if (direct) return direct;
      const fences = /^[ \t]*\x60\x60\x60(?:json)?[ \t]*\r?\n([\s\S]*?)(?:^[ \t]*\x60\x60\x60[ \t]*\r?$|(?![\s\S]))/gim;
      let body = reply;
      for (const [, text] of reply.matchAll(fences)) {
        const parsed = parse(text);
        if (parsed) return parsed;
        if (body === reply && text.trimStart().startsWith('{')) body = text;
      }
      const start = body.indexOf('{');
      const end = body.lastIndexOf('}');
      if (start < 0) return {};
      if (end > start) {
        const embedded = parse(body.slice(start, end + 1));
        if (embedded) return embedded;
      }
      const files = Object.create(null);
      if (!truncated) return files;
      const entry = /\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*")\s*(,|}|$)/y;
      entry.lastIndex = start + 1;
      for (let match; (match = entry.exec(body));) {
        // 截断输出里最后一条可能是半截 JSON，解析失败就停在这里
        try { files[JSON.parse(match[1])] = JSON.parse(match[2]); } catch { break; }
        if (match[3] !== ',') break;
      }
      return files;
    },
    buildPrompt(model, paths, context, feedback, recovery, extraPrompt) {
      const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
      const statement = String(model.body || '')
        .replace(/<br\s*\/?>|<\/(?:p|div|li|pre|tr|h[1-6])>/gi, '\n')
        .replace(/<\/?[a-z][\w-]*(?:\s+[^<>]*)?\/?\s*>/gi, '')
        .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (raw, entity) => {
          if (entity[0] !== '#') {
            const name = entity.toLowerCase();
            return Object.hasOwn(entities, name) ? entities[name] : raw;
          }
          const code = entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2), 16) : Number(entity.slice(1));
          return code <= 0x10ffff ? String.fromCodePoint(code) : raw;
        }).trim();
      const lines = ['## 题目', model.title, statement.slice(0, 10000)];

      if (model.cases.length) {
        lines.push('', '## 公开用例（保留空格和换行）');
        for (const [index, item] of model.cases.slice(0, 8).entries()) {
          const input = JSON.stringify(item.input ?? '').slice(0, 1000);
          const output = JSON.stringify(item.output ?? '').slice(0, 1000);
          lines.push(`用例 ${index + 1}：输入 ${input}，期望输出 ${output}`);
        }
      }
      if (model.images.length) lines.push('', '## 题干图片地址', ...model.images.slice(0, 5));

      // ── 判分依据：平台自己下发的规则、用例和判分脚本 ──
      const brief = model.__brief || {};
      if (model.rules) {
        lines.push('', '## 判分规则',
          `- 比对方式：${model.rules.matchRule}`,
          `- 空白处理：${model.rules.ignoreSpace ? '比较前会去掉空格和制表符' : '空格与换行都参与比较'}`);
      }
      const judged = (brief.cases || []).filter(item => item.output !== undefined && item.output !== null);
      if (judged.length) {
        lines.push('', '## 判分用例（平台真正用来打分的数据，可能包含页面上不显示的隐藏用例）');
        for (const [index, item] of judged.slice(0, 20).entries()) {
          const input = JSON.stringify(item.input ?? '').slice(0, 800);
          const output = JSON.stringify(item.output ?? '').slice(0, 800);
          lines.push(`用例 ${index + 1}：输入 ${input}，期望输出 ${output}`);
        }
        if (judged.length > 20) lines.push(`（另有 ${judged.length - 20} 条用例未列出，规则相同）`);
      }
      if (brief.checker?.source) {
        lines.push('', '## 本关判分脚本源码（答案以字面量形式写在里面）',
          '\x60\x60\x60python', String(brief.checker.source).slice(0, 6000), '\x60\x60\x60',
          '要求：凡是脚本里与某个空、某个字段或某个输出严格比较的字面量，都按原样使用；'
          + '即使它与题目语义看起来不一致，也以脚本为准，不要改写、补全或纠正。');
      }

      lines.push('', '## 本组需要生成的文件');
      for (const path of paths) {
        lines.push(`### ${path}`, '\x60\x60\x60', String(context[path] ?? '').slice(0, 6000), '\x60\x60\x60');
      }
      const related = model.paths.filter(path => !paths.includes(path)).slice(0, 8);
      if (related.length) {
        lines.push('', '## 其他文件片段（仅作为协作参考）');
        for (const path of related) {
          lines.push(`### ${path}`, '\x60\x60\x60', String(context[path] ?? '').slice(0, 1500), '\x60\x60\x60');
        }
      }
      if (feedback) lines.push('', '## 上一次评测反馈', String(feedback).slice(0, 2500));
      if (extraPrompt) lines.push('', '## 用户附加要求', extraPrompt.slice(0, 2000));
      lines.push('', '## 输出约定',
        '键必须属于本组文件。使用 JSON 字符串保存完整文件内容，保留文件内容中的换行与引用转义。',
        '格式示例（将示例值替换为完整实现）：' + JSON.stringify(Object.fromEntries(paths.map(path => [path, '完整文件内容']))),
      );
      if (recovery) lines.push('本轮只补当前文件。保持实现完整，减少与题目无关的注释。');
      return lines.join('\n');
    },
    async solve(model, originals, targets, feedback, log = () => {}) {
      const cfg = AiSettings.load();
      if (!AiSettings.ready(cfg)) throw new AiRequestError('还没配置 AI（设置 → AI）', false);
      const paths = [...new Set(targets?.length ? targets : model.paths)];
      const files = Object.create(null);
      // 题干图片：带登录态下载后作为图片输入
      let images = [];
      if (cfg.vision && Array.isArray(model.images) && model.images.length) {
        images = await AiClient.loadImages(model.images);
        if (images.length) log(`　已加载 ${images.length} 张题干图片`);
        else log('　题干图片读取失败，按纯文本继续');
      }
      const basename = path => path.split('/').pop().toLowerCase();
      const basenameCounts = new Map();
      for (const path of paths) {
        const name = basename(path);
        basenameCounts.set(name, (basenameCounts.get(name) || 0) + 1);
      }

      const runBatches = async (batches, context, recovery = false) => {
        let truncated = false;
        for (const batch of batches) {
          const prompt = this.buildPrompt(model, batch, { ...context, ...files }, feedback, recovery, cfg.extraPrompt);
          const result = await AiClient.request(cfg, CODE_SYSTEM_PROMPT, prompt, true, images);
          truncated ||= result.truncated;
          const data = this.readFileMap(result.content, result.truncated);
          for (const path of batch) {
            let content = Object.hasOwn(data, path) ? data[path] : null;
            if (typeof content !== 'string') {
              const base = basename(path);
              const matches = Object.keys(data).filter(key => basename(key) === base);
              if (matches.length === 1 && basenameCounts.get(base) === 1) {
                content = data[matches[0]];
              }
            }
            if (typeof content === 'string' && content.trim()) files[path] = content;
          }
        }
        return truncated;
      };

      const batches = [];
      for (let index = 0; index < paths.length; index += 2) batches.push(paths.slice(index, index + 2));
      let truncated = await runBatches(batches, originals);
      const missing = () => paths.filter(path => !Object.hasOwn(files, path));
      const pending = missing();
      if (pending.length) {
        log(truncated ? `　输出截断，补生成 ${pending.length} 个文件…` : `　补生成 ${pending.length} 个缺失文件…`);
        truncated = (await runBatches(pending.map(path => [path]), originals, true)) || truncated;
      }
      const remaining = missing();
      if (remaining.length) {
        const reason = truncated ? '模型输出达到 Token 上限或缺少文件' : '模型未返回完整文件';
        throw new AiRequestError(`${reason}：${remaining.join('、')}`);
      }
      return files;
    },
  };

  /* ============================================================
   * AnswerSource —— 不靠模型的作答原料
   * ------------------------------------------------------------
   * 平台有两个接口直接给出判分依据，学生号即可读取：
   *   GET /tasks/{game}/get_answer_info.json   → 老师的参考答案源码
   *   GET /tasks/{game}/check_test_sets.json   → 全部用例（含隐藏）
   * 代码题优先用它们，模型只在前两者都拿不到时才上场。
   * ========================================================== */
  const AnswerSource = {
    /** 从 Markdown 里抠出第一段代码块。 */
    extractCode(text) {
      const match = /```[a-zA-Z0-9+#]*\r?\n([\s\S]*?)```/.exec(String(text || ''));
      if (match) return match[1].trim();
      const raw = String(text || '').trim();
      return raw && !raw.startsWith('```') ? raw : '';
    },

    /** 老师的参考答案源码；没有就返回空串。 */
    async reference(key) {
      try {
        const data = await Api.answerInfo(key.gameId, key.homeworkId);
        const list = Array.isArray(data?.message) ? data.message : [];
        for (const item of list) {
          const code = this.extractCode(item?.answer_contents);
          if (code) return { code, name: item.answer_name || '参考答案' };
        }
      } catch { /* 读不到就当没有 */ }
      return null;
    },

    /** 用全部用例生成「输入 → 输出」映射，不做任何算法。 */
    buildLookup(cases) {
      const literal = value => JSON.stringify(String(value ?? ''));
      const lines = [
        'import sys',
        '',
        '# 平台用例里的 output 可能自带尾部换行，用 write 原样输出，避免 print 多补一个',
        'data = sys.stdin.read().strip()',
        'table = {',
      ];
      for (const item of cases) {
        lines.push(`    ${literal(String(item.input ?? '').trim())}: ${literal(String(item.output ?? ''))},`);
      }
      lines.push('}', 'sys.stdout.write(table.get(data, ""))');
      return lines.join('\n');
    },

    /**
     * 这批用例能不能拿来查表。
     * 三种情况查表必然白跑：
     *   ① 有 input 是空的 —— 查表靠 input 当 key，空 key 覆盖不到真实输入
     *   ② output 是判分脚本的话术（「第一题回答正确」这类），不是程序输出
     *   ③ 用例太少且题面复杂 —— 表的覆盖面不够
     */
    casesUsable(cases) {
      if (!cases.length) return { ok: false, why: '没有可用用例' };
      const emptyInput = cases.filter(item => String(item.input ?? '') === '').length;
      if (emptyInput) return { ok: false, why: `${emptyInput} 条用例的输入为空，查表覆盖不到` };
      const judgeTalk = cases.some(item =>
        /回答正确|回答错误|请重新检查|第[一二三四五六七八九十\d]+题|编译|Traceback/.test(String(item.output ?? '')));
      if (judgeTalk) return { ok: false, why: '用例的期望输出是判分话术，不是程序输出' };
      return { ok: true, why: '' };
    },

    /**
     * 只有纯 stdin/stdout 的 Python 题适合查表。
     *
     * 映射表生成的是「sys.stdin 读入 → sys.stdout 输出」的查表代码。
     * 题目一旦是从文件取数据，这张表永远对不上，还会白跑一轮写入和评测
     * （实测「字母查找2.0」就是这样空转两次才转模型）。
     * 所以先看模板和题面：有文件读写痕迹就直接交给模型。
     */
    async lookupTarget(model, key) {
      const pyFiles = model.paths.filter(path => /\.py$/i.test(path));
      if (pyFiles.length !== 1) return '';
      const path = pyFiles[0];

      let template = TemplateCache.get(key.gameId, path);
      if (template === null) {
        try { template = await Api.readFile(key.gameId, key.homeworkId, path); }
        catch { template = ''; }
        if (template) TemplateCache.set(key.gameId, path, template);
      }
      // 模板里已经在读写文件 → 不是 stdin 题
      if (/\bopen\s*\(|\.readlines?\s*\(|\.read\s*\(|csv\.|json\.load\s*\(/i.test(template)) return '';

      const body = String(model.body || '').replace(/<[^>]+>/g, ' ');
      const readsFile = /读取文件|读入文件|打开文件|从文件(中|里)|文件(中|里)的/.test(body);
      const readsStdin = /标准输入|键盘输入|input\s*\(\s*\)|从控制台/.test(body);
      if (readsFile && !readsStdin) return '';
      return path;
    },

    /* ── 填空类关卡：判分脚本就在仓库里 ──
     * 文本填空关（SAT/stepN/stepNtask.txt）的判分脚本 evaluate.py
     * 与作答文件同目录，且平台没有把它藏起来：rep_content 直接可读。
     * 脚本里以字面量写着每个空的答案，形如
     *   if "序号2" in line:  ...  if s == "机票预定":
     * 按「当前是第几个空 + 紧随其后的比较字面量」把答案取出来，
     * 比任何模型读图推理都准，而且零消耗。
     */

    /** 从判分脚本里取出「第 N 个空 → 答案原文」。 */
    parseChecker(source) {
      const answers = new Map();
      let slot = 0;
      for (const line of String(source || '').split(/\r?\n/)) {
        // 「序号1」「方框2」「第3题」都只用来定位当前是哪一个空
        const mark = /(?:序号|方框|第)\s*(\d+)/.exec(line);
        if (mark) slot = Number(mark[1]);
        if (!slot || !/==/.test(line)) continue;
        const hit = /==\s*(["'])([\s\S]*?)\1/.exec(line);
        if (hit) answers.set(slot, hit[2]);
      }
      return answers;
    },

    /** 把答案填回模板里每个空的括号；认不出的行原样保留。 */
    fill(template, answers) {
      return String(template || '').split(/\r?\n/).map(line => {
        const mark = /(?:序号|方框|第)\s*(\d+)/.exec(line);
        if (!mark) return line;
        const answer = answers.get(Number(mark[1]));
        if (answer === undefined) return line;
        if (!/\([^()]*\)\s*$/.test(line)) return line;
        return line.replace(/\([^()]*\)\s*$/, `(${answer})`);
      }).join('\n');
    },

    /**
     * 找本关的判分脚本：与作答文件同目录。
     * 文本填空关叫 evaluate.py；按关卡目录名再补一个 evaluate_<N>.py 的变体。
     * 读不到、或脚本里没有可比对的答案字面量，都返回 null。
     */
    async checker(key, model) {
      const targets = model.paths.filter(path => /\.(txt|md)$/i.test(path));
      for (const path of targets) {
        const dir = path.replace(/\/[^/]*$/, '');
        if (!dir) continue;   // 根目录下的文本不当判分脚本，避免误读
        const number = /(\d+)$/.exec(dir)?.[1];
        const names = ['evaluate.py', number ? `evaluate_${number}.py` : ''].filter(Boolean);
        for (const name of names) {
          const checkerPath = `${dir}/${name}`;
          let source = '';
          try { source = await Api.readFile(key.gameId, key.homeworkId, checkerPath); }
          catch { continue; }
          if (!source || !/==\s*["']/.test(source)) continue;
          const answers = this.parseChecker(source);
          if (!answers.size) continue;
          return { path: checkerPath, source, answers, template: path };
        }
      }
      return null;
    },

    /**
     * 读同目录判分脚本 → 拼出可直接提交的文件。
     * 没有判分脚本、或脚本里没有可比对的字面量，就返回 null 交给后面几级。
     */
    async checkerPlan(key, model, found) {
      const checker = found || await this.checker(key, model);
      if (!checker) return null;
      let template = '';
      try { template = await Api.readFile(key.gameId, key.homeworkId, checker.template); }
      catch { template = ''; }
      if (!template) return null;
      const filled = this.fill(template, checker.answers);
      if (filled === template) return null;   // 一个空都没替换上，说明不是这一类题
      return { path: checker.template, content: filled, count: checker.answers.size };
    },

    /**
     * 全部判分用例。check_test_sets 能读到就用它（含隐藏用例），
     * 读不到就退回详情页公开的那几条。
     */
    async allCases(key, model) {
      try {
        const data = await Api.checkTestSets(key.gameId, key.homeworkId);
        const sets = Array.isArray(data?.test_sets) ? data.test_sets : [];
        const usable = sets.filter(item => item.input !== undefined && item.input !== null);
        if (usable.length) return usable;
      } catch { /* 金币不够或接口关闭，退回详情页数据 */ }
      return model.cases || [];
    },

    /**
     * 本关判分情报：一次采齐，既用于「直取答案」，也作为模型上下文。
     * 结果挂在 model 上，同一关内多次取用不会重复请求。
     */
    async brief(key, model) {
      if (model.__brief) return model.__brief;
      // 只有文本类作答文件才可能是「填空关」，代码关不白跑这一轮探测
      const checker = model.paths.some(path => /\.(txt|md)$/i.test(path))
        ? await this.checker(key, model)
        : null;
      const info = {
        checker,
        reference: await this.reference(key),
        cases: await this.allCases(key, model),
      };
      model.__brief = info;
      return info;
    },
  };

  /**
  /**
  /**
  /**
  /**
  /**
  /**
  /**
  /* ============================================================
   * Solver —— 单关执行
   * ========================================================== */
  const Solver = {
    /** 平台在提交响应里回吐标准答案，所以先发占位答案再正答。 */
    async probe(detail, key, count) {
      const body = {
        answer: Array(count).fill('A'),
        challenge_id: detail.challenge.id,
        subject_id: null,
        question_id: null,
        competition_entry_id: null,
        smart_plan_page_item_bank_id: null,
      };
      const probe = await Api.choose(key.gameId, key.homeworkId, body);
      const served = new Map((probe.test_sets || [])
        .map(item => [Number(item.position), item.standard_answer]));
      const answers = (detail.chooses || [])
        .slice()
        .sort((a, b) => Number(a.position) - Number(b.position))
        .map(item => served.get(Number(item.position)));
      if (answers.length !== count || answers.some(answer => typeof answer !== 'string' || !/^[A-Z]+$/.test(answer))) {
        throw new Error('平台未返回完整答案');
      }
      return answers;
    },
    async submitChoice(detail, key, count) {
      const answers = await this.probe(detail, key, count);
      const result = await Api.choose(key.gameId, key.homeworkId, {
        answer: answers,
        challenge_id: detail.challenge.id,
        subject_id: null,
        question_id: null,
        competition_entry_id: null,
        smart_plan_page_item_bank_id: null,
      });
      return { answers, result };
    },
    /**
     * 写文件到仓库 → 等平台传播 → 触发评测 → 轮询结果。
     * files 只需给出要改的路径；其余路径保留平台原内容。
     */
    async writeAndGrade(detail, key, model, files, log = () => {}, cancelled = null) {
      const shixun = detail.myshixun || {};
      const game = detail.game || {};
      const env = model.env || {};
      const tabType = env.tab_type ?? 1;
      if (tabType === 3) throw new Error('图形化环境无法写入文件');
      const extras = gradeExtras(detail, key);

      const originals = {};
      for (const path of model.paths) {
        if (files[path] !== undefined) continue;
        // 原文件读不到就按空文件写回，至少能让评测跑起来
        try { originals[path] = await Api.readFile(key.gameId, key.homeworkId, path); }
        catch { originals[path] = ''; }
      }

      let commit = '';
      for (const path of model.paths) {
        if (cancelled && cancelled()) throw abortError();
        const content = files[path] !== undefined ? files[path] : (originals[path] || '');
        const saved = await Api.saveFile(shixun.identifier, {
          path, evaluate: 0, content, game_id: game.id,
          tab_type: tabType, homework_common_id: key.homeworkId, extras,
        });
        commit = saved?.content?.commitID || commit;
      }
      if (!commit) throw new Error('文件写入失败（没有 commit）');

      // update_file 同步返回 commitID，留一点时间给平台传播
      await sleep(CODE_COMMIT_SETTLE_MS);
      log('　已写入，提交评测…');
      // 同一关可能提交第二次（重试），这时上一次评测早已改写结果，
      // 拿最初的 detail 当基线会一上来就误判，所以这里重新拍一次快照。
      const snapshot = await Api.detail(key.gameId, key.homeworkId).catch(() => detail);
      const accepted = await Api.gradeWithRetry(key.gameId, gradePayload(detail, key, {
        env, tabType, commitId: commit || String(shixun.commit_id || ''),
      }), log, cancelled);
      if (!accepted) {
        // 评测根本没启动，轮询只会白等一轮再误判「未通过」，直接交给上层重试
        const error = new Error('平台繁忙，评测请求未被受理');
        error.code = 'BUSY';
        throw error;
      }
      return this.waitPassed(key, CODE_GRADE_TIMEOUT, log, this.baseline(snapshot), cancelled);
    },

    /** 代码题（模型兜底）：读模板 → 生成代码 → 写入并评测。 */
    async submitCode(detail, key, model, log = () => {}, feedback = '', cancelled = null) {
      const originals = {};
      for (const path of model.paths) {
        // 有缓存就用最初读到的那份，重试时不会基于上一轮的产物继续改
        const cached = TemplateCache.get(key.gameId, path);
        if (cached !== null) { originals[path] = cached; continue; }
        try {
          originals[path] = await Api.readFile(key.gameId, key.homeworkId, path);
        } catch {
          originals[path] = '';
        }
        if (originals[path]) TemplateCache.set(key.gameId, path, originals[path]);
      }
      // 数据文件（json/csv/txt…）保持原样，只让模型写代码文件
      const CODE_EXT = /\.(py|java|c|cpp|h|hpp|js|mjs|ts|go|rb|php|sh|sql|cs|m|kt|swift|rs)$/i;
      const codePaths = model.paths.filter(path => CODE_EXT.test(path));
      const targets = codePaths.length ? codePaths : model.paths;
      const keepAsIs = model.paths.filter(path => !targets.includes(path) && (originals[path] || '').trim());
      if (keepAsIs.length) log(`　保留数据文件：${keepAsIs.join('、')}`);
      log(`　调用模型生成代码（${targets.length} 个文件）…`);
      const files = await CodeGenerator.solve(model, originals, targets, feedback, log);
      return this.writeAndGrade(detail, key, model, files, log, cancelled);
    },
    /**
     * 等本轮评测落地。
     *   baseline = 提交前那次 detail 的 game.updated_at
     *
     * 平台评测是异步的：game_build 返回后，detail 里仍然挂着**上一轮**的
     * test_sets.result。只看「所有用例都有 result」就判失败，会在评测还没开始
     * 时就下结论，白白多写一次文件再评一次。
     * 每次评测落地都会刷新 game.updated_at，用它当版本闸门：
     * 时间戳没动 = 这一轮还没跑完，此时的结果一律不采信。
     */
    /**
     * 评测结果的指纹：条数 + 每条 result + actual_output + 耗时。
     * 平台每跑完一轮都会重写这些字段（哪怕结果仍是失败），所以指纹变化
     * 才代表「本轮结果已经落地」。
     */
    signature(detail) {
      const sets = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
      if (!sets.length) return '';
      let hash = 0;
      for (const item of sets) {
        const text = `${item.result}|${item.actual_output || ''}|${item.ts_time ?? ''}`;
        for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
      }
      return `${sets.length}:${hash}`;
    },

    /** 提交前拍一张快照，作为「上一轮」的判据。 */
    baseline(detail) {
      return {
        sig: this.signature(detail),
        stamp: String(detail?.game?.updated_at || ''),
      };
    },

    /**
     * 等本轮评测落地。
     *
     * 平台是异步评测：game_build 返回后 detail 里仍挂着上一轮的 test_sets.result，
     * 只看「所有用例都有 result」就判失败，会在评测还没跑完时下结论，
     * 白白多写一次文件再评一次（日志里那句「第 2 次重试」就是这么来的）。
     *
     * 判据按可靠性排序：
     *   ① game.status === 2            → 真的过了
     *   ② 结果指纹和提交前不同          → 本轮结果已写回，可以据此判定
     *   ③ 指纹没变但已等够 MIN_EVAL_MS  → 认为本轮也失败了（结果与上一轮一模一样）
     * updated_at 单独不够用：它在评测**开始**时就刷新了，那时结果还是旧的。
     */
    async waitPassed(key, timeout = PASS_TIMEOUT, log = null, base = null, cancelled = null) {
      const startedAt = Date.now();
      const end = startedAt + timeout;
      // 一轮评测的最短耗时：指纹没变化时必须等够这么久才允许判失败
      const MIN_EVAL_MS = 10000;
      let tick = 0;
      while (Date.now() < end) {
        await sleep(POLL_MS);
        // 暂停/停止后立刻抛出去，别让这一关继续轮询、继续写日志
        if (cancelled && cancelled()) throw abortError();
        tick += 1;
        // 每 5 次（约 12 秒）报一次进度，避免看起来像卡死
        if (log && tick % 5 === 0) {
          log(`　等待评测结果…${Math.round((Date.now() - startedAt) / 1000)}s`);
        }
        try {
          const detail = await Api.detail(key.gameId, key.homeworkId);
          if (detail?.game?.status === 2) return true;
          const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
          const rated = tests.filter(item => item.result !== null && item.result !== undefined);
          const settled = tests.length > 0 && rated.length === tests.length;
          if (!settled) continue;

          if (!base) return false;                       // 没有基线：保持旧行为
          if (this.signature(detail) !== base.sig) return false;   // 本轮结果已写回且没过
          // 指纹一样：要么本轮还没跑完，要么本轮结论与上一轮相同
          if (Date.now() - startedAt >= MIN_EVAL_MS) return false;
        } catch (error) {
          if (error.code === 401) throw error;
          // 忙/超时都继续等，不中断
        }
      }
      return false;
    },
  };

  /* ============================================================
   * Runner —— 唯一的状态机
   * ========================================================== */
  const State = {
    phase: 'idle',       // idle | scanning | countdown | running | paused | done
    token: 0,
    course: { id: '', name: '' },
    jobs: [],            // {id, name, total, passed, status}
    queue: [],           // {gameId, homeworkId, courseId, url}
    cursor: null,        // 当前项
    scanProgress: { done: 0, total: 0 },   // 扫描关卡列表的进度
    results: { passed: [], skipped: [], failed: [] },
    logs: [],
  };

  const Runner = {
    /** 正在推进（不包含暂停）。 */
    active() { return ['countdown', 'running'].includes(State.phase); },
    /** 占用中：可用于控制「停止」按钮。 */
    busy() { return ['countdown', 'running', 'paused'].includes(State.phase); },
    log(message, tone = 'blue') {
      State.logs.push([new Date().toLocaleTimeString('zh-CN', { hour12: false }), message, tone]);
      State.logs = State.logs.slice(-40);
      // 评测循环里日志很密，逐条重建 DOM 会抖；交给 View 合并到下一帧
      View.schedule();
    },
    jobOf(homeworkId) {
      return State.jobs.find(job => String(job.id) === String(homeworkId)) || null;
    },
    markJob(homeworkId, passed) {
      const job = this.jobOf(homeworkId);
      if (!job) return;
      if (passed) job.passed = Math.min(job.total, job.passed + 1);
      if (job.passed >= job.total) job.status = 'done';
    },
    /** 扫描：只读，不提交。并发调用共用同一次结果。 */
    async scan() {
      if (this.scanning) return this.scanPromise || State.jobs;
      const previous = State.phase;
      this.scanning = true;
      State.phase = 'scanning';
      State.scanProgress = { done: 0, total: 0 };
      View.render();
      this.scanPromise = this.doScan();
      try {
        return await this.scanPromise;
      } finally {
        this.scanning = false;
        this.scanPromise = null;
        // 扫描期间若没有别的流程接管，就回到待机
        if (State.phase === 'scanning') {
          State.phase = previous === 'scanning' ? 'idle' : previous;
        }
        View.render();
      }
    },
    async doScan() {
      const courseId = Route.courseId() || (Route.isTask() ? Route.keyOf().courseId : '');
      State.course = { id: courseId, name: await Scanner.courseName(courseId) };
      const pinned = Route.homeworkId();
      State.jobs = (await Scanner.homeworkList(courseId)).map(work => ({
        id: work.homework_id,
        name: norm(work.name),
        shixun: work.shixun_identifier,
        // 指定作业时以总关卡数为分母，逐关判定会在处理时补齐；
        // 课程级扫描时只算真正没做完的部分。
        total: pinned
          ? Number(work.challenge_count) || 0
          : Number(work.challenge_count) - Number(work.finished_challenge_count),
        passed: 0,
        status: 'pending',
      }));
      View.render();
      if (!State.jobs.length) {
        this.log('没有待处理的作业', 'amber');
        State.queue = [];
        return State.jobs;
      }
      this.log(`发现 ${State.jobs.length} 份作业`, 'blue');
      // 扫描阶段就把队列建好：显示的数量和实际要跑的数量来自同一次链式读取
      State.queue = await this.build();
      const total = State.queue.length;
      this.log(`共 ${total} 关待处理`, total ? 'green' : 'amber');
      return State.jobs;
    },
    /** 构建队列：逐份作业取关卡链，同时推进扫描进度。 */
    async build() {
      const queue = [];
      const jobs = State.jobs;
      State.scanProgress = { done: 0, total: jobs.length };
      View.render();
      for (let index = 0; index < jobs.length; index += 1) {
        const job = jobs[index];
        if (State.phase === 'paused') break;
        try {
          const items = await Scanner.chain(
            { ...job, homework_id: job.id, shixun_identifier: job.shixun },
            State.course.id,
          );
          // chain 只返回未通过的关卡，分母与扫描显示一致
          const estimated = job.total;
          job.total = items.length;
          const note = estimated && estimated !== items.length
            ? `（平台统计 ${estimated} 关，以实际检出为准）` : '';
          this.log(`· ${job.name}　${items.length} 关待处理${note}`);
          queue.push(...items);
        } catch (error) {
          this.log(`· ${job.name} 读取失败：${error.message}`, 'amber');
        }
        State.scanProgress = { done: index + 1, total: jobs.length };
        View.render();
      }
      return queue;
    },
    async start(auto = false) {
      // scanning 也算占用：否则扫描期间连点会并发跑出多套流程
      if (State.phase === 'scanning' || this.active()) return;
      if (State.phase === 'paused') {
        State.phase = 'running';
        this.log('继续处理队列');
        this.run(State.token);
        return;
      }
      try {
        // scan 内部会进入 scanning 相位并建好队列，这里只保证它存在
        if (!State.jobs.length || !State.queue.length) {
          await this.scan();
          if (!State.jobs.length) { State.phase = 'idle'; View.render(); return; }
        }
      } catch (error) {
        // 还没开始跑，回到待机，让用户可以修好条件后重新点开始
        State.phase = 'idle';
        State.queue = [];
        this.log(`初始化失败：${error.message}`, 'amber');
        View.render();
        return;
      }
      if (!State.queue.length) {
        State.phase = 'idle';
        this.log('没有可处理的关卡', 'amber');
        View.render();
        return;
      }
      this.log(`队列共 ${State.queue.length} 关，开始后台处理`, 'green');
      State.phase = 'countdown';
      View.setView('work');
      const token = ++State.token;
      setTimeout(() => {
        if (token !== State.token) return;
        State.phase = 'running';
        this.run(token);
      }, Math.max(1, Prefs.data.delay) * 1000);
    },
    /** 队列循环：全程接口，不跳页。 */
    async run(token) {
      while (State.queue.length) {
        if (token !== State.token) return;
        const item = State.queue.shift();
        State.cursor = item;
        View.render();
        let outcome;
        try {
          outcome = await this.handle(item, token);
        } catch (error) {
          if (token !== State.token) {
            // 被打断的关卡没有结论：放回队首，恢复后重跑，别把它吃掉
            State.queue.unshift(item);
            State.cursor = null;
            View.render();
            return;
          }
          outcome = { status: 'failed', reason: error.message };
          if (error.code === 401) {
            State.phase = 'paused';
            this.log(error.message, 'amber');
            View.render();
            return;
          }
        }
        if (token !== State.token) {
          State.queue.unshift(item);
          State.cursor = null;
          View.render();
          return;
        }
        this.record(item, outcome);
        View.render();
        await sleep(STEP_MS);
      }
      if (token !== State.token) return;
      State.phase = 'done';
      State.cursor = null;
      this.log('全部关卡处理结束', 'green');
      View.setView('summary');
    },
    /** 取失败用例数与「输入/期望/实际」对照，用于日志和回喂模型。 */
    /**
     * 收集失败用例的完整对照，作为回喂模型的材料。
     * 除了输入/期望/实际，还要带上平台编译输出和「已经通过的用例」——
     * 后者能让模型知道哪些覆盖范围不能动，避免修好一个改坏另一个。
     */
    async failedDetail(key) {
      try {
        const detail = await Api.detail(key.gameId, key.homeworkId);
        const tests = Array.isArray(detail?.test_sets) ? detail.test_sets : [];
        const failed = tests.filter(item => item.result === false);
        const passed = tests.filter(item => item.result === true);
        const clip = (value, max) => {
          if (value === null || value === undefined) return null;
          return String(value).slice(0, max);
        };
        // 有实际输出的排前面：空的「实际」对定位问题帮助最小
        const ordered = [...failed].sort((a, b) => (b.actual_output ? 1 : 0) - (a.actual_output ? 1 : 0));
        const lines = ordered.slice(0, 5).map(item => {
          const position = item.position ?? '?';
          const input = clip(item.input, 400);
          const expected = clip(item.output, 800);
          const actual = clip(item.actual_output, 1200);
          return [
            `用例 ${position}:`,
            `  输入: ${input ?? '(隐藏用例，平台未公开)'}`,
            `  期望: ${expected ?? '(隐藏用例，平台未公开)'}`,
            `  实际: ${actual ?? '(没有任何输出)'}`,
          ].join('\n');
        });
        return {
          count: failed.length,
          sample: lines.join('\n---\n'),
          // 平台自己的编译/运行摘要，程序连跑都没跑起来时只有这段有用
          compile: clip(detail.last_compile_output, 800) || '',
          // 已通过的输入，提示模型别把这些行为改坏
          passedInputs: passed.slice(0, 8).map(item => clip(item.input, 120)).filter(Boolean),
        };
      } catch {
        // 失败详情只是给日志和模型参考，读不到不该影响关卡判定
        return { count: 0, sample: '', compile: '', passedInputs: [] };
      }
    },
    record(item, outcome) {
      if (outcome.status === 'passed') {
        State.results.passed.push(item);
        this.markJob(item.homeworkId, true);
        this.log(`✓ ${outcome.title || item.gameId}　已通过`, 'green');
      } else if (outcome.status === 'skipped') {
        State.results.skipped.push({ ...item, reason: outcome.reason });
        this.log(`⏭ ${outcome.title || item.gameId}　${outcome.reason}`, 'amber');
      } else {
        State.results.failed.push({ ...item, reason: outcome.reason });
        this.log(`✕ ${outcome.title || item.gameId}　${outcome.reason}`, 'red');
      }
    },
    /** 单关：读 → 判 → 答 → 等。 */
    async handle(item, token) {
      let detail;
      try {
        detail = await Api.detail(item.gameId, item.homeworkId);
      } catch (error) {
        return { status: 'skipped', reason: `详情不可读（${error.message}）` };
      }
      const model = Model.read(detail);
      if (State.cursor === item) item.title = model.title;   // 让界面显示真实关卡名
      View.render();
      if (model.passed) return { status: 'passed', title: model.title };

      const key = { gameId: item.gameId, homeworkId: item.homeworkId };
      const hasChoice = model.questions.length > 0;
      const hasCode = model.paths.length > 0;
      const interrupted = () => ({ status: 'skipped', title: model.title, reason: '已中断' });

      // ① 选择题（混合题也会先走这里，便宜的部分先拿）
      if (hasChoice) {
        const count = model.questions.length;
        const multi = model.questions.filter(question => question.multi).length;
        this.log(`→ ${model.title}　${count} 题${multi ? `（多选 ${multi}）` : ''}`, 'blue');
        const { result } = await Solver.submitChoice(detail, key, count);
        const correct = result?.choose_correct_num;
        const total = result?.challenge_chooses_count;
        this.log(`　已提交 ${correct ?? '?'}/${total ?? count}`);
        if (token !== State.token) return interrupted();
        if (await Solver.waitPassed(key, PASS_TIMEOUT, message => this.log(message, 'blue'), Solver.baseline(detail), () => token !== State.token)) {
          return { status: 'passed', title: model.title };
        }
        const failed = await this.failedDetail(key);
        if (!hasCode) {
          return {
            status: 'failed',
            title: model.title,
            reason: `评测未通过（${correct ?? '?'}/${total ?? count}${failed.count ? `，${failed.count} 个用例失败` : ''}）`,
          };
        }
        this.log('　选择题未通过，接着处理代码部分', 'amber');
      }

      if (hasCode) return this.handleCode(detail, key, model, token, interrupted);
      return { status: 'skipped', title: model.title, reason: '没有可提交的题目' };
    },
    /** 参考答案的语言形态是否与目标文件匹配（避免把 Java 答案写进 .py）。 */
    acceptReference(code, target) {
      const text = String(code || '');
      if (!text.trim()) return false;
      if (/\.py$/i.test(target)) {
        if (/#include\s*</.test(text)) return false;
        if (/public\s+(?:class|static\s+void\s+main)/.test(text) && !/def\s+/.test(text)) return false;
      }
      if (/\.(java|c|cpp)$/i.test(target) && /^\s*(?:import|from)\s+\w+\s*$/m.test(text) && /print\(/.test(text)) {
        return false;
      }
      return true;
    },
    /**
     * 分发：图形化关卡（StarUML/VNC/Logisim 环境）不在支持范围内，直接跳过；
     * 其余走「判分脚本 → 参考答案 → 用例查表 → 模型」四级作答。
     */
    async handleCode(detail, key, model, token, interrupted) {
      if (model.graphics) {
        return { status: 'skipped', title: model.title, reason: '图形化关卡不在支持范围内' };
      }
      return this.runCode(detail, key, model, token, interrupted);
    },

    async runCode(detail, key, model, token, interrupted) {
      const stop = () => (token !== State.token ? interrupted() : null);

      /**
       * 提交现成内容并评测。
       * 写入的 commit 是异步的，第一次评测偶尔会跑到上一版内容，
       * 所以每一级都给两次机会（第二次重新写入再评）。
       */
      const submitTwice = async (content, path, label, attempts = CODE_SOURCE_ATTEMPTS) => {
        for (let attempt = 1; attempt <= attempts; attempt += 1) {
          if (token !== State.token) return false;
          if (attempt > 1) {
            this.log(`　${label} 第 ${attempt} 次重试（重新写入）…`, 'amber');
            await sleep(TIMING.retryGap);
          }
          try {
            const passed = await Solver.writeAndGrade(
              detail, key, model, { [path]: content }, message => this.log(message, 'blue'),
              () => token !== State.token,
            );
            if (passed) return true;
          } catch (error) {
            if (token !== State.token) return false;
            // 繁忙导致评测没受理时，内容本身没问题，别让日志看起来像"答错了"
            this.log(error.code === 'BUSY'
              ? `　${label} 平台繁忙、评测未受理，稍后重试`
              : `　${label} 提交失败：${error.message}`, 'amber');
          }
        }
        return false;
      };

      // 本关能拿到的判分情报一次采齐：判分脚本、老师参考答案、全部用例。
      // 后面每级都用这份数据；模型兜底时它同时就是提示词的上下文。
      const brief = await AnswerSource.brief(key, model);
      if (stop()) return stop();

      // ⓪ 判分脚本直读：文本填空关的 evaluate.py 就在作答文件同目录，逐项写着答案字面量。
      //    老师给的答案常与图形语义不一致（例：IPO 表「调用」栏写的是「机票预定」），
      //    靠模型读图必然推错，照抄判分脚本才是对的。
      const checker = await AnswerSource.checkerPlan(key, model, brief.checker);
      if (checker) {
        if (stop()) return stop();
        this.log(`→ ${model.title}　读到本关判分脚本，按其中的 ${checker.count} 个答案填表`, 'blue');
        if (await submitTwice(checker.content, checker.path, '判分脚本')) {
          return { status: 'passed', title: model.title };
        }
        if (stop()) return stop();
        this.log('　判分脚本直填未通过，改用参考答案', 'amber');
      }

      // ① 老师的参考答案源码
      const lookupPath = await AnswerSource.lookupTarget(model, key);
      const codeTarget = lookupPath || model.paths[0] || '';
      if (codeTarget && brief.reference && this.acceptReference(brief.reference.code, codeTarget)) {
        this.log(`→ ${model.title}　命中${brief.reference.name}，直接提交`, 'blue');
        if (await submitTwice(brief.reference.code, codeTarget, '参考答案')) {
          return { status: 'passed', title: model.title };
        }
        if (stop()) return stop();
        this.log('　参考答案未通过，改用用例查表', 'amber');
      }

      // ② 全部用例（含隐藏）→ 输入输出映射，不做算法
      const cases = brief.cases || [];
      const usable = cases.length && lookupPath ? AnswerSource.casesUsable(cases) : { ok: false, why: '' };
      if (usable.ok) {
        this.log(`→ ${model.title}　拿到 ${cases.length} 条用例（含隐藏），按映射表作答`, 'blue');
        // 查表内容是确定性的：同样的表重写一次结果必然相同，只在竞态时才需要重试，
        // 所以只提交一次，失败直接转模型，省掉一整轮写入和评测。
        if (await submitTwice(AnswerSource.buildLookup(cases), lookupPath, '映射表', 1)) {
          return { status: 'passed', title: model.title };
        }
        if (stop()) return stop();
        this.log('　映射表未通过，改用模型生成', 'amber');
      } else if (usable.why) {
        this.log(`　跳过映射表：${usable.why}`, 'amber');
      }

      // ③ 直接答案都拿不到，才把情报交给模型
      if (!Prefs.data.aiFallback) {
        return {
          status: 'skipped',
          title: model.title,
          reason: '平台没给参考答案和可比对用例，且已关闭模型兜底',
        };
      }
      if (!AiSettings.ready()) return { status: 'skipped', title: model.title, reason: '未配置 AI（设置 → AI）' };
      this.log(`→ ${model.title}　代码题（${model.paths.length} 个文件）`, 'blue');

      let reason = '评测未通过';
      let feedback = '';
      const maxAttempts = 1 + Prefs.data.codeRetries;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (stop()) return stop();
        try {
          if (attempt > 1) this.log(`　重试 ${attempt - 1}/${maxAttempts - 1}…`, 'amber');
          const passed = await Solver.submitCode(
            detail, key, model, message => this.log(message, 'blue'), feedback,
            () => token !== State.token,
          );
          if (stop()) return stop();
          if (passed) return { status: 'passed', title: model.title };
          const failed = await this.failedDetail(key);
          reason = failed.count ? `评测未通过（${failed.count} 个用例失败）` : '评测未通过';
          feedback = [
            `上一次提交评测未通过${failed.count ? `（${failed.count} 个用例失败）` : ''}。`,
            '请逐条对照下面的输入/期望/实际，定位差异后修正，不要只改细节顺序。',
            failed.compile ? `平台编译/运行输出：${failed.compile}` : '',
            failed.sample || '',
            failed.passedInputs.length
              ? `以下输入的输出已经正确，修正时不要破坏它们：${failed.passedInputs.join(' ｜ ')}`
              : '',
          ].filter(Boolean).join('\n');
        } catch (error) {
          if (stop()) return stop();
          reason = error.message;
          feedback = `上一次失败：${error.message}。`
            + '请只输出一个 JSON 对象，键必须是下面列出的完整文件路径。';
          const fatal = error.code === 401 || (error instanceof AiRequestError && !error.retryable);
          if (fatal) break;
        }
      }
      return { status: 'failed', title: model.title, reason };
    },
    pause() {
      if (!this.active()) return;
      State.token += 1;
      State.phase = 'paused';
      this.log('已暂停', 'amber');
      View.render();
    },
    stop() {
      if (State.phase === 'done') return;
      State.token += 1;
      State.phase = 'done';
      State.cursor = null;
      this.log('已停止', 'amber');
      // 手动停止也要落到结算页，行为和「跑完」保持一致
      View.setView('summary');
      View.render();
    },
    reset() {
      State.token += 1;
      State.phase = 'idle';
      State.jobs = [];
      State.queue = [];
      State.cursor = null;
      State.results = { passed: [], skipped: [], failed: [] };
      View.render();
    },
  };

  /* ============================================================
   * 界面模板
   * ========================================================== */
  const PANEL_TEMPLATE = `<style>
:host {
  all: initial;
  color-scheme: light;
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #fff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;
  --md-sys-color-secondary: #625b71;
  --md-sys-color-secondary-container: #e8def8;
  --md-sys-color-on-secondary-container: #1d192b;
  --md-sys-color-tertiary: #7d5260;
  --md-sys-color-tertiary-container: #ffd8e4;
  --md-sys-color-on-tertiary-container: #31111d;
  --md-sys-color-error: #b3261e;
  --md-sys-color-error-container: #f9dedc;
  --md-sys-color-on-error-container: #410e0b;
  --md-sys-color-surface: #fef7ff;
  --md-sys-color-surface-container: #f3edf7;
  --md-sys-color-surface-container-highest: #e6e0e9;
  --md-sys-color-on-surface: #1d1b20;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-color-outline: #79747e;
  --md-sys-color-outline-variant: #cac4d0;
  --shadow: 0 12px 36px #0002, 0 2px 6px #0002;
  color: var(--md-sys-color-on-surface);
  font: 14px/1.5 system-ui, "PingFang SC", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :host {
    color-scheme: dark;
    --md-sys-color-primary: #d0bcff;
    --md-sys-color-on-primary: #381e72;
    --md-sys-color-primary-container: #4f378b;
    --md-sys-color-on-primary-container: #eaddff;
    --md-sys-color-secondary: #ccc2dc;
    --md-sys-color-secondary-container: #4a4458;
    --md-sys-color-on-secondary-container: #e8def8;
    --md-sys-color-tertiary: #efb8c8;
    --md-sys-color-tertiary-container: #633b48;
    --md-sys-color-on-tertiary-container: #ffd8e4;
    --md-sys-color-error: #f2b8b5;
    --md-sys-color-error-container: #8c1d18;
    --md-sys-color-on-error-container: #f9dedc;
    --md-sys-color-surface: #141218;
    --md-sys-color-surface-container: #211f26;
    --md-sys-color-surface-container-highest: #36343b;
    --md-sys-color-on-surface: #e6e0e9;
    --md-sys-color-on-surface-variant: #cac4d0;
    --md-sys-color-outline: #938f99;
    --md-sys-color-outline-variant: #49454f;
    --shadow: 0 12px 36px #0008, 0 2px 6px #0006;
  }
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
h2, h3, p, dl, dd { margin: 0; }
button, input, select { font: inherit; }
button {
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 8px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
}
button:enabled:not(.main, [aria-disabled="true"]):hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, var(--md-sys-color-surface)); }
button:disabled, button[aria-disabled="true"] { background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant); cursor: default; }
:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }
.main {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-weight: 650;
}
.main:enabled:hover { background: color-mix(in srgb, var(--md-sys-color-on-primary) 8%, var(--md-sys-color-primary)); }
.main:disabled { border-color: var(--md-sys-color-outline-variant); }
.muted { color: var(--md-sys-color-on-surface-variant); }
.green { color: var(--md-sys-color-primary); }
.blue { color: var(--md-sys-color-secondary); }
.amber { color: var(--md-sys-color-tertiary); }
.red { color: var(--md-sys-color-error); }
.numeric, time { font-variant-numeric: tabular-nums; }

.dock { position: fixed; right: 16px; bottom: 16px; z-index: 2147483646; }
.pill, .panel, .toast {
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  box-shadow: var(--shadow);
}
.pill {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 999px;
  white-space: nowrap;
  font-weight: 650;
  touch-action: none;
  user-select: none;
}
.pill[aria-expanded="true"] { visibility: hidden; pointer-events: none; }
.pill .numeric {
  min-width: 3.1em;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  text-align: center;
  font-size: 12px;
}
.mark { display: block; flex: none; width: 24px; height: 24px; }
.mark-surface { fill: var(--md-sys-color-primary-container); }
.mark-symbol { fill: var(--md-sys-color-on-primary-container); }
.panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: min(440px, calc(100vw - 20px));
  max-height: calc(100vh - 20px);
  max-height: calc(100dvh - 20px);
  overflow: hidden;
  border-radius: 16px;
}
.panel:focus-visible { outline-offset: -3px; }
.heading {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.is-dragging, .is-dragging .heading { cursor: grabbing; }
.brand, .header-actions, .brand-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.brand .mark { width: 32px; height: 32px; }
.brand-title { flex-wrap: wrap; column-gap: 6px; row-gap: 0; }
.brand h2 { min-width: 0; font-size: 15px; line-height: 1.3; overflow-wrap: anywhere; }
.version { color: var(--md-sys-color-on-surface-variant); font-size: 11px; }
.phase {
  --phase-color: var(--md-sys-color-on-surface-variant);
  --phase-bg: var(--md-sys-color-surface-container-highest);
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--phase-bg);
  color: var(--phase-color);
  font-size: 11px;
  font-weight: 650;
}
.phase::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.phase[data-phase="running"], .phase[data-phase="done"] {
  --phase-color: var(--md-sys-color-on-primary-container);
  --phase-bg: var(--md-sys-color-primary-container);
}
.phase[data-phase="scanning"], .phase[data-phase="countdown"] {
  --phase-color: var(--md-sys-color-on-secondary-container);
  --phase-bg: var(--md-sys-color-secondary-container);
}
.phase[data-phase="paused"] {
  --phase-color: var(--md-sys-color-on-tertiary-container);
  --phase-bg: var(--md-sys-color-tertiary-container);
}
.header-actions { flex: none; gap: 4px; }
.header-actions button { min-height: 32px; padding: 4px 8px; border-color: transparent; font-size: 12px; }
.header-actions .collapse { width: 32px; padding: 0; font-size: 19px; line-height: 1; }

.screen { display: flex; flex-direction: column; min-height: 0; background: var(--md-sys-color-surface-container); }
.screen-body {
  display: grid;
  align-content: start;
  gap: 10px;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 12px;
}
.card {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 11px;
  background: var(--md-sys-color-surface);
}
.card h3 { font-size: 13px; font-weight: 650; }
.course {
  display: block;
  margin-top: 2px;
  font-size: 17px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.current { margin-top: 5px; color: var(--md-sys-color-on-surface-variant); font-size: 12px; overflow-wrap: anywhere; }
.meter { display: grid; gap: 5px; margin-top: 12px; }
.meter-label { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; font-size: 12px; }
progress {
  display: block;
  width: 100%;
  height: 7px;
  appearance: none;
  border: 0;
  border-radius: 999px;
  background: var(--md-sys-color-surface-container-highest);
  accent-color: var(--md-sys-color-primary);
}
progress::-webkit-progress-bar { border-radius: 999px; background: var(--md-sys-color-surface-container-highest); }
progress::-webkit-progress-value { border-radius: 999px; background: var(--md-sys-color-primary); }
progress::-moz-progress-bar { border-radius: 999px; background: var(--md-sys-color-primary); }
.entries { margin-top: 6px; }
.scan-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 30px 12px 34px;
}
.scan-spinner {
  width: 30px; height: 30px; border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
  border-top-color: var(--md-sys-color-primary);
  animation: scan-spin 0.9s linear infinite;
}
@keyframes scan-spin { to { transform: rotate(360deg); } }
.scan-title { margin: 0; font-size: 13px; font-weight: 600; }
.scan-progress {
  width: min(240px, 80%); height: 6px; border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent);
  overflow: hidden;
}
.scan-progress-fill {
  height: 100%; width: 0; border-radius: 999px;
  background: var(--md-sys-color-primary);
  transition: width 0.25s ease;
}
.scan-count { margin: 0; font-size: 12px; color: var(--md-sys-color-on-surface-variant); }
.row, .log { display: grid; align-items: baseline; column-gap: 9px; }
.row {
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 6px 0;
  font-size: 13px;
}
.row + .row { border-top: 1px solid var(--md-sys-color-outline-variant); }
.row:last-child { padding-bottom: 0; }
.row span, .log span { overflow-wrap: anywhere; }
.row .numeric { color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
.job-status { padding: 1px 6px; border-radius: 999px; background: var(--md-sys-color-surface-container); font-size: 11px; }
.job-status.green { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.job-status.blue { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
.log { grid-template-columns: 8ch minmax(0, 1fr); padding: 2px 0; font-size: 12px; }
.log time, .empty { color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
footer {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
}
.result-totals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.result-totals div { padding: 8px; border-radius: 8px; background: var(--md-sys-color-surface-container); text-align: center; }
.result-totals .green { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.result-totals .amber { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
.result-totals .red { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.result-totals dt { font-size: 12px; }
.result-totals dd { font-size: 22px; font-weight: 680; }
.result-details { display: grid; gap: 9px; }
.result-detail + .result-detail { padding-top: 9px; border-top: 1px solid var(--md-sys-color-outline-variant); }
.result-detail p { margin-top: 3px; white-space: pre-line; overflow-wrap: anywhere; color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
.ended { padding: 0 2px; color: var(--md-sys-color-on-surface-variant); font-size: 12px; }

.tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 10px;
  background: var(--md-sys-color-surface-container-highest);
}
.tab { border-color: transparent; background: transparent; color: var(--md-sys-color-on-surface-variant); }
.tab[aria-selected="true"] {
  border-color: var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-weight: 650;
}
.pane { display: grid; gap: 12px; }
.setting-hint { color: var(--md-sys-color-on-surface-variant); font-size: 12px; font-weight: 400; }
.pane label { display: grid; gap: 4px; font-size: 13px; font-weight: 550; }
.pane textarea {
  width: 100%;
  min-height: 62px;
  padding: 6px 8px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 7px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-weight: 400;
  resize: vertical;
}
.pane select, .pane input:not([type="checkbox"]) {
  width: 100%;
  min-height: 36px;
  padding: 6px 8px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 7px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-weight: 400;
}
.pane .check { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.check input { width: 16px; height: 16px; margin: 0; accent-color: var(--md-sys-color-primary); }
.form-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.advanced {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 9px;
}
.advanced summary { padding: 8px 10px; cursor: pointer; font-weight: 650; }
.advanced-content { display: grid; gap: 10px; padding: 0 10px 10px; }
.sample-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 10px; }
.sampling-settings {
  display: grid;
  min-width: 0;
  gap: 8px;
  margin: 0;
  padding: 8px 10px 10px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 8px;
}
.sampling-settings legend { padding: 0 4px; font-size: 13px; font-weight: 650; }
#aiState { font-size: 12px; }
.toast {
  position: fixed;
  bottom: max(16px, 8vh);
  left: 50%;
  z-index: 2147483647;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100vw - 24px);
  padding: 9px 13px;
  border-inline-start: 3px solid currentColor;
  border-radius: 9px;
  pointer-events: none;
  overflow-wrap: anywhere;
}
@media (max-width: 359px) {
  .heading { padding-inline: 9px; gap: 5px; }
  .brand { gap: 5px; }
  .brand .mark { width: 25px; height: 25px; }
  .header-actions { gap: 0; }
  .header-actions button { padding-inline: 5px; }
}
</style>
<div class="dock">
  <button type="button" class="pill" id="pill" aria-controls="panel" aria-expanded="false">
    ${MARK}<span>头歌自动答题助手</span><span id="pillCount" class="numeric"></span>
  </button>
  <section class="panel" id="panel" aria-labelledby="panelTitle" tabindex="-1" hidden>
    <header class="heading" id="handle">
      <div class="brand">
        ${MARK}<div class="brand-title"><h2 id="panelTitle">头歌自动答题助手</h2><span class="version">v${VERSION}</span></div>
      </div>
      <span class="phase" id="status" role="status"></span>
      <div class="header-actions">
        <button type="button" id="gear" aria-controls="settings" aria-expanded="false">设置</button>
        <button type="button" class="collapse" id="hide" aria-label="收起面板" title="收起面板">−</button>
      </div>
    </header>

    <div class="screen" id="work">
      <div class="screen-body">
        <section class="card">
          <h3 class="muted">当前课程</h3>
          <strong class="course" id="course"></strong>
          <p class="current" id="current"></p>
          <div class="meter">
            <div class="meter-label"><span>通过进度</span><span class="numeric muted" id="metric"></span></div>
            <progress id="bar" aria-label="通过进度"></progress>
          </div>
        </section>
        <section class="card">
          <h3>作业队列</h3>
          <div class="scan-state" id="scanState" hidden>
            <div class="scan-spinner" role="status" aria-label="正在获取题目列表"></div>
            <p class="scan-title" id="scanTitle">正在获取完整题目列表…</p>
            <div class="scan-progress" id="scanBar" role="progressbar"
                 aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div class="scan-progress-fill" id="scanFill"></div>
            </div>
            <p class="scan-count" id="scanCount">准备中…</p>
          </div>
          <div class="entries" id="rows"></div>
        </section>
        <section class="card">
          <h3 id="logTitle">运行日志</h3>
          <div class="entries" id="logs" role="log" aria-labelledby="logTitle" aria-live="off"></div>
        </section>
      </div>
      <footer>
        <button type="button" id="stop">停止</button>
        <button type="button" class="main" id="start">开始作答</button>
      </footer>
    </div>

    <div class="screen" id="summary" hidden>
      <div class="screen-body">
        <section class="card" aria-label="结果汇总">
          <dl class="result-totals numeric">
            <div class="green"><dt>已通过</dt><dd id="passedCount"></dd></div>
            <div class="amber"><dt>跳过</dt><dd id="skippedCount"></dd></div>
            <div class="red"><dt>未通过</dt><dd id="failedCount"></dd></div>
          </dl>
          <div class="meter">
            <div class="meter-label"><span id="rate"></span></div>
            <progress id="resultBar" aria-label="通过率"></progress>
          </div>
        </section>
        <section class="card result-details" aria-label="关卡明细">
          <div class="result-detail"><h3 class="green">已通过</h3><p id="passedList"></p></div>
          <div class="result-detail"><h3 class="amber">跳过</h3><p id="skippedList"></p></div>
          <div class="result-detail"><h3 class="red">未通过</h3><p id="failedList"></p></div>
        </section>
        <p class="ended" id="ended"></p>
      </div>
      <footer>
        <button type="button" id="again">再来一次</button>
        <button type="button" class="main" id="retry">重试未通过</button>
      </footer>
    </div>

    <div class="screen" id="settings" hidden>
      <div class="screen-body">
        <div class="tabs" role="tablist" aria-label="设置分类">
          <button type="button" class="tab" id="tab-general" role="tab" aria-controls="pane-general" aria-selected="true">常规</button>
          <button type="button" class="tab" id="tab-ai" role="tab" aria-controls="pane-ai" aria-selected="false" tabindex="-1">AI 配置</button>
        </div>
        <div id="pane-general" role="tabpanel" aria-labelledby="tab-general">
          <form class="card pane" id="generalForm" novalidate>
            <label>作答延时
              <select id="delay" name="delay">
                <option value="1">1 秒</option><option value="3">3 秒</option>
                <option value="5">5 秒</option><option value="10">10 秒</option>
              </select>
            </label>
            <label>代码题失败后重试
              <select id="codeRetries" name="codeRetries" aria-describedby="retryHint">
                <option value="0">不重试</option><option value="1">1 次</option>
                <option value="2">2 次</option><option value="3">3 次</option><option value="4">4 次</option>
              </select>
              <span class="setting-hint" id="retryHint">首次尝试之外的次数。重试时会参考上一轮评测反馈。</span>
            </label>
            <label>日志显示条数
              <select id="logRows" name="logRows">
                <option value="6">6 条</option><option value="12">12 条</option>
                <option value="24">24 条</option><option value="40">40 条</option>
              </select>
            </label>
            <label class="check"><input type="checkbox" id="auto" name="auto">打开页面自动开始</label>
            <label class="check"><input type="checkbox" id="titleProgress" name="titleProgress">在浏览器标签页显示进度</label>
            <label class="check"><input type="checkbox" id="aiFallback" name="aiFallback">参考答案/用例缺失时允许模型兜底</label>
            <p class="setting-hint">代码题优先用平台下发的参考答案和全部用例作答；勾选后，两者都拿不到才会调用模型。</p>
            <div class="form-actions">
              <button type="button" id="resetGeneral">恢复默认</button>
              <button type="submit" class="main" id="save">保存</button>
            </div>
          </form>
        </div>
        <div id="pane-ai" role="tabpanel" aria-labelledby="tab-ai" hidden>
          <form class="card pane" id="aiForm" novalidate>
            <label>接口地址<input id="aiBase" name="base" inputmode="url" placeholder="https://api.deepseek.com/v1"></label>
            <label>API Key<input id="aiKey" name="key" type="password" autocomplete="off" placeholder="sk-..."></label>
            <label>模型<input id="aiModel" name="model" placeholder="deepseek-v4-pro"></label>
            <label class="check"><input type="checkbox" id="aiVision" name="vision">图片理解（需要视觉模型）</label>
            <p class="setting-hint">开启后会带登录态下载题干图片，作为图片输入发给模型。模型必须支持视觉，例如 qwen-vl-max、gpt-4o。</p>
            <details class="advanced" id="aiAdvanced">
              <summary>高级设置</summary>
              <div class="advanced-content">
                <p class="setting-hint">不懂勿动</p>
                <div class="sample-grid">
                  <label>最大 Token<input id="aiTokens" name="maxTokens" type="number" min="1" max="393216" step="1"></label>
                  <label>请求超时（秒）<input id="aiTimeout" name="timeout" type="number" min="15" max="600" step="1"></label>
                  <label>深度思考
                    <select id="aiThinking" name="thinking">
                      <option value="auto">自动</option><option value="on">启用</option><option value="off">关闭</option>
                    </select>
                  </label>
                  <label>思考等级
                    <select id="aiThinkLevel" name="thinkLevel">
                      <option value="low">低</option><option value="medium">中</option><option value="high">高</option>
                    </select>
                  </label>
                </div>
                <fieldset class="sampling-settings" aria-describedby="samplingHint">
                  <legend>采样与惩罚</legend>
                  <p id="samplingHint" class="setting-hint" hidden></p>
                  <div class="sample-grid" id="samplingFields">
                    <label id="samplingChoice">采样方式
                      <select id="aiSampling" name="sampling">
                        <option value="temperature">温度</option><option value="topP">top_p</option>
                      </select>
                    </label>
                    <label id="temperatureField">温度<input id="aiTemperature" name="temperature" type="number" min="0" max="2" step="0.01"></label>
                    <label id="topPField">top_p<input id="aiTopP" name="topP" type="number" min="0.01" max="1" step="0.01"></label>
                  </div>
                  <div class="sample-grid" id="penaltyFields">
                    <label>频率惩罚<input id="aiFreq" name="frequencyPenalty" type="number" min="-2" max="2" step="0.1"></label>
                    <label>存在惩罚<input id="aiPres" name="presencePenalty" type="number" min="-2" max="2" step="0.1"></label>
                  </div>
                </fieldset>
                <label>JSON 输出
                  <select id="aiJsonMode" name="jsonMode">
                    <option value="auto">自动</option><option value="on">启用</option><option value="off">关闭</option>
                  </select>
                </label>
                <label>额外请求体（JSON）
                  <textarea id="aiExtra" name="extraBody" spellcheck="false"></textarea>
                </label>
                <label>附加提示词
                  <textarea id="aiPrompt" name="extraPrompt"></textarea>
                </label>
                <div class="form-actions"><button type="button" id="clearTpl">清除模板缓存</button></div>
              </div>
            </details>
            <p id="aiState" class="muted" role="status"></p>
            <div class="form-actions">
              <button type="button" id="resetAi">恢复默认</button>
              <button type="button" id="testAi">测试连接</button>
              <button type="submit" class="main" id="saveAi">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</div>
<div id="toast" class="toast" role="status" hidden></div>`;

  /* ============================================================
   * 悬浮窗 —— 位置、拖动与键盘交互
   * ========================================================== */
  const DOCK_KEY = 'tg.pos.v7';
  const EDGE = 10;

  function fitAxis(position, viewportSize, size) {
    return Math.min(Math.max(EDGE, position), Math.max(EDGE, viewportSize - size - EDGE));
  }

  const Dock = {
    mount(ui, onOpen) {
      this.root = ui.querySelector('.dock');
      this.pill = ui.getElementById('pill');
      this.panel = ui.getElementById('panel');
      this.position = this.readPosition();
      this.bindDrag(this.pill, this.root);
      this.bindDrag(ui.getElementById('handle'), this.panel);
      this.pill.addEventListener('click', onOpen);
      ui.getElementById('hide').addEventListener('click', () => this.close());
      this.panel.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        this.close();
      });
      window.addEventListener('resize', () => this.align());
      if (typeof ResizeObserver === 'function') {
        this.observer = new ResizeObserver(() => this.align());
        this.observer.observe(this.pill);
        this.observer.observe(this.panel);
      }
      this.align();
    },
    readPosition() {
      try {
        const position = JSON.parse(localStorage.getItem(DOCK_KEY) || 'null');
        if (Number.isFinite(position?.x) && Number.isFinite(position?.y)) return position;
      } catch { /* 用默认位置 */ }
      return null;
    },
    place(element, x, y) {
      const left = fitAxis(x, window.innerWidth, element.offsetWidth);
      const top = fitAxis(y, window.innerHeight, element.offsetHeight);
      element.style.left = `${Math.round(left)}px`;
      element.style.top = `${Math.round(top)}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    },
    isOnLeft(rect) {
      return rect.left + rect.width / 2 < window.innerWidth / 2;
    },
    align() {
      if (this.dragging) return;
      if (this.position) this.place(this.root, this.position.x, this.position.y);
      if (this.panel.hidden) return;
      const anchor = this.pill.getBoundingClientRect();
      const left = this.isOnLeft(anchor) ? anchor.left : anchor.right - this.panel.offsetWidth;
      this.place(this.panel, left, anchor.top);
    },
    open() {
      this.pill.setAttribute('aria-expanded', 'true');
      this.panel.hidden = false;
      this.align();
      this.panel.focus({ preventScroll: true });
    },
    close() {
      this.panel.hidden = true;
      this.pill.setAttribute('aria-expanded', 'false');
      this.align();
      this.pill.focus({ preventScroll: true });
    },
    snap(element) {
      const rect = element.getBoundingClientRect();
      const x = this.isOnLeft(rect) ? EDGE : window.innerWidth - this.pill.offsetWidth - EDGE;
      this.position = { x: Math.max(EDGE, x), y: rect.top };
      this.align();
      try {
        localStorage.setItem(DOCK_KEY, JSON.stringify(this.position));
      } catch { /* 保留本次的位置 */ }
    },
    bindDrag(handle, element) {
      let drag;
      let suppressClick = false;
      const fromPill = handle === this.pill;

      const move = event => {
        if (event.pointerId !== drag?.id) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
        drag.moved = true;
        this.dragging = true;
        element.classList.add('is-dragging');
        this.place(element, drag.left + dx, drag.top + dy);
      };

      const finish = event => {
        if (event.pointerId !== drag?.id) return;
        document.removeEventListener('pointermove', move, true);
        document.removeEventListener('pointerup', finish, true);
        document.removeEventListener('pointercancel', finish, true);
        const moved = drag.moved;
        drag = null;
        if (!moved) return;
        element.classList.remove('is-dragging');
        this.dragging = false;
        suppressClick = fromPill;
        this.snap(element);
      };

      handle.addEventListener('pointerdown', event => {
        if (drag || this.dragging || !event.isPrimary || event.button !== 0) return;
        if (!fromPill && event.target.closest('button')) return;
        const rect = element.getBoundingClientRect();
        suppressClick = false;
        drag = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          left: rect.left,
          top: rect.top,
          moved: false,
        };
        document.addEventListener('pointermove', move, true);
        document.addEventListener('pointerup', finish, true);
        document.addEventListener('pointercancel', finish, true);
      });

      if (fromPill) {
        handle.addEventListener('click', event => {
          if (suppressClick && event.detail > 0) event.stopImmediatePropagation();
          suppressClick = false;
        }, true);
      }
    },
  };

  /* ============================================================
   * View —— 状态展示与控件绑定
   * ========================================================== */
  const PHASE_LABEL = {
    idle: '待开始',
    scanning: '扫描中',
    countdown: '即将开始',
    running: '运行中',
    paused: '已暂停',
    done: '已结束',
  };

  const SettingsPanel = {
    mount(ui, notify, returnToWork) {
      this.ui = ui;
      this.notify = notify;
      const $ = id => ui.getElementById(id);
      this.general = $('generalForm');
      this.ai = $('aiForm');
      for (const id of ['aiBase', 'aiModel', 'aiThinking', 'aiSampling']) {
        $(id).addEventListener('input', () => this.renderSampling());
      }
      this.general.onsubmit = event => {
        event.preventDefault();
        if (this.locked) return;
        try {
          Prefs.save(this.read(this.general));
          this.write(this.general, Prefs.data);
          returnToWork();
          notify('常规设置已保存', 'green');
        } catch (error) {
          notify(`保存失败：${error.message}`, 'red');
        }
      };
      this.ai.onsubmit = event => {
        event.preventDefault();
        if (this.locked || this.testing || !this.validateAi()) return;
        try {
          const saved = AiSettings.save(this.read(this.ai));
          this.write(this.ai, saved);
          this.renderSampling();
          this.renderAiState();
          const ready = AiSettings.ready(saved);
          notify(ready ? 'AI 设置已保存' : '已保存，请补全 AI 配置', ready ? 'green' : 'amber');
        } catch (error) {
          if (error.message.startsWith('额外请求体')) this.revealField($('aiExtra'));
          notify(`保存失败：${error.message}`, 'red');
        }
      };
      $('resetGeneral').onclick = () => this.restore(this.general, Prefs.defaults);
      $('resetAi').onclick = () => {
        this.restore(this.ai, AiSettings.defaults);
        this.renderSampling();
      };
      $('testAi').onclick = () => this.testAi();
      $('clearTpl').onclick = () => {
        TemplateCache.clear();
        notify('模板缓存已清除', 'green');
      };
      this.bindTabs(ui);
      this.load();
    },
    load() {
      this.write(this.general, Prefs.data);
      const config = AiSettings.load();
      const { flash, thinking } = AiSettings.modelOptions(config);
      // 旧版允许更低的 Flash top_p，表单显示与实际请求一致的下限。
      if (flash && thinking) config.topP = Math.max(0.95, config.topP);
      this.write(this.ai, config);
      this.renderSampling();
      this.renderAiState();
    },
    renderSampling() {
      const $ = id => this.ui.getElementById(id);
      const cfg = AiSettings.normalize(this.read(this.ai));
      const { deepSeek, flash, thinking, chooseSampler, sampler, penalties } = AiSettings.modelOptions(cfg);
      $('samplingFields').hidden = sampler === null;
      $('samplingChoice').hidden = !chooseSampler;
      $('temperatureField').hidden = sampler !== 'temperature';
      $('topPField').hidden = sampler !== 'topP';
      $('aiTopP').min = flash ? '0.95' : '0.01';
      $('penaltyFields').hidden = !penalties;
      const notes = [];
      if (flash) notes.push(thinking ? 'Flash 深度思考的 top_p 范围是 0.95–1.00。' : 'Flash 非思考模式使用固定采样。');
      else if (thinking) notes.push('深度思考模式由模型控制采样。');
      if (deepSeek) notes.push('DeepSeek 官方接口已停用两项惩罚。');
      else if (penalties) notes.push('代码生成的两项惩罚默认设为 0。');
      $('samplingHint').textContent = notes.join(' ');
      $('samplingHint').hidden = !notes.length;
    },
    read(form) {
      return Object.fromEntries([...form.elements].filter(field => field.name).map(field =>
        [field.name, field.type === 'checkbox' ? field.checked : field.value],
      ));
    },
    write(form, values) {
      for (const field of form.elements) {
        if (!field.name || !Object.hasOwn(values, field.name)) continue;
        if (field.type === 'checkbox') field.checked = values[field.name];
        else field.value = values[field.name];
      }
    },
    revealField(field) {
      if (field.closest('[hidden]')) return;
      const advanced = field.closest('details');
      if (advanced) advanced.open = true;
      field.focus();
    },
    validateAi() {
      const invalid = [...this.ai.elements].find(field => {
        if (field.type !== 'number' || field.closest('[hidden]')) return false;
        const { badInput, rangeUnderflow, rangeOverflow, stepMismatch } = field.validity;
        // 小数控件的步长仅用于步进，后端接收区间内的任意精度。
        return badInput || rangeUnderflow || rangeOverflow || (field.step === '1' && stepMismatch);
      });
      if (!invalid) return true;
      this.revealField(invalid);
      invalid.reportValidity();
      return false;
    },
    restore(form, defaults) {
      this.write(form, defaults);
      this.notify('已填入默认值，保存后生效');
    },
    sync(locked) {
      this.locked = locked;
      for (const id of ['save', 'resetGeneral', 'clearTpl']) this.ui.getElementById(id).disabled = locked;
      for (const id of ['saveAi', 'resetAi']) this.ui.getElementById(id).disabled = locked || Boolean(this.testing);
      const test = this.ui.getElementById('testAi');
      test.disabled = locked;
      test.setAttribute('aria-disabled', String(Boolean(this.testing)));
    },
    renderAiState() {
      const indicator = this.ui.getElementById('aiState');
      const ready = AiSettings.ready();
      indicator.textContent = this.testing ? '正在测试连接…' : ready ? 'AI 已配置' : 'AI 未配置';
      indicator.className = this.testing ? 'blue' : ready ? 'green' : 'amber';
    },
    async testAi() {
      if (this.locked || this.testing || !this.validateAi()) return;
      const config = AiSettings.normalize(this.read(this.ai));
      if (!AiSettings.ready(config)) {
        this.notify('先填地址、API Key 和模型', 'amber');
        return;
      }
      this.testing = true;
      this.sync(this.locked);
      this.renderAiState();
      try {
        const reply = await AiClient.test(config);
        this.notify(`连接正常：${reply.trim().slice(0, 16)}`, 'green');
      } catch (error) {
        if (error.message.startsWith('额外请求体')) this.revealField(this.ui.getElementById('aiExtra'));
        this.notify(`连接失败：${error.message}`, 'red');
      } finally {
        this.testing = false;
        this.sync(this.locked);
        this.renderAiState();
      }
    },
    bindTabs(ui) {
      const tabs = [...ui.querySelectorAll('[role="tab"]')];
      const select = selected => {
        for (const tab of tabs) {
          const active = tab === selected;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          ui.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
        }
      };
      for (const [index, tab] of tabs.entries()) {
        tab.onclick = () => select(tab);
        tab.onkeydown = event => {
          const nextIndex = {
            ArrowLeft: (index - 1 + tabs.length) % tabs.length,
            ArrowRight: (index + 1) % tabs.length,
            Home: 0,
            End: tabs.length - 1,
          }[event.key];
          if (nextIndex === undefined) return;
          event.preventDefault();
          const next = tabs[nextIndex];
          select(next);
          next.focus();
        };
      }
    },
  };

  function runProgress(state) {
    const { phase, cursor, queue, jobs, results } = state;
    const { passed, skipped, failed } = results;
    const settled = passed.length + skipped.length + failed.length;
    const recorded = candidate => candidate === cursor
      || (cursor.gameId != null && candidate.gameId === cursor.gameId && candidate.homeworkId === cursor.homeworkId);
    const current = phase === 'running' && cursor
      && ![passed, skipped, failed].some(items => items.some(recorded))
      ? cursor : null;
    const scheduled = jobs.reduce((sum, job) => sum + (Number(job.total) || 0), 0);
    const planned = Math.max(scheduled, queue.length + settled + Number(current !== null));
    return { current, planned, settled };
  }

  const View = {
    panelView: 'work',
    originalTitle: null,
    renderedTitle: null,
    build() {
      const host = document.createElement('tg-answer-assistant');
      const ui = host.attachShadow({ mode: 'open' });
      ui.innerHTML = PANEL_TEMPLATE;
      document.body.append(host);
      this.ui = ui;
      this.$ = id => ui.getElementById(id);
      Dock.mount(ui, () => this.openPanel());
      this.bindRunControls();
      SettingsPanel.mount(ui, (message, tone) => this.toast(message, tone), () => this.toggleSettings());
      this.$('gear').onclick = () => this.toggleSettings();
    },
    setView(view) {
      if (!['work', 'summary', 'settings'].includes(view) || this.panelView === view) return;
      this.panelView = view;
      this.render();
    },
    openPanel() {
      Dock.open();
      this.render();
      if (State.phase === 'idle' && !State.jobs.length) {
        Runner.scan().catch(error => Runner.log(`扫描失败：${error.message}`, 'amber'));
      }
    },
    toast(message, tone = 'blue') {
      const notice = this.$('toast');
      notice.textContent = message;
      notice.className = 'toast ' + tone;
      notice.hidden = false;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => { notice.hidden = true; }, 2200);
    },
    /** 把同一帧内的多次刷新合并成一次；渲染里会 replaceChildren，逐条刷会让界面抖。 */
    schedule() {
      if (this.pending) return;
      this.pending = raf(() => {
        this.pending = 0;
        this.render();
      });
    },
    render() {
      const $ = this.$;
      const phase = State.phase;
      const active = Runner.active();
      const { passed } = State.results;
      const { current, planned, settled } = runProgress(State);

      $('pillCount').textContent = `${passed.length}/${planned}`;
      const status = $('status');
      if (status.dataset.phase !== phase) {
        status.dataset.phase = phase;
        status.textContent = PHASE_LABEL[phase] || '';
      }
      for (const view of ['work', 'summary', 'settings']) {
        $(view).hidden = view !== this.panelView;
      }
      const inSettings = this.panelView === 'settings';
      $('gear').textContent = inSettings ? '返回' : '设置';
      $('gear').setAttribute('aria-expanded', String(inSettings));
      SettingsPanel.sync(active);

      if (phase === 'done') this.finishedAt ??= new Date().toLocaleTimeString('zh-CN', { hour12: false });
      else this.finishedAt = null;
      if (!$('panel').hidden) {
        if (this.panelView === 'work') this.renderWork(planned, active, current);
        if (this.panelView === 'summary' && phase === 'done') this.renderSummary(settled);
      }
      this.renderTitle(active && Prefs.data.titleProgress, passed.length, planned);
      Dock.align();
    },
    renderWork(planned, active, current) {
      const $ = this.$;
      const { phase, course, jobs, logs, results } = State;
      const scanning = phase === 'scanning';
      $('course').textContent = course.name || '未进入课程';
      $('current').hidden = !current;
      $('current').textContent = current ? this.currentLabel(current) : '';
      $('metric').textContent = `${results.passed.length}/${planned}`
        + (results.skipped.length ? ` · 跳过 ${results.skipped.length}` : '')
        + (results.failed.length ? ` · 未通过 ${results.failed.length}` : '');
      $('bar').max = Math.max(1, planned);
      $('bar').value = results.passed.length;

      // 扫描态与队列态互斥：正在取题目列表时不显示旧的作业行
      $('scanState').hidden = !scanning;
      $('rows').hidden = scanning;
      if (scanning) {
        this.renderScanState();
      } else {
        $('rows').replaceChildren(...(jobs.length
          ? jobs.map(job => this.jobRow(job, current))
          : [this.field('暂无作业', 'empty')]));
      }
      const recentLogs = logs.slice(-Prefs.data.logRows).map(([time, message, tone]) => {
        const row = document.createElement('div');
        row.className = 'log';
        const timestamp = document.createElement('time');
        timestamp.textContent = time;
        row.append(timestamp, this.field(message, tone));
        return row;
      });
      $('logs').replaceChildren(...(recentLogs.length ? recentLogs : [this.field('暂无日志', 'empty')]));

      $('start').textContent = phase === 'paused' ? '继续'
        : scanning ? '准备中…'
        : active ? '暂停' : '开始作答';
      $('start').disabled = scanning;
      $('stop').hidden = !Runner.busy();
    },
    /** 扫描态：转圈 + 文案 + 进度条，居中展示。 */
    renderScanState() {
      const $ = this.$;
      const { done, total } = State.scanProgress;
      const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
      $('scanTitle').textContent = total ? '正在获取完整题目列表' : '正在读取作业列表';
      $('scanCount').textContent = total ? `${done}/${total} 份作业` : '准备中…';
      $('scanFill').style.width = `${percent}%`;
      $('scanBar').setAttribute('aria-valuenow', String(percent));
    },
    renderSummary(settled) {
      const $ = this.$;
      const { passed, skipped, failed } = State.results;
      $('passedCount').textContent = passed.length;
      $('skippedCount').textContent = skipped.length;
      $('failedCount').textContent = failed.length;
      $('resultBar').max = Math.max(1, settled);
      $('resultBar').value = passed.length;
      $('rate').textContent = settled ? `通过率 ${(passed.length / settled * 100).toFixed(1)}%` : '暂无统计';
      $('passedList').textContent = passed.map(item => this.titleOf(item)).join('、') || '无';
      $('skippedList').textContent = this.grouped(skipped);
      $('failedList').textContent = this.grouped(failed);
      $('ended').textContent = `${this.finishedAt}　处理结束`;
    },
    renderTitle(active, passed, total) {
      const title = document.title;
      if (active) {
        if (title !== this.renderedTitle) this.originalTitle = title;
        this.renderedTitle = `[${passed}/${total}] ${this.originalTitle}`;
        if (title !== this.renderedTitle) document.title = this.renderedTitle;
      } else if (this.renderedTitle !== null) {
        if (title === this.renderedTitle) document.title = this.originalTitle;
        this.renderedTitle = null;
        this.originalTitle = null;
      }
    },
    field(text, className = '') {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    },
    jobRow(job, cursor) {
      const row = document.createElement('div');
      row.className = 'row';
      const current = cursor && String(cursor.homeworkId) === String(job.id);
      const done = job.status === 'done';
      const status = done ? '已通过' : current ? '进行中' : '待处理';
      const tone = done ? 'green' : current ? 'blue' : 'muted';
      row.append(
        this.field(job.name, current ? 'blue' : ''),
        this.field(`${job.passed}/${job.total}`, 'numeric'),
        this.field(status, `job-status ${tone}`),
      );
      return row;
    },
    currentLabel(item) {
      const job = this.jobName(item.homeworkId);
      return item.title ? `${job} · ${item.title}` : job;
    },
    jobName(homeworkId) {
      const job = State.jobs.find(item => String(item.id) === String(homeworkId));
      return job ? job.name : `作业 ${homeworkId}`;
    },
    titleOf(item) {
      return item.title || this.jobName(item.homeworkId);
    },
    grouped(items) {
      if (!items.length) return '无';
      const groups = new Map();
      for (const item of items) {
        const reason = item.reason || '未标注';
        if (!groups.has(reason)) groups.set(reason, []);
        groups.get(reason).push(this.titleOf(item));
      }
      return [...groups].map(([reason, names]) =>
        `${reason}（${names.length} 关）\n${names.slice(0, 4).join('、')}${names.length > 4 ? ' 等' : ''}`
      ).join('\n');
    },
    bindRunControls() {
      const $ = this.$;
      $('start').onclick = () => {
        if (State.phase === 'scanning') return;
        if (Runner.active()) { Runner.pause(); return; }
        Runner.start().catch(error => Runner.log(error.message, 'amber'));
      };
      $('stop').onclick = () => Runner.stop();
      $('again').onclick = () => { Runner.reset(); this.setView('work'); };
      $('retry').onclick = () => {
        const items = State.results.failed.slice();
        if (!items.length) { this.toast('没有未通过的关卡', 'amber'); return; }
        State.results.failed = [];
        State.queue = items.map(item => ({ ...item }));
        State.phase = 'running';
        this.setView('work');
        this.render();
        Runner.run(++State.token);
      };
    },
    toggleSettings() {
      if (this.panelView === 'settings') {
        this.setView(State.phase === 'done' ? 'summary' : 'work');
      } else {
        this.setView('settings');
      }
    },
    /** 页面切换只更新界面；自动开始由这里决定。 */
    tick() {
      const path = Route.path();
      if (path !== this.lastPath) {
        this.lastPath = path;
        this.render();
      }
      if (State.phase !== 'idle' || !Prefs.data.auto) return;
      if (this.seen === path) return;
      const usable = Route.isTask(path) || !!Route.courseId() || /^\/tasks\//.test(path);
      if (!usable || !this.$('settings').hidden) return;
      this.seen = path;
      Runner.start(true).catch(error => Runner.log(error.message, 'amber'));
    },
  };

  /* ============================================================
   * 启动
   * ========================================================== */
  function boot() {
    Prefs.load();
    View.build();
    View.lastPath = Route.path();
    View.render();
    View.tick();
    // 头歌是单页应用，切换页面不会触发 unload。
    // 宿主元素被移除（脚本失效或被替换）时自己收掉定时器，不留空转。
    const timer = setInterval(() => {
      if (!document.querySelector('tg-answer-assistant')) {
        clearInterval(timer);
        return;
      }
      View.tick();
    }, TIMING.uiTick);
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();

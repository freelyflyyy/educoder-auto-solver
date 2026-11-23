export const VERSION = '1.1.0';
export const API = 'https://data.educoder.net/api';
export const AK = 'e9dd5b4322f9f7d83d009de9bfa100c3';
export const SK = '2e3da06ae26ba9f76a5d8d355746f2fe';

/** Centralized polling, retry, and timeout thresholds (in milliseconds). */
export const TIMING = Object.freeze({
  poll: 1500,
  passTimeout: 25000,
  stepGap: 300,
  codeGradeTimeout: 120000,
  commitSettle: 4000,
  sourceAttempts: 2,
  retryGap: 3000,
  gradeBackoff: 6000,
  gradeAttempts: 8,
  httpRetryBackoff: 1500,
  httpTimeout: 30000,
  uiTick: 900,
  minEvalMs: 10000,
  scanConcurrency: 3,
  envStartAttempts: 4,
  envStartRetryGap: 20000,
  sshExecTimeout: 20000,
  sshGatewayPadding: 5000,
  sshConnectAttempts: 2,
  sshConnectRetryGap: 2000,
});

export const STORAGE_KEYS = Object.freeze({
  prefs: 'tg.prefs.v6',
  ai: 'tg.ai.v7',
  templates: 'tg.tpl.v1',
  dock: 'tg.pos.v7',
  zzud: 'tg.zzud',
});

export const MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true">'
  + '<rect class="mark-surface" x="2" y="2" width="60" height="60" rx="15"/>'
  + '<path class="mark-symbol" d="M32.74 12.50 Q32.74 14.67 33.28 15.84 Q33.82 17.00 34.70 17.53 '
  + 'Q35.58 18.06 37.27 18.66 Q42.00 20.29 43.74 23.05 Q45.47 25.80 45.47 29.71 '
  + 'Q45.47 33.26 43.45 36.83 L42.39 36.39 Q43.92 33.82 43.92 30.05 Q43.92 26.68 40.75 24.65 '
  + 'Q37.58 22.62 32.74 22.62 L32.74 43.50 Q32.74 46.58 29.85 49.04 Q26.97 51.50 23.52 51.50 '
  + 'Q21.17 51.50 19.85 50.39 Q18.53 49.27 18.53 47.31 Q18.53 44.23 21.42 41.77 '
  + 'Q24.30 39.31 27.77 39.31 Q29.63 39.31 30.87 40.06 L30.87 12.50 Z"/></svg>';

export const ERROR_TEXT = Object.freeze({
  401: '登录状态已过期，请刷新网页重新登录',
  '-102': '接口签名校验未通过，请刷新页面重试',
  '-2': '平台评测队列繁忙',
  '-1': '接口请求参数有误',
  404: '未找到该关卡或题目已下线',
  403: '无权访问该关卡（作业可能已截止或已关闭）',
});

export const PHASE_LABEL = Object.freeze({
  idle: '准备就绪',
  scanning: '正在扫描',
  countdown: '即将开始',
  running: '答题中',
  paused: '已暂停',
  done: '已完成',
});

export const MSG_LEVEL = Object.freeze({
  INFO: 'info',
  SUCCESS: 'success',
  WARN: 'warn',
  ERROR: 'error',
});

export const HOST_TAG = 'tg-answer-assistant';
export const DOCK_EDGE = 10;
export const LOG_CAPACITY = 40;

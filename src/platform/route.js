/**
 * URL route parser for extracting course, homework, and challenge identifiers.
 */
export const Route = {
  path() { return location.pathname.replace(/\/$/, ''); },
  courseId() {
    const hit = location.pathname.match(/^\/classrooms\/([^/]+)/);
    return hit ? hit[1] : '';
  },
  isTask(path = this.path()) { return /^\/tasks\/[^/]+\/[^/]+\/[^/]+\/?$/.test(path); },
  homeworkId() {
    const hit = location.pathname.match(/\/shixun_homework\/(\d+)/);
    if (hit) return Number(hit[1]);
    if (this.isTask()) {
      const id = Number(this.keyOf().homeworkId);
      return Number.isFinite(id) && id > 0 ? id : 0;
    }
    const queryId = Number(new URLSearchParams(location.search || '').get('homework_common_id'));
    return Number.isFinite(queryId) && queryId > 0 ? queryId : 0;
  },
  keyOf(url = location.href) {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'tasks' || parts.length < 3) throw new Error('不是关卡地址');
    const homeworkId = parsed.searchParams.get('homework_common_id') || (parts.length >= 4 ? parts[2] : '');
    return { gameId: parts[3] || parts[parts.length - 1], homeworkId, courseId: parts[1] };
  },
};

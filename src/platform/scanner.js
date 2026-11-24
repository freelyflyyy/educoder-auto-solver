import { abortError, isAbortError, norm } from '../core/utils.js';
import { Api } from './api.js';
import { Route } from './route.js';

/**
 * Course assignment and bidirectional challenge chain scanner.
 */
export function createScanner({ api = Api, route = Route } = {}) {
  return {
    /** Filters assignments that still have unfinished challenges. */
    open(works) {
      return works.filter(work => {
        const total = Number(work.challenge_count) || 0;
        const done = Number(work.finished_challenge_count) || 0;
        return total > 0 && done < total;
      });
    },
    /**
     * Traverses a challenge doubly-linked list (`prev_game` and `next_game`) concurrently
     * in both directions from the entry game and returns unpassed challenges in sequential order.
     */
    async chain(work, courseId, signal = null) {
      if (signal?.aborted) throw abortError();
      const entry = await api.entryGame(work.shixun_identifier, work.homework_id, signal);
      if (!entry) return [];

      const read = async gameId => {
        if (signal?.aborted) throw abortError();
        try {
          return await api.detail(gameId, work.homework_id, signal);
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) throw abortError();
          return null;
        }
      };

      const seed = String(entry);
      const entryDetail = await read(seed);
      if (!entryDetail) return [];

      const note = (gameId, detail) => ({ gameId, passed: detail?.game?.status === 2 });
      const walk = async (startCursor, field) => {
        const visited = new Set([seed]);
        const nodes = [];
        let cursor = startCursor;
        while (cursor && cursor !== 'null' && !visited.has(cursor)) {
          visited.add(cursor);
          const detail = await read(cursor);
          if (!detail) break;
          nodes.push(note(cursor, detail));
          cursor = detail?.[field] ? String(detail[field]) : '';
        }
        return nodes;
      };

      const prevStart = entryDetail?.prev_game ? String(entryDetail.prev_game) : '';
      const nextStart = entryDetail?.next_game ? String(entryDetail.next_game) : '';
      const [prevNodes, nextNodes] = await Promise.all([
        walk(prevStart, 'prev_game'),
        walk(nextStart, 'next_game'),
      ]);

      const seen = new Set();
      const ordered = [];
      for (const item of [...prevNodes.reverse(), note(seed, entryDetail), ...nextNodes]) {
        if (seen.has(item.gameId)) continue;
        seen.add(item.gameId);
        ordered.push(item);
      }

      return ordered
        .filter(item => !item.passed)
        .map(item => ({
          gameId: item.gameId,
          homeworkId: work.homework_id,
          courseId,
        }));
    },
    /** Resolves the list of target assignments covered by the current page route. */
    async homeworkList(courseId, signal = null) {
      if (route.isTask()) {
        const key = route.keyOf();
        const works = await api.homeworks(key.courseId, signal);
        const one = works.find(work => Number(work.homework_id) === Number(key.homeworkId));
        return one ? [one] : [];
      }
      const pinned = route.homeworkId();
      if (pinned) {
        const works = await api.homeworks(courseId, signal);
        return works.filter(work => Number(work.homework_id) === pinned);
      }
      if (courseId) return this.open(await api.homeworks(courseId, signal));
      throw new Error('请先打开班级作业列表页、作业详情页或任意关卡');
    },
    async courseName(courseId, signal = null) {
      if (!courseId) return '';
      try {
        const courses = await api.courses(signal);
        const hit = courses.find(course => course.identifier === courseId);
        return hit ? norm(hit.name) : courseId;
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw abortError();
        return courseId;
      }
    },
  };
}

export const Scanner = createScanner();

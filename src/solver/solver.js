import { Prefs } from '../config/prefs.js';
import { AiSettings } from '../config/ai-settings.js';
import { Api } from '../platform/api.js';
import { Model } from '../platform/model.js';
import { CodeGenerator } from '../ai/code-generator.js';
import { SshClient } from '../ssh/client.js';
import { createSshSession } from '../ssh/session.js';
import { AnswerSource } from './answer-source.js';
import { Evaluator } from './evaluator.js';
import { CHALLENGE_TYPE, classifyChallenge } from './classifier.js';
import { createJobSession } from './job-session.js';
import { unityStrategy } from './strategies/unity.js';
import { linuxEnvStrategy } from './strategies/linux-env.js';
import { choiceStrategy } from './strategies/choice.js';
import { codeStrategy } from './strategies/code.js';

/** Builds the default challenge-type strategy registry. */
export function createDefaultStrategies() {
  return {
    [CHALLENGE_TYPE.UNITY]: unityStrategy,
    [CHALLENGE_TYPE.LINUX_ENV]: linuxEnvStrategy,
    [CHALLENGE_TYPE.CHOICE]: choiceStrategy,
    [CHALLENGE_TYPE.CODE]: codeStrategy,
  };
}

/**
 * Challenge solver factory providing job-scoped isolated sessions (`openJob`)
 * as well as a self-disposing single-stage helper (`solve`).
 */
export function createSolver({
  api = Api,
  model = Model,
  answerSource = AnswerSource,
  evaluator = Evaluator,
  codeGenerator = CodeGenerator,
  sshClient = SshClient,
  prefs = Prefs,
  aiSettings = AiSettings,
  classify = classifyChallenge,
  strategies = null,
  createSsh = createSshSession,
} = {}) {
  const deps = { api, model, answerSource, evaluator, codeGenerator, sshClient, prefs, aiSettings };
  const registry = strategies
    ? { ...createDefaultStrategies(), ...strategies }
    : createDefaultStrategies();

  return {
    /** Opens a completely fresh, isolated solving session for a single homework/assignment. */
    openJob(job = null) {
      return createJobSession(job, {
        deps,
        strategies: registry,
        classify,
        createSsh,
      });
    },

    /** Convenience one-shot entrypoint that solves a single stage inside a freshly disposed session. */
    async solve(item, callbacks = {}) {
      const session = this.openJob(item ? { id: item.homeworkId } : null);
      try {
        return await session.solveStage(item, callbacks);
      } finally {
        await session.dispose({ log: callbacks.log });
      }
    },
  };
}

export const Solver = createSolver();

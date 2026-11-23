export class AiRequestError extends Error {
  constructor(message, retryable = true) {
    super(message);
    this.retryable = retryable;
  }
}

export class AiConnectionError extends AiRequestError {}

class BoundedFetchTimeoutError extends Error {
  constructor() { super("SUPABASE_TIMEOUT"); this.name = "BoundedFetchTimeoutError"; }
}

function createBoundedFetch(timeoutMs = 8000) {
  return async (input, init = {}) => {
    const controller = new AbortController();
    const callerSignal = init.signal;
    const forwardAbort = () => controller.abort(callerSignal?.reason);
    if (callerSignal?.aborted) forwardAbort();
    else callerSignal?.addEventListener("abort", forwardAbort, { once: true });
    const timer = setTimeout(() => controller.abort(new BoundedFetchTimeoutError()), timeoutMs);
    try { return await fetch(input, { ...init, signal: controller.signal }); }
    catch (error) {
      if (controller.signal.aborted && !callerSignal?.aborted) throw new BoundedFetchTimeoutError();
      throw error;
    } finally { clearTimeout(timer); callerSignal?.removeEventListener("abort", forwardAbort); }
  };
}

module.exports = { BoundedFetchTimeoutError, createBoundedFetch };

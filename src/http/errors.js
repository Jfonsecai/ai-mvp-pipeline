// COMP-003 API Boundary - final error handling (CR-005, CR-025).
// Express renders its own HTML error page, and on Vercel can leave the function in an undefined
// state, unless errors are handled. Every failure ends here as a CTR-001 JSON body.
import { Outcome } from '../shared/outcomes.js';

/** Unknown route or method: indistinguishable from any other NOT_FOUND (CR-006). */
export function notFound(_req, _res, next) {
  next(new Outcome('NOT_FOUND'));
}

/**
 * @param {{ logger: { error: Function }, logDetails: boolean }} options
 *   logDetails adds the error message to the log (development only: messages of driver errors
 *   can contain host names, so production logs carry the error name and code only, CR-020).
 */
export function createErrorHandler({ logger, logDetails }) {
  // Express identifies an error handler by its four parameters.
  // eslint-disable-next-line no-unused-vars
  return (error, _req, res, next) => {
    if (res.headersSent) return next(error);

    let outcome;
    if (error instanceof Outcome) {
      outcome = error;
    } else if (error?.expose === true && error.status >= 400 && error.status < 500) {
      // Malformed or oversized JSON body from the body parser: the client sent an invalid request.
      outcome = new Outcome('VALIDATION_FAILED');
    } else {
      outcome = new Outcome('UNEXPECTED');
      logger.error('request.unexpected_error', {
        errorName: error?.name,
        errorCode: typeof error?.code === 'string' ? error.code : undefined,
        ...(logDetails ? { errorMessage: error?.message } : {}),
      });
    }

    res.locals.outcome = outcome.code;
    res.status(outcome.status).json(outcome.toBody());
  };
}

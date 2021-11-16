// create blueprint for errors; cooperate with middleware handleErrors
export default class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

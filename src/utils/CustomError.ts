export class CustomError extends Error {
  status = 500;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

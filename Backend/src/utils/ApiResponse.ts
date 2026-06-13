export class ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    meta?: any,
  ) {
    this.success = success;
    this.message = message;
    if (data !== undefined) this.data = data;
    if (meta !== undefined) this.meta = meta;
  }

  static ok<T>(message: string, data?: T, meta?: any) {
    return new ApiResponse<T>(true, message, data, meta);
  }

  static created<T>(message: string, data?: T) {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string) {
    return new ApiResponse(false, message);
  }
}

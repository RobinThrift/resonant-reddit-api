export function ApiError(text, statusCode) {
    this.code = statusCode;
    this.message =`${statusCode}: ${text}`;
    this.name = 'ApiError';
    this.stack = (new Error()).stack;
}
ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

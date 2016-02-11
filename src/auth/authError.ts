export enum AUTH_ERRORS {
    ACCESS_DENIED,
    UNSUPPORTED_RESPONSE_TYPE,
    INVALID_SCOPE,
    INVALID_REQUEST,
    INCORRECT_STATE,
    UNKNOWN_ERROR
}

export function AuthError(error) {
    switch (error) {
        case 'access_denied':
            this.message = 'Access Denied';
            this.code = AUTH_ERRORS.ACCESS_DENIED;
            break;
        case 'unsupported_response_type':
            this.message = 'Unsupported Response Type';
            this.code = AUTH_ERRORS.UNSUPPORTED_RESPONSE_TYPE;
            break;
        case 'invalid_scope':
            this.message = 'Invalid Scope';
            this.code = AUTH_ERRORS.INVALID_SCOPE;
            break;
        case 'invalid_request':
            this.message = 'Invalid Request';
            this.code = AUTH_ERRORS.INVALID_REQUEST;
            break;
        case 'state':
            this.message = 'Incorrect State';
            this.code = AUTH_ERRORS.INCORRECT_STATE;
        default:
            this.message = error,
            this.code = AUTH_ERRORS.UNKNOWN_ERROR;
    }
    this.name = 'AuthError';
    this.stack = (new Error()).stack;
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;

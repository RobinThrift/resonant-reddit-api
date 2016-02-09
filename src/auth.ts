import {defaults} from 'lodash';
import {RequestConfig, defaultConfig} from './requestConfig';
import {Response} from './response';
import {List} from 'immutable';
import * as fetch from 'node-fetch';
import {stringify, extract, parse} from 'query-string';
import * as Random from 'random-js';

export type UserAuthConfig = {
    clientId: string,
    redirectUri: string,
    scope: string[],
    compact?: boolean,
    seed?: number
}

let randomEngine = Random.engines.mt19937();

export function getAuthorizationUrl(userAuthConfig: UserAuthConfig, userConfig = {}) {
    let config = defaults({}, defaultConfig, userConfig) as RequestConfig;

    let stateEngine = (userAuthConfig.seed) ? randomEngine.seed(userAuthConfig.seed) : randomEngine.autoSeed();
    stateEngine.discard(10);

    let state = Random.uuid4(stateEngine);

    let query = stringify({
        client_id: userAuthConfig.clientId,
        response_type: 'code',
        state,
        redirect_uri: userAuthConfig.redirectUri,
        duration: 'permanent'
    });

    return {
        url: `${config.baseUrl}${config.endpoints.auth}${(userAuthConfig.compact) ? '.compact' : ''}?${query}&scope=${userAuthConfig.scope.join(',')}`,
        state
    }
}


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

export function getToken(url: string, state: string) {
    let response = parse(extract(url));

    if (response.error) {
        return new AuthError(response.error);
    }

    if (response.state !== state) {
        return new AuthError('state');
    }

    return response.code;
}

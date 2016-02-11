import {defaults} from 'lodash';
import {RequestConfig, defaultConfig} from '../requestConfig';
import {Response} from '../response';
import {List} from 'immutable';
import * as base64 from 'base-64';
import {stringify, extract, parse} from 'query-string';
import * as Random from 'random-js';
import {AuthError} from './authError';

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

export function extractToken(url: string, state: string) {
    let response = parse(extract(url));

    if (response.error) {
        return new AuthError(response.error);
    }

    if (response.state !== state) {
        return new AuthError('state');
    }

    return response.code;
}

export function retrieveToken(fetchFn: Function, code: string, redirectUri: string, clientId: string, userConfig = {}) {
    let config = defaults({}, defaultConfig, userConfig) as RequestConfig;

    return new Promise((resolve, reject) => {
        fetchFn(`${config.baseUrl}${config.endpoints.accessToken}`, {
            headers: {
                Authorization: 'Basic ' + base64.encode(`${clientId}:`)
            },
            method: 'post',
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`
        })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                // @TODO(TokenRetrieval): Error Messages on failure
                response.text()
                    .then((body) => {
                        reject(new AuthError(body));
                    });
            }
        })
        .then((body) => {
            resolve({
                token: body.access_token,
                expiresIn: body.expires_in,
                refreshToken: body.refresh_token
            });
        })
        .catch(reject);
    });
}

export function refreshToken(fetchFn: Function, prevRefreshToken: string, clientId: string, userConfig = {}) {
    let config = defaults({}, defaultConfig, userConfig) as RequestConfig;

    return new Promise((resolve, reject) => {
        fetchFn(`${config.baseUrl}${config.endpoints.accessToken}`, {
            headers: {
                Authorization: 'Basic ' + base64.encode(`${clientId}:`)
            },
            method: 'post',
            body: `grant_type=refresh_token&refresh_token=${prevRefreshToken}`
        })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                // @TODO(TokenRefresh): Error Messages on failure
                response.text()
                    .then((body) => {
                        reject(new AuthError(body));
                    });
            }
        })
        .then((body) => {
            resolve({
                token: body.access_token,
                expiresIn: body.expires_in,
                refreshToken: body.refresh_token
            });
        })
        .catch(reject);
    });
}

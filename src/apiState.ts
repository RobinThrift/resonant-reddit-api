import {defaults} from 'lodash';
import {Config, defaultConfig} from './config';

export type ApiState = {
    config: Config,
    state: {
        lastRequest: number,
        token: string,
        refreshToken: string,
        tokenExpiresIn: number,
    }
}

export function setup(initState: ApiState): ApiState {
    return {
        config: defaults({}, defaultConfig, initState.config) as Config,
        state: initState.state || {
            lastRequest: 0,
            token: '',
            refreshToken: '',
            tokenExpiresIn: 0
        }
    };
}

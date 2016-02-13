import {ApiState} from './apiState';

export type Response<T, C> = {
    state: ApiState,
    data: T,
    config: C
}


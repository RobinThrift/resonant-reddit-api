import {List} from 'immutable';

export type Response<T> = {
    data: List<T>,
    next?: string,
    prev?: string
}

export type Response<T> = {
    data: T[],
    next?: string,
    prev?: string
}

export type RequestConfig = {
    baseUrl: string,
    authedBaseUrl: string
}

export let defaultConfig: RequestConfig = {
    baseUrl: 'https://www.reddit.com',
    authedBaseUrl: 'https://oauth.reddit.com'
};

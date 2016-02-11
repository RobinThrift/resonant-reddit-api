export type RequestConfig = {
    baseUrl: string,
    authedBaseUrl: string,
    endpoints: {
        auth: string,
        accessToken: string
    }
}

export let defaultConfig: RequestConfig = {
    baseUrl: 'https://www.reddit.com',
    authedBaseUrl: 'https://oauth.reddit.com',
    endpoints: {
        auth: '/api/v1/authorize',
        accessToken: '/api/v1/access_token'
    }
};

export type Config = {
    // user configurable
    clientId: string,
    scope: string[],

    // funcitonal config
    fetch?: Function,

    baseUrl: string,
    authedBaseUrl: string,
    endpoints: {
        auth: string,
        accessToken: string
    }
}

export let defaultConfig: Config = {
    clientId: '',
    scope: [],
    baseUrl: 'https://www.reddit.com',
    authedBaseUrl: 'https://oauth.reddit.com',
    endpoints: {
        auth: '/api/v1/authorize',
        accessToken: '/api/v1/access_token'
    }
};

import {assert} from 'chai';
import nock from 'nock';
import {getAuthorizationUrl, getToken, AuthError} from '../dist/auth';

suite('Resonant Reddit API - Auth', () => {
    test('getAuthorizationUrl', () => {
        assert.include(getAuthorizationUrl({
            clientId: 'CLIENT_ID',
            redirectUri: 'URI',
            seed: 100,
            scope: ['identity', 'subscribe']
        }), {
            url: 'https://www.reddit.com/api/v1/authorize?client_id=CLIENT_ID&duration=permanent&redirect_uri=URI&response_type=code&state=1f1f2762-5035-4503-b642-636435c99ee2&scope=identity,subscribe',
            state: '1f1f2762-5035-4503-b642-636435c99ee2'
        });

    });

    test('getToken', () => {
        assert.equal(getToken('https://RESPONSE_URI/auth?error=&code=CODE&state=RANDOM', 'RANDOM'), 'CODE', 'successful response');
        assert.throw(() => {
            throw getToken('https://RESPONSE_URI/auth?error=access_denied&code=CODE&state=RANDOM', 'RANDOM');
        }, AuthError, /Access Denied/, 'unsuccessful response');
    });
});

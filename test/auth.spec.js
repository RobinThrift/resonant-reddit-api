import {assert} from 'chai';
import fetch from 'node-fetch';
import nock from 'nock';
import {getAuthorizationUrl, extractToken, retrieveToken, refreshToken} from '../dist/auth';
import {AuthError} from '../dist/auth/authError';

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

    test('extractToken', () => {
        assert.equal(extractToken('https://RESPONSE_URI/auth?error=&code=CODE&state=RANDOM', 'RANDOM'), 'CODE', 'successful response');
        assert.throw(() => {
            throw extractToken('https://RESPONSE_URI/auth?error=access_denied&code=CODE&state=RANDOM', 'RANDOM');
        }, AuthError, /Access Denied/, 'unsuccessful response');
    });

    test('retrieveToken', (done) => {
        nock('https://www.reddit.com', {
                reqheaders: {
                    Authorization: 'Basic VEhJU19JU19BTl9FWEFNUExFX0NMSUVOVF9JRDo='
                }
            })
            .post('/api/v1/access_token', 'grant_type=authorization_code&code=CODE&redirect_uri=URI')
            .reply(200, {
                access_token: 'token',
                token_type: 'bearer',
                expires_in: 1455220028388,
                scope: 'identity,subscribe',
                refresh_token: 'refresh_token'
            });

        retrieveToken(fetch, 'CODE', 'URI', 'THIS_IS_AN_EXAMPLE_CLIENT_ID')
            .then((response) => {
                assert.include(response, {
                    token: 'token',
                    expiresIn: 1455220028388,
                    refreshToken: 'refresh_token'
                })
                done();
            })
            .catch(done);
    });
    // @TEST(TokenRetrieval): Error Handling

    test('refreshToken', (done) => {
        nock('https://www.reddit.com', {
                reqheaders: {
                    Authorization: 'Basic VEhJU19JU19BTl9FWEFNUExFX0NMSUVOVF9JRDo='
                }
            })
            .post('/api/v1/access_token', 'grant_type=refresh_token&refresh_token=refresh_token')
            .reply(200, {
                access_token: 'token',
                token_type: 'bearer',
                expires_in: 1455220028389,
                scope: 'identity,subscribe',
                refresh_token: 'new_refresh_token'
            });

        refreshToken(fetch, 'refresh_token', 'THIS_IS_AN_EXAMPLE_CLIENT_ID')
            .then((response) => {
                assert.include(response, {
                    token: 'token',
                    expiresIn: 1455220028389,
                    refreshToken: 'new_refresh_token'
                })
                done();
            })
            .catch(done);
    });
    // @TEST(TokenRefresh): Error Handling
});


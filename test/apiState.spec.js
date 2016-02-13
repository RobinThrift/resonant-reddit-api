import {assert} from 'chai';
import {setup} from '../dist/apiState';
import {defaultConfig} from '../dist/config';
import {defaults} from 'lodash';

suite('Resonant Reddit API - ApiState', () => {
    test('setup(), from none', () => {
        let apiState = setup({
            config: {
                clientId: 'EXAMPLE_CLIENT_ID',
                scope: ['identity', 'subscribed']
            }
        })

        assert.include(apiState.state, {
            lastRequest: 0,
            token: '',
            refreshToken: '',
            tokenExpiresIn: 0
        });

        assert.include(apiState.config,
            defaults({}, defaultConfig, {
                clientId: 'EXAMPLE_CLIENT_ID',
                scope: ['identity', 'subscribed']
            })
        );
    });

    test('setup(), from existing', () => {
        let apiState = setup({
            config: {
                clientId: 'EXAMPLE_CLIENT_ID',
                scope: ['identity', 'subscribed']
            },
            state: {
                lastRequest: 1451675725,
                token: 'token',
                refreshToken: 'refresh_token',
                tokenExpiresIn: 1451675726
            }
        })

        assert.include(apiState.state, {
            lastRequest: 1451675725,
            token: 'token',
            refreshToken: 'refresh_token',
            tokenExpiresIn: 1451675726
        });

        assert.include(apiState.config,
            defaults({}, defaultConfig, {
                clientId: 'EXAMPLE_CLIENT_ID',
                scope: ['identity', 'subscribed']
            })
        );
    });
});

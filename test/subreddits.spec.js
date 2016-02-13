import {assert} from 'chai';
import {getFixture} from './helper';
import fetch from 'node-fetch';
import nock from 'nock';
import {getSubreddits, SUBREDDIT_LISTS} from '../dist/subreddits';
import {setup} from '../dist/apiState';

suite('Resonant Reddit API - Subreddits', () => {
    let apiState;

    suiteSetup(() => {
        apiState = setup({config: {fetch}});
    });

    test('getSubreddits(popular)', (done) => {
        nock('https://www.reddit.com')
            .get('/subreddits/popular.json')
            .reply(200, getFixture('subreddits_popular.json', true));

        getSubreddits(apiState, {listType: SUBREDDIT_LISTS.POPULAR})
            .then(({state, config, data}) => {
                
                assert.isNull(config.prev);
                assert.equal(config.next, 't5_2sqho');
                assert.equal(data.size, 25);
                assert.include(data.toJS()[0], {
                    displayName: 'AskReddit',
                    name: 't5_2qh1i',
                    id: '2qh1i',
                    title: 'Ask Reddit...'
                });
                done();
            })
            .catch(done);
    });

    test('get default subreddits http error', (done) => {
        nock('https://www.reddit.com')
            .get('/subreddits/default.json')
            .reply(404, { 'error': 404 });

        getSubreddits(apiState, {listType: SUBREDDIT_LISTS.DEFAULT})
            .catch((error) => {
                assert.equal(error.message, '404: Not Found');
                done();
            })
            .catch(done);
    });

    // @TEST(GetSubreddits): more tests, more cases, more errors, etc
});

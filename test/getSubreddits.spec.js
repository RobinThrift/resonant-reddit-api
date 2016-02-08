import {expect, assert} from 'chai';
import {getFixture} from './helper';
import nock from 'nock';
import {getList, SUBREDDIT_LISTS} from '../dist/subreddits';

suite('Resonant Reddit API - Subreddits', () => {
    test('get popular subreddits', (done) => {
        nock('https://www.reddit.com')
            .get('/subreddits/popular.json')
            .reply(200, getFixture('subreddits_popular.json', true));

        getList(SUBREDDIT_LISTS.POPULAR)
            .then((list) => {
                assert.isNull(list.prev);
                assert.equal(list.next, 't5_2sqho');
                assert.equal(list.data.size, 25);
                assert.include(list.data.toJS()[0], {
                    displayName: 'AskReddit',
                    name: 't5_2qh1i',
                    id: '2qh1i',
                    title: 'Ask Reddit...'
                });
                done();
            }).catch(done);
    });

    test('get default subreddits http error', (done) => {
        nock('https://www.reddit.com')
            .get('/subreddits/default.json')
            .reply(404, { 'error': 404 });

        getList( SUBREDDIT_LISTS.DEFAULT)
            .catch((error) => {
                assert.equal(error.message, '404: Not Found');
                done();
            })
            .catch(done);
    });
});

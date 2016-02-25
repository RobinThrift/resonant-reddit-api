import {assert} from 'chai';
import {getFixture} from './helper';
import fetch from 'node-fetch';
import nock from 'nock';
import {getPosts, getPost, getComments} from '../dist/posts';
import {setup} from '../dist/apiState';
import {List} from 'immutable';

suite('Resonant Reddit API - Posts', () => {
    let apiState;

    suiteSetup(() => {
        apiState = setup({config: {fetch}});
    });

    test('getPosts(funny), initial', async () => {
        nock('https://www.reddit.com')
            .get('/r/funny/hot.json?after=')
            .reply(200, getFixture('r_funny.json', true));

        let {state, config, data} = await getPosts(apiState, {subreddit: 'funny', list: 'hot'})
        assert.equal(config.after, 't3_41adpq', 'next item is correctly set');
        assert.throw(() => {
            data.get(0).title = 'testing';
        }, TypeError, /Cannot assign to read only property/, 'returned objects are frozen');
        assert.include(data.toJS()[0], {
            domain: 'reddit.com',
            id: '3z0d4r',
            author: 'funny_mod',
            score: 372,
            numComments: 46,
            created: 1451675725
        }, 'first item is correct object');
    });

    test('getPosts(funny), more', (done) => {
        nock('https://www.reddit.com')
            .get('/r/funny/hot.json?after=t3_41adpq')
            .reply(200, getFixture('r_funny_after_t3_41adpq.json', true));

        getPosts(apiState, {subreddit: 'funny', list: 'hot', after: 't3_41adpq'})
            .then(({state, config, data}) => {
                assert.equal(config.after, 't3_4191qy');
                assert.include(data.toJS()[0], {
                    domain: 'imgur.com',
                    id: '41e2td',
                    author: 'vivalapizza',
                    score: 181,
                    numComments: 1,
                    created: 1453075204
                });
                done();
            }).catch(done);
    });

    test('getPost(), successful', async () => {
        nock('https://www.reddit.com')
            .get('/r/funny/hot.json?after=')
            .reply(200, getFixture('r_funny.json', true));

        let {data} = await getPosts(apiState, {subreddit: 'funny', list: 'hot'})

        assert.include(getPost(data, '41dsl1'), { 
            title: 'Yes, I can see the future.',
            domain: 'i.imgur.com',
            id: '41dsl1',
            author: 'GonzoVeritas',
            score: 4941,
            numComments: 186,
            created: 1453070891,
            absoluteUrl: 'http://i.imgur.com/a1uVusI.gif',
            url: '/r/funny/comments/41dsl1/yes_i_can_see_the_future/',
            hint: 'image'
        });
    });

    test('getComments(), successful', async () => {
        nock('https://www.reddit.com')
            .get('/r/funny/comments/41dsl1/yes_i_can_see_the_future.json')
            .reply(200, getFixture('r_funny_41dsl1_comments.json', true));

        let {data} = await getComments(apiState, {postUrl: '/r/funny/comments/41dsl1/yes_i_can_see_the_future/'})

        assert.include(data.get(0), {
            author: 'koolerthanjinx',
            score: 1478,
            body: 'His palm was moving so fast of course the clairvoyant wouldn\'t be able to read it.',
            created: 1453076887,
            id: 'cz1lq2q'
        });

        assert.equal(data.get(0).replies.size, 3);
    });
});

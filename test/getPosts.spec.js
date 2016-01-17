import {expect} from 'chai';
import {getFixture} from './helper';
import nock from 'nock';
import {getPosts} from '../dist/posts';

suite('Resonant Reddit API - Posts', () => {
    test('get hot posts for subreddit', (done) => {
        nock('https://www.reddit.com')
            .get('/r/funny/hot.json?after=')
            .reply(200, getFixture('r_funny.json', true));

        getPosts('funny', 'hot')
            .then((list) => {
                expect(list.next).to.equal('t3_41adpq');
                expect(list.data[0]).to.contain({
                    domain: 'reddit.com',
                    id: '3z0d4r',
                    author: 'funny_mod',
                    score: 372,
                    numComments: 46,
                    created: 1451675725
                });
                done();
            }).catch(done);
    });

    test('get next hot posts for subreddit', (done) => {
        nock('https://www.reddit.com')
            .get('/r/funny/hot.json?after=t3_41adpq')
            .reply(200, getFixture('r_funny_after_t3_41adpq.json', true));

        getPosts('funny', 'hot', 't3_41adpq')
            .then((list) => {
                expect(list.next).to.equal('t3_4191qy');
                expect(list.data[0]).to.contain({
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
});

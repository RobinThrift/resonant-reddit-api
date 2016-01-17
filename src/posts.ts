import {defaults, map} from 'lodash';
import {RequestConfig, defaultConfig} from './requestConfig';
import {Response} from './response';
import * as fetch from 'node-fetch';

export type PostImageDescriptor = {
    url: string,
    width: number,
    height: number,
}

export type PostImages = {
    source: PostImageDescriptor
    resolutions: PostImageDescriptor[],
    variants: PostImageDescriptor,
    id: string
}

type PostAPIResponse = {
    title: string,
    domain: string,
    id: string,
    author: string,
    score: number,
    num_comments: number,
    created: number,
    selftext_html: string,
    selftext: string,
    hidden: boolean,
    stickied: boolean,
    is_self: boolean,
    permalink: string,
    url: string,
    link_flair_text: string,
    post_hint: string,
    preview: {
        images: PostImages[]
    },
    thumbnail: string
}

export type Post = {
    title: string,
    domain: string,
    id: string,
    author: string,
    score: number,
    numComments: number,
    created: number,
    textHML: string,
    text: string,
    hidden: boolean,
    sticky: boolean,
    selfPost: boolean,
    absoluteUrl: string,
    url: string,
    flair: string,
    hint: string,
    preview: {
        images: PostImages[]
    },
    thumbnail: string
}

function initPost(json: PostAPIResponse) {
    return {
        title: json.title,
        domain: json.domain,
        id: json.id,
        author: json.author,
        score: json.score,
        numComments: json.num_comments,
        created: json.created,
        textHML: json.selftext_html,
        text: json.selftext,
        hidden: json.hidden,
        sticky: json.stickied,
        selfPost: json.is_self,
        absoluteUrl: json.url,
        url: json.permalink,
        flair: json.link_flair_text,
        hint: json.post_hint,
        preview: json.preview,
        thumbnail: json.thumbnail
    };
}

export function getPosts(subreddit: string, list = 'hot', after = '', userConfig = {}) {
    let config = defaults({}, defaultConfig, userConfig) as RequestConfig;
    return new Promise<Response<Subreddit>>((resolve, reject) => {
        fetch(`${config.baseUrl}/r/${subreddit}/${list}.json?after=${after}`)
            .then((resp) => {
                if (resp.status === 200) {
                    return resp.json();
                } else {
                    reject(new Error(`${resp.status}: ${resp.statusText}`));
                }
            })
            .catch(reject)
            .then((posts) => {
                resolve({
                    prev: posts.data.before,
                    next: posts.data.after,
                    data: map(
                        map(posts.data.children, (post) => { return post.data; }),
                        initPost
                    )
                } as Response<Post>);
            });
    });
}

import {map} from 'lodash';
import {ApiState} from './apiState';
import {Response} from './response';
import {List} from 'immutable';
import {ApiError} from './apiError';

export type GetPostsConfig = {
    before?: string,
    after?: string,
    subreddit: string,
    list: string
}

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
};

function initPost(json: PostAPIResponse) {
    return Object.freeze({
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
    });
}

function transformResponse(response) {
    return List<Post>(map(
        map(response.data.children, (post) => { return post.data; }),
        initPost
    ));
}

export function getPosts(lastState: ApiState, listConfig: GetPostsConfig) {
    let {state, config} = lastState;
    let {fetch} = config;
    let {subreddit, list, after = ''} = listConfig;
    return new Promise<Response<List<Post>, GetPostsConfig>>((resolve, reject) => {
        fetch(`${config.baseUrl}/r/${subreddit}/${list}.json?after=${after}`)
            .then((resp) => {
                if (resp.status >= 200 && resp.status < 300) {
                    return resp.json();
                } else {
                    reject(new ApiError(resp.statusText, resp.status));
                }
            })
            .catch(reject)
            .then((response) => {
                resolve({
                    state: lastState,
                    data: transformResponse(response),
                    config: {
                        before: response.data.before,
                        after: response.data.after,
                        list,
                        subreddit
                    }
                });
            })
            .catch(reject);
    });
}

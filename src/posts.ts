import {map, assign, last, dropRight} from 'lodash';
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

export type GetCommentsConfig = {
    postUrl: string,
    before?: string,
    after?: string,
    sorting: string, // make intro string type (confidence, top, new, controversial, old, random, qa)
    showEdits: boolean,
    showMore: boolean,
    depth: number,
    limit: number,
    moreIds: string[],
    count: number
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


export type CommentAPIResponse = {
    kind: string,
    data: {
        children?: string[],
        count?: number,
        author: string,
        id: string,
        score: number,
        body: string,
        body_html: string,
        created: number,
        replies: {
            kind: string,
            data: {
                children: CommentAPIResponse[]
            }
        }
    }
}

export type Comment = {
    author: string,
    id: string,
    score: number,
    body: string,
    bodyHTML: string,
    created: number,
    replies: List<Comment | MoreComments>
}

export type MoreComments = {
    count: number,
    ids: string[]
}

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

function initComment(json: CommentAPIResponse): Comment | MoreComments {
    if (json.kind === 'more') {
        return Object.freeze({
            ids: json.data.children,
            count: json.data.count
        });
    }
    return Object.freeze({
        author: json.data.author,
        id: json.data.id,
        score: json.data.score,
        body: json.data.body,
        bodyHTML: json.data.body_html,
        created: json.data.created,
        replies: (json.data.replies.data) ? List<Comment>(map(json.data.replies.data.children, initComment)) : List<Comment>()
    });
}

function transformResponse<T>(response, initFn, extract = true) {
    return List<T>(map(
        (extract) ? map(response, (post) => { return post.data; }) : response,
        initFn
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
                    data: transformResponse<Post>(response.data.children, initPost),
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


export function getPost(posts: List<Post>, id: string): Post {
    return posts.find((post) => {
        return post.id === id;
    });
}

export function getComments(lastState: ApiState, commentConfig: GetCommentsConfig) {
    let {config} = lastState;
    let {fetch} = config;
    let postUrl = commentConfig.postUrl.replace(/\/$/, '.json');
    return new Promise<Response<List<Comment>, GetCommentsConfig>>((resolve, reject) => {
        fetch(`${config.baseUrl}${postUrl}`)
            .then((resp) => {
                if (resp.status >= 200 && resp.status < 300) {
                    return resp.json();
                } else {
                    reject(new ApiError(resp.statusText, resp.status));
                }
            })
            .catch(reject)
            .then((response) => {
                let {before, after} = response[1].data;
                let moreEntry = last(response[1].data.children).data;
                let moreIds = moreEntry.children;
                let count = moreEntry.count;
                resolve({
                    state: lastState,
                    data: transformResponse<Comment>(dropRight(response[1].data.children, 1), initComment, false),
                    config: assign({before, after, moreIds, count}, commentConfig)
                });
            })
            .catch(reject);
    });
}

//@FEAT(morechildren): implement more children api

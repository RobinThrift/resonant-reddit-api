import {defaults, map} from 'lodash';
import {RequestConfig, defaultConfig} from './requestConfig';
import {Response} from './response';
import * as fetch from 'node-fetch';

export const enum SUBREDDIT_LISTS {
    POPULAR,
    USER,
    NEW,
    DEFAULT
}

export type SubredditAPIResponse = {
    name: string,
    display_name: string,
    banner_img: string,
    header_img: string,
    id: string,
    title: string,
    header_title: string,
    public_description_html: string,
    public_description: string,
    description: string,
    description_html: string,
    subscribers: number,
    submit_text_label: string,
    url: string,
    user_is_subscriber?: boolean,
    suggested_comment_sort?: string,
    key_color: string,
    over18?: boolean
}

export type Subreddit = {
    name: string,
    displayName: string,
    bannerImg: string,
    headerImg: string,
    id: string,
    title: string,
    headerTitle: string,
    shortDescriptionHTML: string,
    shortDescription: string,
    fullDescription: string,
    fullDescriptionHTML: string,
    subscribers: number,
    submitLabel: string,
    url: string,
    isSubscribed?: boolean,
    suggestedCommentSort?: string,
    colour: string,
    adult?: boolean
}

function getListing(listing: SUBREDDIT_LISTS) {
    switch (listing) {
        case SUBREDDIT_LISTS.POPULAR:
            return 'popular';
        case SUBREDDIT_LISTS.USER:
            return 'user';
        case SUBREDDIT_LISTS.NEW:
            return 'new';
        case SUBREDDIT_LISTS.DEFAULT:
            return 'default';
    }
}

function fieldRenamer(json: SubredditAPIResponse): Subreddit {
    return {
        name: json.name,
        displayName: json.display_name,
        bannerImg: json.banner_img,
        headerImg: json.header_img,
        id: json.id,
        title: json.title,
        headerTitle: json.header_title,
        shortDescriptionHTML: json.public_description_html,
        shortDescription: json.public_description,
        fullDescription: json.description,
        fullDescriptionHTML: json.description_html,
        subscribers: json.subscribers,
        submitLabel: json.submit_text_label,
        url: json.url,
        isSubscribed: json.user_is_subscriber,
        suggestedCommentSort: json.suggested_comment_sort,
        colour: json.key_color,
        adult: json.over18
    };
}

export function getList(listing: SUBREDDIT_LISTS, userConfig = {}) {
    let config = defaults({}, defaultConfig, userConfig) as RequestConfig;
    return new Promise<Response<Subreddit>>((resolve, reject) => {
        fetch(`${config.baseUrl}/subreddits/${getListing(listing)}.json`)
            .then((resp) => {
                if (resp.status === 200) {
                    return resp.json();
                } else {
                    reject(new Error(`${resp.status}: ${resp.statusText}`));
                }
            })
            .catch(reject)
            .then((subreddits) => {
                resolve({
                    prev: subreddits.data.before,
                    next: subreddits.data.after,
                    data: map(
                        map(subreddits.data.children, (subreddit) => { return subreddit.data; }),
                        fieldRenamer
                    )
                } as Response<Subreddit>);
            });
    });
}

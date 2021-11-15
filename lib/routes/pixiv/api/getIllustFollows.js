import got from '../pixiv-got.js';
import {maskHeader} from '../constants.js';
import queryString from 'query-string';

/**
 * 获取用户关注的画师们的最新插画
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export default function getUserIllustFollows(token) {
    return got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v2/illust/follow',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            restrict: 'public',
        }),
    });
};
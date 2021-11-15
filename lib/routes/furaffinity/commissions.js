import got from '~/utils/got.js';

export default async (ctx) => {
    // 传入参数
    const username = String(ctx.params.username);

    const {
        data
    } = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}/commissions.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    ctx.state.data = {
        // 源标题
        title: `${username}'s Commissions`,
        // 源链接
        link: `https://www.furaffinity.net/commissions/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Commissions`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.title,
            // 正文
            description: `${item.description} <br> <img src="${item.submission.thumbnail}"> `,
            // 链接
            link: item.submission.link,
            // 作者
            author: username,
            // 由于源API未提供日期，故无pubDate
        })),
    };
};
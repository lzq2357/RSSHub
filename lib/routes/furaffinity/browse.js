import got from '~/utils/got.js';

export default async (ctx) => {
    // 传入参数
    const nsfw = String(ctx.params.nsfw);

    // 判断传入的参数nsfw
    let url = 'https://faexport.spangle.org.uk/browse.json?sfw=1';
    if (nsfw === '1') {
        url = 'https://faexport.spangle.org.uk/browse.json';
    }

    const {
        data
    } = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    ctx.state.data = {
        // 源标题
        title: `Fur Affinity Browse`,
        // 源链接
        link: `https://www.furaffinity.net/browse/`,
        // 源说明
        description: `Fur Affinity Browse`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.title,
            // 正文
            description: `<img src="${item.thumbnail}">`,
            // 链接
            link: item.link,
            // 作者
            author: item.name,
            // 由于源API未提供日期，故无pubDate
        })),
    };
};
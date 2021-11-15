import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

export default async (ctx) => {
    const {
        cid
    } = ctx.params;
    const base_url = `https://bbs.wenxuecity.com/?cid=${cid}/`;
    const {
        data
    } = await got({
        method: 'get',
        url: base_url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(data);
    const list = $('div.item');
    const out = list
        .slice(0, 10)
        .map(async (i, item) => {
            const link = url.resolve('https://bbs.wenxuecity.com/', $(item).find('div.title > a').attr('href'));
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got({
                    method: 'get',
                    url: link,
                    https: {
                        rejectUnauthorized: false,
                    },
                    headers: {
                        Referer: base_url,
                    },
                });
                const content = cheerio.load(result.data);
                return content('div#content').html();
            });
            const post = {
                title: $(item).find('div.title > a').text(),
                link,
                author: $(item).find('span.user > a').text(),
                description,
            };
            return post;
        })
        .get();
    ctx.state.data = {
        allowEmpty: true,
        title: $('title').text(),
        link: base_url,
        item: await Promise.all(out),
    };
};
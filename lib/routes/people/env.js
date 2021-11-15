import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';
import iconv from 'iconv-lite';

const host = 'http://env.people.com.cn';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const link = `http://env.people.com.cn/GB/${id}/index.html`;
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    response.data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(response.data);

    let title = $('div.clearfix.w1000_320.d2nav').text();
    title = title.replace(/ >> /g, '—');

    const list = $('div.headingNews div.hdNews.clearfix')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('strong > a').text(),
                link: $(this).find('strong > a').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const {
                title
            } = info;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(itemUrl, {
                responseType: 'buffer',
            });
            response.data = iconv.decode(response.data, 'gbk');

            const $ = cheerio.load(response.data);
            let date = $('.clearfix.w1000_320.text_title .box01 .fl').text().split(/\s+/);
            if (date.length > 0) {
                date = date[0].replace(/(年|月)/g, '/').replace('日', ' ') + ':00';
            } else {
                date = new Date();
            }
            const description = $('div#rwb_zw').html().trim();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
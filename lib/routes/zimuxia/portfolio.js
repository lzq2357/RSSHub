import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const rootUrl = 'http://zimuxia.cn';
    const currentUrl = `${rootUrl}/portfolio/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('a')
        .filter(function () {
            return $(this).attr('href').substr(0, 7) === 'magnet:';
        })
        .toArray()
        .reverse()
        .map((item) => {
            item = $(item);

            return {
                link: currentUrl,
                title: item.parent().text().split(' ')[0],
                description: `<p>${item.parent().html()}</p>`,
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
            };
        });

    ctx.state.data = {
        title: `${$('.content-page-title').text()} - FIX字幕侠`,
        link: currentUrl,
        item: items,
    };
};
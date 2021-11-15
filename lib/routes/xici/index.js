import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const host = 'http://www.xici.net/t/';

export default async (ctx) => {
    const {
        id = '..'
    } = ctx.params;

    const link = url.resolve(host, id);
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('a.actived').text();
    const out = $('ul.feed-list li[data-score]')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.title a').text(),
                link: 'http:' + $(this).find('div.title a').attr('href'),
                pubDate: $(this).find('span.time').attr('data-timeago'),
                author: $(this).find('a.board-link').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: `${title}-西祠胡同`,
        link,
        item: out,
    };
};
import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        name
    } = ctx.params;
    const url = `https://www.cyzone.cn/label/${encodeURIComponent(name)}/`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.article-item');
    const out = await Promise.all(
        list
            .map(async (index, elem) => {
                const $elem = $(elem);
                const $title = $elem.find('.item-title');
                const link = 'https:' + $title.attr('href');
                const pubDate = new Date(+$elem.find('.time').attr('data-time') * 1000).toUTCString();
                const item = {
                    title: $title.text(),
                    pubDate,
                    link,
                };
                const key = `cyzone-${link}`;
                const value = await ctx.cache.get(key);
                if (value) {
                    item.description = value;
                } else {
                    const {
                        data
                    } = await got.get(item.link);
                    const $ = cheerio.load(data);
                    $('.article-content img').each(function () {
                        const $img = $(this);
                        const src = $img.attr('src');

                        if (!src.startsWith('http')) {
                            $img.attr('src', 'https:' + src);
                        }
                    });
                    item.description = $('.article-content').html() || '内容已删除或未通过审核';
                    ctx.cache.set(key, item.description);
                }

                return item;
            })
            .get()
    );

    ctx.state.data = {
        title: `创业邦-#${name}#`,
        link: url,
        item: out,
    };
};
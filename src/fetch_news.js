const { fetch } = require('cross-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
const moment = require('moment');
moment().format('LLL');
module.exports = {
    gameSpot: async (limit) => {
        const gamespot = "https://www.gamespot.com/news/";

        return await fetch(gamespot).then(async (v) => {
            var links = [];
            const $ = cheerio.load(await v.text(), { _useHtmlParser2: true });
            let items = $('#river > div > section').children('div.horizontal-card-item');
            for (let index = 1; index <= limit; index++) {
               var imageUrl = items[index].children[0].children[0].attribs.src;
                var article_url = items[index].children[1].children[1].attribs.href;
                var article_short = items[index].children[1].children[1].children[0].children[0].data;
                var article_time = items[index].children[1].children[2].children[0].children[1].attribs.datetime;

                links.push({
                    i: index,
                    source:"gameSpot",
                    article_short: article_short,
                    article_image: imageUrl,
                    article_url: `https://www.gamespot.com${article_url}`,
                    article_time: moment(article_time, 'LLLL').utcOffset("+7").utc()
                })
                
            }
            /*items.each(async (index, e) => {
                var imageUrl = e.children[0].children[0].attribs.src;
                var article_url = e.children[1].children[1].attribs.href;
                var article_short = e.children[1].children[1].children[0].children[0].data;
                var article_time = e.children[1].children[2].children[0].children[1].attribs.datetime;

                links.push({
                    i: index,
                    article_short: article_short,
                    article_image: imageUrl,
                    article_url: `https://www.gamespot.com${article_url}`,
                    article_time: moment(article_time, 'LLLL').utcOffset("+7").utc()
                })

            });*/
            return links

        })
    },
    gameRadar: async (limit) => {
        const gameRadar = "https://www.gamesradar.com/news/";
        return await fetch(gameRadar).then(async (v) => {
            var links = [];
            const $ = cheerio.load(await v.text(), { _useHtmlParser2: true });
            let items = $('#content > section.listingResultsWrapper.news.news > div').children();

            items.filter((index, e) => {
                return e.attribs.class != "listingResult small result1 sponsored-post" && e.attribs.class != "box pagination internal current-prev-next";
            });
            for (let index = 1; index <= limit; index++) {
                var article_url = items[index].children[0].next.attribs.href;
                var article_short = _.get(items[index].children[0].next.attribs, "aria-label");
                var imageUrl = _.get(items[index].children[0].next.children[0].next.children[0].next.children[1].attribs, "data-original");
                var article_time = items[index].children[0].next.children[1].children[4].prev.children[1].children[3].children[3].attribs.datetime;
                links.push({
                    i: index,
                    source: "gameRadar",
                    article_short: article_short,
                    article_image: imageUrl,
                    article_url: article_url,
                    article_time: article_time
                })

                
            }
            return links;

        })
    },
    videoGamer: async () => {
        const videoGamer = "https://www.videogamer.com/";
        return await fetch(videoGamer).then(async (v) => {
            var links = [];
            const $ = cheerio.load(await v.text(), { _useHtmlParser2: true });
            let items = $('body > div.page-skin.body_constrain').children().filter((index, e) => {
                if (typeof e.attribs.class === "undefined") { }
                else return e.attribs.class.indexOf('container') == 0;
            }).each((index, e) => {
                let item = $(e).children().children().children().filter((index, e) => {
                    return e.attribs.class == "content-item";
                });
                item.each((i, e) => {
                    var article_url = $(e).children('div.content-item__image').children('a').attr('href');
                    var article_short = $(e).children('div.content-item__details').children('h2.content-item__details__headline').text();
                    var article_time = $(e).children('div.content-item__details').children('p.content-item__details__author').children('span').attr('datetime')
                    var dataSrc = $(e).children('div.content-item__image').children('a').children('picture').children('img').attr('data-src');
                    var index = dataSrc.indexOf("()/");
                    var article_image = dataSrc.slice(index + 3, dataSrc.length);

                    links.push({
                        i: i,
                        source: "videoGamer",
                        article_short: article_short,
                        article_image: article_image,
                        article_url: `https://www.videogamer.com${article_url}`,
                        article_time: article_time
                    })

                })

            });


            return links;
        })
    }
}
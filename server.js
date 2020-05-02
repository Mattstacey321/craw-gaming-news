const puppteer = require('puppeteer');
const express = require('express');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash')
moment().format('LLL');
const { fetch } = require('cross-fetch');
require('dotenv').config();
const app = express();
const PCGamer = require('./model/news');
const GamesRadar = require('./model/game_radar');
const url = "https://www.pcgamer.com/news/";
const { gameRadar , gameSpot, videoGamer } = require('./src/fetch_news');

const port = process.env.PORT || 3333;


app.get('/fetchNews', async (req, res) => {
    var results = [];
    var r1 = await gameRadar(5);
    var r2 = await gameSpot(5);
    var r3 = await videoGamer(5);
    results.push(...r1,...r2,...r3);
    res.json(results.sort(() => Math.random() - 0.5))
})

app.get('/videoGamer', async (req, res) => {
    const videoGamer = "https://www.videogamer.com/";
    var result = await fetch(videoGamer).then(async (v) => {
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
                    article_short: article_short,
                    article_image: article_image,
                    article_url: `https://www.videogamer.com${article_url}`,
                    article_time: article_time
                })

            })

        });


        return links;
    })
    res.json(result);
})


app.get('/gameRadar', async (req, res) => {
    const gameRadar = "https://www.gamesradar.com/news/";
    var result = await fetch(url).then(async (v) => {
        var links = [];
        const $ = cheerio.load(await v.text(), { _useHtmlParser2: true });
        let items = $('#content > section.listingResultsWrapper.news.news > div').children();

        items.filter((index, e) => {
            return e.attribs.class != "listingResult small result1 sponsored-post" && e.attribs.class != "box pagination internal current-prev-next";
        }).each(async (index, e) => {
            var article_url = e.children[0].next.attribs.href;
            var article_short = _.get(e.children[0].next.attribs, "aria-label");
            var imageUrl = _.get(e.children[0].next.children[0].next.children[0].next.children[1].attribs, "data-original");
            var article_time = e.children[0].next.children[1].children[4].prev.children[1].children[3].children[3].attribs.datetime;
            links.push({
                i: index,
                article_short: article_short,
                article_image: imageUrl,
                article_url: article_url,
                article_time: article_time
            })

        });
        return links;

    })
    res.json(result)
})


app.get('/gameSpot', async (req, res) => {
    const gamespot = "https://www.gamespot.com/news/";

    var result = await fetch(gamespot).then(async (v) => {
        var links = [];
        const $ = cheerio.load(await v.text(), { _useHtmlParser2: true });
        let items = $('#river > div > section').children('div.horizontal-card-item');

        items.each(async (index, e) => {
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

        });
        return links

    })

    /* const browser = await puppteer.launch({ headless: true });
     const page = await browser.newPage();
     await page.setRequestInterception(true);
 
     page.on('request', (req) => {
         if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
             req.abort();
         }
         else {
             req.continue();
         }
     });
     await page.goto(gamespot, {
         timeout: 0,
         waitUntil: 'networkidle2'
     });*/
    /*const results = await page.evaluate(async () => { 
        var links = [];

        return document.querySelectorAll('');

    })*/
    res.json(result)
})



app.get('/theVerge', async (req, res) => {
    const theVerge = "https://www.theverge.com/games";
    const browser = await puppteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(theVerge, {
        timeout: 0,
        waitUntil: 'networkidle2'
    });
    const results = await page.evaluate(async () => {
        var links = [];

        let items = document.querySelectorAll('#content > div:nth-child(5) > div > div > div.l-col__main > div > div');

        items.forEach(async (e, k) => {
            var a = e.querySelectorAll('div > a');
            const article_url = a[0].getAttribute('href');
            const article_image = a[0].querySelector('div > img').src;
            const release_date = e.querySelector('div > div > div > span.c-byline-wrapper > span:nth-child(2) > time').getAttribute('datetime')

            links.push({
                id: k,
                article_url: article_url,
                article_image: article_image,
                release_date: release_date
            });

        });
        return links
    });
    console.log(JSON.stringify(results));

    res.json(results)
})


app.get('/', async (req, res) => {

    const browser = await puppteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(url, {
        timeout: 0,
        waitUntil: 'networkidle2'
    });
    const results = await page.evaluate(async () => {
        var links = [];
        let items = document.querySelectorAll('#content > section > div.listingResults.news div.listingResult.small');
        items.forEach(async (e, k) => {
            var a = e.querySelectorAll('a');
            const article_url = a[0].getAttribute('href');
            const article_image = a[0].querySelector('article > div.image > figure > div > div');
            const article_short = a[0].querySelectorAll('article > div.content > header > h3');
            const release_date = a[0].querySelector('article > div.content > header > p > time');
            //console.log("time", release_date.getAttribute('datetime'));
            links.push({
                id: k,
                article_url: article_url,
                article_image: article_image.getAttribute('data-original'),
                article_short: article_short[0].textContent,
                release_date: release_date.getAttribute('datetime')
            });
        });

        return links;
    });
    res.json(results)
    /*for (let index = 1; index <= 2; index++) {

        try {

            const results = await page.evaluate(async () => {
                let items = document.querySelectorAll('#content > section > div.listingResults.news div.listingResult.small');
                var links = [];
                items.forEach(async (e, k) => {
                    var a = e.querySelectorAll('a');
                    const article_url = a[0].getAttribute('href');
                    const article_image = a[0].querySelector('article > div.image > figure > div > div');
                    const article_short = a[0].querySelectorAll('article > div.content > header > h3');
                    const release_date = a[0].querySelector('article > div.content > header > p > time');
                    //console.log("time", release_date.getAttribute('datetime'));
                    //console.log(a[0].querySelector('article > div.content > header > h3'));

                    links.push({
                        id: k,
                        article_url: article_url,
                        article_image: article_image.getAttribute('data-original'),
                        article_short: article_short[0].textContent,
                        release_date: release_date.getAttribute('datetime')
                    });
                });
                //console.log(links);
                return links;
            });
            //check if exist
            //console.log(results);

            return GamesRadar.find({}).sort({ "_id": -1 }).limit(-10).lean(true).then(async (val) => {
                //var pages = val.length/20;
                if (val.length <= 0) {
                    // no values
                    GamesRadar.create(results)
                        .then(async (v) => {
                            console.log('insert ok')
                            try {
                                await Promise.all([
                                    //page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                                    page.click("#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-prev > a"),
                                    page.waitForNavigation({ waitUntil: 'load', timeout: 0 }),
                                    page.waitForSelector('#content > section > div.listingResults')
                                ]);
                            } catch (error) { }
                            console.log('navigate to next page');
                        })
                        .catch((err) => {
                            console.log('error here ', err);
                            console.log('insert error')
                        });
                }
                else {
                    // has value
                    console.log("Last value Mongo :" + val);
                    console.log(val[val.length-1]);

                    var index = results.map((e) => {

                        return e.article_short
                    }).indexOf(val[val.length - 1].article_short)
                    console.log(index);
                    // no match
                    if(index == -1){
                        // insert all
                        try {

                            //console.log('length', val[val.length - 1].article_short == results[0].article_short);
                            var result = await page.evaluate(async () => {

                                let items = document.querySelectorAll('#content > section > div.listingResults.news div.listingResult.small');
                                var new_links = [];
                                items.forEach(async (e, k) => {
                                    var a = e.querySelectorAll('a');
                                    const article_url = a[0].getAttribute('href');
                                    const article_image = a[0].querySelector('article > div.image > figure > div > div');
                                    const article_short = a[0].querySelectorAll('article > div.content > header > h3');
                                    const release_date = a[0].querySelector('article > div.content > header > p > time');
                                    //console.log("time", release_date.getAttribute('datetime'));
                                    new_links.push({
                                        id: k,
                                        article_url: article_url,
                                        article_image: article_image.getAttribute('data-original'),
                                        article_short: article_short[0].textContent,
                                        release_date: release_date.getAttribute('datetime')
                                    });
                                });
                                return new_links;

                            })
                            console.log(result);

                            return GamesRadar.insertMany(result).then(async (v) => {
                                console.log('insert ok');
                                try {
                                    await Promise.all([
                                        //page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                                        page.click("#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-prev > a"),
                                        page.waitForNavigation({ waitUntil: 'load', timeout: 0 }),
                                        page.waitForSelector('#content > section > div.listingResults')
                                    ]);
                                } catch (error) { }
                            }).catch((err) => {
                                console.log(err, 'insert fail');
                            })
                        } catch (error) {
                            console.log(error);

                        }
                    }
                    else{
                        var newResult = results.slice(index, results.length);
                        console.log("New result " + newResult);
                        return GamesRadar.insertMany(newResult, { rawResult: true }).then(async (v) => {
                            console.log('insert ok');
                            try {
                                await Promise.all([
                                    //page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                                    page.click("#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-prev > a"),
                                    page.waitForSelector('#content > section > div.listingResults'),
                                    page.waitForNavigation({ waitUntil: 'load' }),

                                ]);
                            } catch (error) { }
                            console.log(v);

                        }).catch((err) => {
                            console.log(err, 'insert fail');
                        })
                    }

                    console.log('navigate to next page, else statement');


                }

            })
        } catch (error) {
            console.log(error);

        }
        console.log('navigate to next page, end');
    }*/

});

app.listen(port, () => {
    mongoose.Promise = global.Promise;
    mongoose.set('useFindAndModify', false);
    mongoose.set('debug', true);
    /*mongoose.connect(process.env.mongodb_uri, { useUnifiedTopology: true, useNewUrlParser: true }, (res, err) => {

        console.log('Connected to MongoDB');
    })*/

    console.log(`Connect to Craw at ${port}`);
})
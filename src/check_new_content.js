const puppteer = require('puppeteer');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PCGamer = require('./model/news');
const GamesRadar = require('./model/game_radar');
const { fetchDetail } = require('./src/fetch_news');
const url = "https://www.pcgamer.com/news/";
const url2 = "https://www.gamesradar.com/news";
const port = process.env.PORT || 3333;
app.get('/', async (req, res) => {

    const browser = await puppteer.launch({ headless: false });
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
    await page.goto(url2, {
        timeout: 0,
        waitUntil: 'load'
    });
    for (let index = 1; index <= 5; index++) {

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
                    console.log(a[0].querySelector('article > div.content > header > h3'));

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

            GamesRadar.find({}).limit(-10).then(async (val) => {
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
                    var index = results.map((e) => {
                        console.log(e.article_short);

                        return e.article_short
                    }).indexOf(val[val.length].article_short)
                    console.log(val[val.length].article_short);

                    var newResult = results.slice(index, 0);
                    console.log(newResult);
                    /*News.insertMany(newResult ,{rawResult:true},).then(async (v) => {
                         console.log('insert ok');
                         try {
                             await Promise.all([
                                 page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                                 page.waitForNavigation({ waitUntil: 'load' }),
 
                             ]);
                         } catch (error) { }
                         console.log(v);
                         
                     }).catch((err) => {
                         console.log(err, 'insert fail');
                     })*/

                    console.log('navigate to next page, else statement');

                    /*  try {
  
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
                          //console.log(result);
  
                          GamesRadar.insertMany(result).then(async (v) => {
                              console.log('insert ok');
                              try {
                                  await Promise.all([
                                      //page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                                      page.click("#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-prev > a"),
                                      page.waitForNavigation({ waitUntil: 'load',timeout:0 }),
                                      
                                      page.waitForSelector('#content > section > div.listingResults')
                                  ]);
                              } catch (error) { }
                          }).catch((err) => {
                              console.log(err, 'insert fail');
                          })
                      } catch (error) {
  
                      }
  */
                }

            })
        } catch (error) {

        }
        console.log('navigate to next page, end');
        try {
            await Promise.all([
                //page.click('#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-next > a'),
                page.click("#content > section > div > div.box.pagination.internal.current-prev-next > span.listings-pagination-button.listings-prev >a"),
                page.waitForNavigation({ waitUntil: 'load', timeout: 0 }),
                page.waitForSelector('#content > section > div.listingResults')
            ]);

        } catch (error) {
            console.log(error);

            console.log('error navigate to next page, end');
        }

    }

});

app.listen(port, () => {
    mongoose.Promise = global.Promise;
    mongoose.set('useFindAndModify', false);
    mongoose.set('debug', true);
    mongoose.connect(process.env.mongodb_uri, { useUnifiedTopology: true, useNewUrlParser: true }, (res, err) => {

        console.log('Connected to MongoDB');
    })

    console.log("Connect to Craw");
})
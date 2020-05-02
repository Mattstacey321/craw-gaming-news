let items2 = document.querySelectorAll('#content > div.l-reskin')
items2.forEach(async (e, k) => {
    let items = e.querySelectorAll('div > div > div > div');

    items.forEach(async (e, k) => {
        var a = e.querySelectorAll('div > a');
        const article_url = a[0].getAttribute('href');
        const article_image = a[0].querySelector('div > img').src;
        const release_date = e.querySelector('div > div > div > span.c-byline-wrapper > span:nth-child(2) > time').getAttribute('datetime')
        // const article_short = a[0].querySelectorAll('article > div.content > header > h3');
        //const release_date = a[0].querySelector('article > div.content > header > p > time');
        //console.log("time", release_date.getAttribute('datetime'));

        /*links.push({
            id: k,
            article_url: article_url,
            article_image: article_image.getAttribute('data-original'),
            article_short: article_short[0].textContent,
            release_date: release_date.getAttribute('datetime')
        });*/
        links.push({
            id: k,
            article_url: article_url,
            article_image: article_image,
            release_date: release_date
        });

    });
})

return links
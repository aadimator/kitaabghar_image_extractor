const puppeteer = require('puppeteer');

(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const webpage_path = "http://kitaabghar.com/bookbase/hashimnadeem/MuqaddasNovel.html";
    const book_name = webpage_path.split("/").pop().split(".")[0];
    const start_page = 1;
    const end_page = 151;

    var fs = require('fs');
    var output_dir = 'output';

    if (!fs.existsSync(output_dir)){
        fs.mkdirSync(output_dir);
    }

    var book_dir = 'output/' + book_name;
    if (!fs.existsSync(book_dir)){
        fs.mkdirSync(book_dir);
    }

    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({width: 1000, height: 800, deviceScaleFactor: 1});

    for (var i = start_page; i <= end_page; i++) {
        console.log("Fetching page: " + i);
        await page.goto(webpage_path + "?page=" + i, {waitUntil: 'networkidle2'});

        /**
         * Takes a screenshot of a DOM element on the page, with optional padding.
         *
         * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
         * @return {!Promise<!Buffer>}
         */
        async function screenshotDOMElement(opts = {}) {
            const padding = 'padding' in opts ? opts.padding : 0;
            const path = book_dir + "/" + i + ".png";
            const selector = opts.selector;

            if (!selector)
                throw Error('Please provide a selector.');

            const rect = await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (!element)
                    return null;
                const {x, y, width, height} = element.getBoundingClientRect();
                return {left: x, top: y, width, height, id: element.id};
            }, selector);

            if (!rect)
                throw Error(`Could not find element that matches selector: ${selector}.`);

            return await page.screenshot({
                path,
                clip: {
                    x: rect.left - padding,
                    y: rect.top - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2
                }
            });
        }

        await screenshotDOMElement({
            selector: '#AutoNumber3 > tbody > tr > td > table:nth-child(13) > tbody > tr > td:nth-child(1) > table > tbody > tr > td',
            padding: 5
        });
    }

    browser.close();
})();
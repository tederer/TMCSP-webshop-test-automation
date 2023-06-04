/* global process, setTimeout, before, after, testing */

require('./Browser.js');

const TEST_TIMEOUT_IN_MS        = 20000;
const TESTSTEP_TIMEOUT_IN_MS    = 5000;   // this value should be less than TEST_TIMEOUT_IN_MS to get understandable error messages

describe('WebShop', function() {
    var browser;

    this.timeout(TEST_TIMEOUT_IN_MS);     // with the default (2s) it is not enough time to open the browser and load the webpage

    before(()           => browser = new testing.Browser(TESTSTEP_TIMEOUT_IN_MS));
    beforeEach(async () => browser.openUrl('https://demowebshop.tricentis.com'));
    after(async ()      => browser.dispose());

    it('click "Computer" button in main menu', async function() {
        await browser.click('.top-menu > li:nth-child(2) > a:nth-child(1)');
    });

    it('click "Books" button in main menu', async function() {
        await browser.click('.top-menu > li:nth-child(1) > a:nth-child(1)');
    });
});  

/* global process, setTimeout, before, after */

const {remote} = require('webdriverio');

const TEST_TIMEOUT_IN_MS        = 10000;
const TESTSTEP_TIMEOUT_IN_MS    = 5000;

var browser;

var initialize = async function initialize() {
    const webdriverioConfig = {
        host:                         'localhost',
        port:                         4723,
        logLevel:                     'silent',    // default is 'info'
        capabilities: {
            'platformName':           'Linux',
            'appium:automationName':  'Chromium',
            'appium:deviceName':      'Android',
            'appium:appPackage':      'com.android.settings',
            'appium:appActivity':     '.Settings'
        }
    };

    browser = await remote(webdriverioConfig);
};

var beforeEachTest = async function beforeEachTest() {
    await browser.url('https://demowebshop.tricentis.com');
};

var tearDown = async function tearDown() {  
    await browser.deleteSession();     
};

var testStepTimeout = async function testStepTimeout( message) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(message), TESTSTEP_TIMEOUT_IN_MS);
    });
};

var click = async function click(cssSelector) {
    var description = 'UI element (cssSelector=\"' + cssSelector + '\")';

    var promise = new Promise(async (resolve, reject) => {
        var computerButton;
        
        try {
            computerButton = await browser.$(cssSelector);
            await computerButton.click();
        } catch (error) {
            reject('failed to click ' + description + ': ' + error);
        }
        
        resolve();
    });

    return Promise.race([promise, testStepTimeout('clicking ' + description + ' timed out')]);
};

describe('WebShop', function() {
	
    this.timeout(TEST_TIMEOUT_IN_MS); // with the default (2s) it is not enough time to open the browser and load the webpage
        
    before(initialize);
    beforeEach(beforeEachTest);
    after(tearDown);

    it('click "Computer" button in main menu', async function() {
        await click('.top-menu > li:nth-child(2) > a:nth-child(1)');
    });

    it('click "Books" button in main menu', async function() {
        await click('.top-menu > li:nth-child(1) > a:nth-child(1)');
    });
});  
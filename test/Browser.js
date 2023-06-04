/* global assertNamespace, testing, setTimeout */

require('./NamespaceUtils.js');

assertNamespace('testing');

testing.Browser = function Browser(testStepTimeoutInMs) {
    const {remote} = require('webdriverio');

    if (typeof testStepTimeoutInMs !== 'number') {
        throw 'argument to Browser constructor must be a number';
    }

    var browser;

    var assertInitializedBrowser = async function assertInitializedBrowser() {
        return new Promise(async (resolve, reject) => {
            if (browser) {
                resolve(browser);
                return;
            }

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
               
            remote(webdriverioConfig)
                .then(instance => {
                    browser = instance;
                    resolve(browser);
                })
                .catch(error => reject(error));
        });
     };

    var testStepTimeout = async function testStepTimeout( message) {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(message), testStepTimeoutInMs);
        });
    };
        
    this.openUrl = async function openUrl(url) {
        return new Promise(async (resolve, reject) => {
            try {
                await assertInitializedBrowser();
                await browser.url(url);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };

    this.dispose = async function dispose() {  
        if (browser) {
            await browser.deleteSession();  
            browser = undefined;   
        }
    };  
    
    this.click = async function click(cssSelector) {
        var description = 'UI element (cssSelector=\"' + cssSelector + '\")';
    
        var promise = new Promise(async (resolve, reject) => {
            try {
                var uiElement = await browser.$(cssSelector);
                await uiElement.click();
            } catch (error) {
                reject('failed to click ' + description + ': ' + error);
            }
            
            resolve();
        });
    
        return Promise.race([promise, testStepTimeout('clicking ' + description + ' timed out')]);
    };    
};
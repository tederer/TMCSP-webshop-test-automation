/* global assertNamespace, testing, setTimeout, URL, process */

require('./NamespaceUtils.js');

assertNamespace('testing');

testing.Browser = function Browser(testStepTimeoutInMs) {
    const WEB_DRIVER_LOG_LEVEL = 'silent';

    const {remote} = require('webdriverio');

    if (typeof testStepTimeoutInMs !== 'number') {
        throw 'argument to Browser constructor must be a number';
    }

    var optionalWebDriverUrl          = process.env.WEBDRIVERURL;
    var optionalWebDriverCapabilities = process.env.WEBDRIVERCAPABILITIES;
    
    if ((typeof optionalWebDriverUrl === 'string') && (typeof optionalWebDriverCapabilities === 'string')) {
        try {
            optionalWebDriverCapabilities = JSON.parse(optionalWebDriverCapabilities);
        } catch (error) {
            console.log('failed to parse web driver capabilities: ' + error);
            optionalWebDriverUrl = undefined;
        }
    }

    var browser;

    var assertInitializedBrowser = async function assertInitializedBrowser() {
        return new Promise(async (resolve, reject) => {
            if (browser) {
                resolve(browser);
                return;
            }

            var webDriverConfig = {
                hostname:                     'localhost',
                port:                         4723,
                logLevel:                     WEB_DRIVER_LOG_LEVEL,
                capabilities: {
                    'platformName':           'Linux',
                    'appium:automationName':  'Chromium',
                    'appium:deviceName':      'Android',
                    'appium:appPackage':      'com.android.settings',
                    'appium:appActivity':     '.Settings'
                }
            };
            
            if ((typeof optionalWebDriverUrl === 'string') && (typeof optionalWebDriverCapabilities === 'object')) {
                var url = new URL(optionalWebDriverUrl);

                webDriverConfig = {
                    protocol:     url.protocol.slice(0, url.protocol.length - 1),
                    hostname:     url.hostname,
                    port:         Number.parseInt(url.port),
                    path:         url.pathname,
                    logLevel:     WEB_DRIVER_LOG_LEVEL, 
                    capabilities: optionalWebDriverCapabilities
                };
            }
                   
            remote(webDriverConfig)
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
    
    var getter = function getter(cssSelector, getterFunctionName) {
        return new Promise(async (resolve, reject) => {
            if (browser) {
                try {
                    var uiElement = await browser.$(cssSelector);
                    var value = await uiElement[getterFunctionName](value);
                    resolve(value);
                } catch (error) {
                    reject(error);
                }
            }
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
        return new Promise(async (resolve, reject) => {
            if (browser) {
                try {
                    await browser.deleteSession(); 
                    browser = undefined;    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
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

    this.setValue = function setValue(cssSelector, value) {
        return new Promise(async (resolve, reject) => {
            if (browser) {
                try {
                    var emailInput = await browser.$(cssSelector);
                    await emailInput.setValue(value);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });
    };

    this.getValue = function getValue(cssSelector) {
        return getter(cssSelector, 'getValue');
    };

    this.getText = function getText(cssSelector) {
        return getter(cssSelector, 'getText');
    };

    this.getInnerHtml = function getInnerHtml(cssSelector) {
        return getter(cssSelector, 'getHTML');
    };

    this.pause = function pause(pauseInMs) {
        return new Promise(async (resolve, reject) => {
            await browser.pause(pauseInMs);
            resolve();
        });
    };
};
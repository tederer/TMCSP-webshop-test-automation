/* global process, setTimeout, setInterval, clearTimeout, clearInterval, before, after, afterEach, testing */

require('./Browser.js');

const TEST_TIMEOUT_IN_MS        = 20000;
const TESTSTEP_TIMEOUT_IN_MS    = 5000;   // this value should be less than TEST_TIMEOUT_IN_MS to get understandable error messages

// CSS selectors
const LOGIN_SEND_DATA_BUTTON                    = '.login-button';
const LOGIN_OPEN_FORM_BUTTON                    = '.ico-login';
const LOGIN_EMAIL_FIELD                         = '#Email';
const LOGIN_PASSWORD_FIELD                      = '#Password';

const LOGOUT_BUTTON                             = '.ico-logout';

const ACCOUNT_USERNAME_LINK                     = '.header-links > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)';

const ACCOUNT_FIRSTNAME_FIELD                   = '#FirstName';
const ACCOUNT_LASTNAME_FIELD                    = '#LastName';
const ACCOUNT_EMAIL_FIELD                       = '#Email';

const BOOK_BUTTON                               = '.top-menu > li:nth-child(1) > a:nth-child(1)';
const BOOK_ADD_COMPUTING_AND_INTERNET_BUTTON    = 'div.item-box:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > input:nth-child(1)';
const CART_LINK                                 = '#topcartlink > a:nth-child(1) > span:nth-child(1)';
const CART_NAME_OF_FIRST_ITEM                   = '.product-name';
const CART_QUANTITY_ELEMENT                     = '.cart-qty';
const CART_REMOVE_FIRST_ITEM_CHECKBOX           = '.remove-from-cart > input:nth-child(2)';
const CART_UPDATE_BUTTON                        = '.update-cart-button';

var browser;

var waitFor = async function waitFor(predicate, errorMessage) {
    return new Promise((resolve, reject) => {
        var timeoutId;
        var intervalId;

        var cancelInterval = function cancelInterval() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        };

        var cancelTimeout = function cancelTimeout() {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }
        };

        timeoutId = setTimeout(() => {
            cancelInterval();
            reject('timed out while waiting for ' + errorMessage);
        }, TESTSTEP_TIMEOUT_IN_MS);

        intervalId = setInterval(async () => {
            try {
                if (await predicate()) {
                    cancelTimeout();
                    cancelInterval();
                    resolve();
                }
            } catch (error) {
                cancelTimeout();
                cancelInterval();
                reject(error);
            }
        }, 100);
    });
};

var clickLoginButton = async function clickLoginButton() {
    await browser.click(LOGIN_SEND_DATA_BUTTON);
};
var saveLogOut = async function saveLogOut() {
    return new Promise(async (resolve, reject) => {
        try {
            await browser.click(LOGOUT_BUTTON);
        } catch (error) {}
        resolve();
    });
};

var givenUserEnteredNameAndPassword = async function givenUserEnteredNameAndPassword(username, password) {
    await browser.click(LOGIN_OPEN_FORM_BUTTON);
    await browser.setValue(LOGIN_EMAIL_FIELD, username);
    await browser.setValue(LOGIN_PASSWORD_FIELD, password);
};

var givenLoggedInUser = async function givenLoggedInUser() {
    await givenUserEnteredNameAndPassword('fhBgld.groupE@tricentis.com', '_GruppeE');
    await clickLoginButton();
};

var getNumberOfItemsInCart = async function getNumberOfItemsInCart() {
    var value = await browser.getInnerHtml(CART_QUANTITY_ELEMENT);
    var startIndex          = value.indexOf('(');
    var endIndex            = value.indexOf(')');
    return Number.parseInt(value.slice(startIndex + 1, endIndex));
};

var givenShoppingCartIsEmpty = async function givenShoppingCartIsEmpty() {
    var numberOfItemsInCart = await getNumberOfItemsInCart();
    if (numberOfItemsInCart === 0) {
        return;
    }
    
    await browser.click(CART_LINK);
    
    while (numberOfItemsInCart > 0) {
        try {
            await browser.click(CART_REMOVE_FIRST_ITEM_CHECKBOX);
        } catch (error) {
            await browser.pause(100);
            continue;   // ignoring the error because this error can happen when the UI is slow 
        }
        await browser.click(CART_UPDATE_BUTTON);
        numberOfItemsInCart = await getNumberOfItemsInCart();
    }
};

var givenBookGetsAddedToShoppingCart = async function givenBookGetsAddedToShoppingCart() {
    var cartQuantity = await getNumberOfItemsInCart();
    await browser.click(BOOK_BUTTON);
    await browser.click(BOOK_ADD_COMPUTING_AND_INTERNET_BUTTON);
    await waitFor(async () => {
        var currentQuantity = await getNumberOfItemsInCart();
        return currentQuantity > cartQuantity;
    }, 'adding book');
};

var whenLoginButtonGetsClicked = async function whenLoginButtonGetsClicked() {
    await clickLoginButton();
};

var whenAccountInfoGetsDisplayed = async function whenAccountInfoGetsDisplayed() {
    await browser.click(ACCOUNT_USERNAME_LINK);
};

var whenBookGetsAddedToShoppingCart = async function whenBookGetsAddedToShoppingCart() {
    await givenBookGetsAddedToShoppingCart();
};

var whenShoppingCartGetsCleaned = async function whenShoppingCartGetsCleaned() {
    givenShoppingCartIsEmpty();
};

var thenDisplayedUsernameShouldBe = async function thenDisplayedUsernameShouldBe(expectedUsername) {
    await waitFor(async () => {
        var username = await browser.getText(ACCOUNT_USERNAME_LINK);
        return username === expectedUsername; 
    }, 'displaying the username');
};

var thenAccountInfosShouldBe = async function thenAccountInfosShouldBe(expectedFirstname, expectedLastname, expectedEmail) {
    await waitFor(async () => {
        try {
            var firstname   = await browser.getValue(ACCOUNT_FIRSTNAME_FIELD);
            var lastname    = await browser.getValue(ACCOUNT_LASTNAME_FIELD);
            var email       = await browser.getValue(ACCOUNT_EMAIL_FIELD);
            var actual      = firstname + '|' + lastname + '|' + email;
            var expected    = expectedFirstname + '|' + expectedLastname + '|' + expectedEmail;
            return actual === expected;
        } catch (error) {
            return false;
        }
    }, 'displaying the account info');
};

var thenTheCartShouldContainOneBook = async function thenTheCartShouldContainOneBook() {
    await browser.click(CART_LINK);
        
    await waitFor(async () => {
        var itemCount = await getNumberOfItemsInCart();
        if (itemCount !== 1) {
            return false;
        }

        try {
            var productName = await browser.getText(CART_NAME_OF_FIRST_ITEM);
            return productName === 'Computing and Internet';
        } catch (error) {
            return false;   // ignoring this error because it can happen when the UI is slow.
        }
    }, 'new book is in cart');
};

var thenTheShoppingShartShouldBeEmpty = async function thenTheShoppingShartShouldBeEmpty() {
    await waitFor(async () => {
        var numberOfItemsInCart = await getNumberOfItemsInCart();
        return numberOfItemsInCart === 0;
    }, 'shopping cart gets empty');
};

describe('WebShop', function() {
    this.timeout(TEST_TIMEOUT_IN_MS);     // with the default (2s) it is not enough time to open the browser and load the webpage
    
    //before(()           => browser = new testing.Browser(TESTSTEP_TIMEOUT_IN_MS, headspinUrl, headspinCapabilities));
    before(()           => browser = new testing.Browser(TESTSTEP_TIMEOUT_IN_MS));
    beforeEach(async () => browser.openUrl('https://demowebshop.tricentis.com'));
    afterEach(saveLogOut);
    after(async ()      => browser.dispose());

    it('login', async function() {
        await givenUserEnteredNameAndPassword('fhBgld.groupE@tricentis.com', '_GruppeE');
        await whenLoginButtonGetsClicked();
        await thenDisplayedUsernameShouldBe('fhBgld.groupE@tricentis.com');
    });

    it('account information', async function() {
        await givenLoggedInUser();
        await whenAccountInfoGetsDisplayed();
        await thenAccountInfosShouldBe('FhBgld', 'GrpE', 'fhBgld.groupE@tricentis.com');
    });

    it('add book to shopping cart', async function() {
        await givenLoggedInUser();
        await givenShoppingCartIsEmpty();
        await whenBookGetsAddedToShoppingCart();
        await thenTheCartShouldContainOneBook();
    });

    it('cleaning the shopping cart', async function() {
        await givenLoggedInUser();
        await givenShoppingCartIsEmpty();
        await givenBookGetsAddedToShoppingCart();
        await whenShoppingCartGetsCleaned();
        await thenTheShoppingShartShouldBeEmpty();
    });
});  

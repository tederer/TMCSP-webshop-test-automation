/* global before, after, afterEach, testing, process */

const TEST_TIMEOUT_IN_MS     = 20000;
const TESTSTEP_TIMEOUT_IN_MS = 5000;   // this value should be less than TEST_TIMEOUT_IN_MS to get understandable error messages

const WEB_PAGE_URL_TO_TEST   = 'https://demowebshop.tricentis.com';

require('./Browser.js');
require('./Steps.js');

var userPassword = process.env.USERPASSWORD;

if (userPassword === undefined) {
    console.log('\nMissing user password in environment variable USERPASSWORD');
    process.exit(1);
}

describe('WebShop', function() {
    this.timeout(TEST_TIMEOUT_IN_MS); // with the default (2s) it is not enough time to open the browser and load the webpage
    
    var browser = new testing.Browser(TESTSTEP_TIMEOUT_IN_MS);
    var steps   = new testing.Steps(browser, TESTSTEP_TIMEOUT_IN_MS);

    beforeEach(async () => browser.openUrl(WEB_PAGE_URL_TO_TEST));
    afterEach(steps.saveLogOut);
    after(async () => browser.dispose());

    it('login', async function() {
        await steps.givenUserEnteredNameAndPassword('fhBgld.groupE@tricentis.com', userPassword);
        await steps.whenLoginButtonGetsClicked();
        await steps.thenDisplayedUsernameShouldBe('fhBgld.groupE@tricentis.com');
    });

    it('account information', async function() {
        await steps.givenLoggedInUser(userPassword);
        await steps.whenAccountInfoGetsDisplayed();
        await steps.thenAccountInfosShouldBe('FhBgld', 'GrpE', 'fhBgld.groupE@tricentis.com');
    });

    it('add book to shopping cart', async function() {
        await steps.givenLoggedInUser(userPassword);
        await steps.givenShoppingCartIsEmpty();
        await steps.whenBookGetsAddedToShoppingCart();
        await steps.thenTheCartShouldContainOneBook();
    });

    it('cleaning the shopping cart', async function() {
        await steps.givenLoggedInUser(userPassword);
        await steps.givenShoppingCartIsEmpty();
        await steps.givenBookGetsAddedToShoppingCart();
        await steps.whenShoppingCartGetsCleaned();
        await steps.thenTheShoppingShartShouldBeEmpty();
    });

    it('logout', async function() {
        await steps.givenLoggedInUser(userPassword);
        await steps.whenLoggedOutUser();
        await steps.thenUserShouldbeLoggedOut();
    });
});  

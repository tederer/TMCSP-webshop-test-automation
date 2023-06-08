/* global assertNamespace, testing*/

require('./NamespaceUtils.js');

assertNamespace('testing');

const {CSS}           = require('./CssSelectors.js');
const {createWaitFor} = require('./Utils.js');


testing.Steps = function Steps(browser, testStepTimeoutInMs) {
    const waitFor     = createWaitFor(testStepTimeoutInMs);
    var thisInstance  = this;

    var clickLoginButton = async function clickLoginButton() {
        await browser.click(CSS.LOGIN_SEND_DATA_BUTTON);
    };
    
    var getNumberOfItemsInCart = async function getNumberOfItemsInCart() {
        var value = await browser.getInnerHtml(CSS.CART_QUANTITY_ELEMENT);
        var startIndex = value.indexOf('(');
        var endIndex   = value.indexOf(')');
        return Number.parseInt(value.slice(startIndex + 1, endIndex));
    };
    
    var logOut = async function logOut() {
        await browser.click(CSS.LOGOUT_BUTTON);
    };

    this.saveLogOut = async function saveLogOut() {
        return new Promise(async (resolve, reject) => {
            try {
                await logOut();
            } catch (error) {}
            resolve();
        });
    };
    
    this.givenUserEnteredNameAndPassword = async function givenUserEnteredNameAndPassword(username, password) {
        await browser.click(CSS.LOGIN_OPEN_FORM_BUTTON);
        await browser.setValue(CSS.LOGIN_EMAIL_FIELD, username);
        await browser.setValue(CSS.LOGIN_PASSWORD_FIELD, password);
    };
    
    this.givenLoggedInUser = async function givenLoggedInUser() {
        await thisInstance.givenUserEnteredNameAndPassword('fhBgld.groupE@tricentis.com', '_GruppeE');
        await clickLoginButton();
    };
    
    this.givenShoppingCartIsEmpty = async function givenShoppingCartIsEmpty() {
        var numberOfItemsInCart = await getNumberOfItemsInCart();
        if (numberOfItemsInCart === 0) {
            return;
        }
        
        await browser.click(CSS.CART_LINK);
        
        while (numberOfItemsInCart > 0) {
            try {
                await browser.click(CSS.CART_REMOVE_FIRST_ITEM_CHECKBOX);
            } catch (error) {
                await browser.pause(100);
                continue;   // ignoring the error because this error can happen when the UI is slow 
            }
            await browser.click(CSS.CART_UPDATE_BUTTON);
            numberOfItemsInCart = await getNumberOfItemsInCart();
        }
    };
    
    this.givenBookGetsAddedToShoppingCart = async function givenBookGetsAddedToShoppingCart() {
        var cartQuantity = await getNumberOfItemsInCart();
        await browser.click(CSS.BOOK_BUTTON);
        await browser.click(CSS.BOOK_ADD_COMPUTING_AND_INTERNET_BUTTON);
        await waitFor(async () => {
            var currentQuantity = await getNumberOfItemsInCart();
            return currentQuantity > cartQuantity;
        }, 'adding book');
    };
    
    this.whenLoginButtonGetsClicked = async function whenLoginButtonGetsClicked() {
        await clickLoginButton();
    };
    
    this.whenAccountInfoGetsDisplayed = async function whenAccountInfoGetsDisplayed() {
        await browser.click(CSS.ACCOUNT_USERNAME_LINK);
    };
    
    this.whenBookGetsAddedToShoppingCart = async function whenBookGetsAddedToShoppingCart() {
        await thisInstance.givenBookGetsAddedToShoppingCart();
    };
    
    this.whenShoppingCartGetsCleaned = async function whenShoppingCartGetsCleaned() {
        thisInstance.givenShoppingCartIsEmpty();
    };
    
    this.whenLoggedOutUser = async function whenLoggedOutUser() {
        await logOut();
    };
    
    this.thenDisplayedUsernameShouldBe = async function thenDisplayedUsernameShouldBe(expectedUsername) {
        await waitFor(async () => {
            var username = await browser.getText(CSS.ACCOUNT_USERNAME_LINK);
            return username === expectedUsername; 
        }, 'displaying the username');
    };
    
    this.thenAccountInfosShouldBe = async function thenAccountInfosShouldBe(expectedFirstname, expectedLastname, expectedEmail) {
        await waitFor(async () => {
            try {
                var firstname   = await browser.getValue(CSS.ACCOUNT_FIRSTNAME_FIELD);
                var lastname    = await browser.getValue(CSS.ACCOUNT_LASTNAME_FIELD);
                var email       = await browser.getValue(CSS.ACCOUNT_EMAIL_FIELD);
                var actual      = firstname + '|' + lastname + '|' + email;
                var expected    = expectedFirstname + '|' + expectedLastname + '|' + expectedEmail;
                return actual === expected;
            } catch (error) {
                return false;
            }
        }, 'displaying the account info');
    };
    
    this.thenTheCartShouldContainOneBook = async function thenTheCartShouldContainOneBook() {
        await browser.click(CSS.CART_LINK);
            
        await waitFor(async () => {
            var itemCount = await getNumberOfItemsInCart();
            if (itemCount !== 1) {
                return false;
            }
    
            try {
                var productName = await browser.getText(CSS.CART_NAME_OF_FIRST_ITEM);
                return productName === 'Computing and Internet';
            } catch (error) {
                return false;   // ignoring this error because it can happen when the UI is slow.
            }
        }, 'new book is in cart');
    };
    
    this.thenTheShoppingShartShouldBeEmpty = async function thenTheShoppingShartShouldBeEmpty() {
        await waitFor(async () => {
            var numberOfItemsInCart = await getNumberOfItemsInCart();
            return numberOfItemsInCart === 0;
        }, 'shopping cart gets empty');
    };    

    this.thenUserShouldbeLoggedOut = async function thenUserShouldbeLoggedOut() {
        await waitFor(async () => {
            var name = await browser.getText(CSS.LOGIN_OPEN_FORM_BUTTON);
            return name === 'Log in';
        }, 'user log out');
    };
};

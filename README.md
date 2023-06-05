# TMCSP-webshop-test-automation

This project contains automated tests for a webpage hosted by Tricentis.

## installation

To get the project up and running all you need is an Ubuntu (tested with 22.04.1) machine (2 CPU cores are enough) and the following commands.

* update google chrome to latest version
* execute `git clone https://github.com/tederer/TMCSP-webshop-test-automation.git`
* execute `npm install`
* execute `sudo npm i -g appium@next`
* execute `sudo npm i -g @appium/types`
* execute `appium driver install chromium`

## running the tests locally

The following steps are necessary to execute the tests on a local Chrome Browser instance.

* start your [Appium](http://appium.io) server by executing `appium` in a separate terminal
* navigate to the project folder
* execute `npm start`

## references

http://appium.io/docs/en/2.0/quickstart/install/
http://appium.io/docs/en/2.0/quickstart/uiauto2-driver/
http://appium.io/docs/en/2.0/quickstart/test-js/
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
https://webdriver.io/docs/api
https://webdriver.io/docs/api/expect-webdriverio
https://mochajs.org/
https://github.com/Automattic/expect.js
https://docs.github.com/en/actions/security-guides/encrypted-secrets

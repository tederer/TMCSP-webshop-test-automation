/* global process, setTimeout, setInterval, clearTimeout, clearInterval */

exports.createWaitFor = function createWaitFor(testStepTimeoutInMs) {
    return async function waitFor(predicate, errorMessage) {
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
            }, testStepTimeoutInMs);

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
};

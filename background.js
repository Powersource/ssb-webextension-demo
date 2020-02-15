'use strict';

chrome.browserAction.setBadgeBackgroundColor({color: '#eae'});

chrome.browserAction.onClicked.addListener(aTab => {
  chrome.tabs.create({'url': '/index.html', 'active': true});
});
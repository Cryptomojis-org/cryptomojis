chrome.contextMenus.create ({
    "title": "Mint a new Cryptomoji!",
    "contexts": ["selection"],
    "onclick": openTab()
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        console.log({changeInfo});
        console.log({tabId});
        console.log({tab});
    }
});
chrome.tabs.executeScript(null, {file: 'js/cryptomojis.js'});
// chrome.tabs.executeScript(null, {
//     code: 'var config = ' + JSON.stringify({var1: 'popo'})
// }, function() {
//     chrome.tabs.executeScript(null, {file: 'js/cryptomojis.js'});
// });

function openTab(){
    return function(info, tab){
        let text = info.selectionText;

        let redditLink = "https://www.reddit.com/" + format(text) +
            "/top/?t=all"
        chrome.tabs.create ({index: tab.index + 1, url: redditLink,
            selected: true});
    }
};

function format(subName){
    if (subName[0] === "r" && subName[1] === "/"){
        return subName
    }
    else {
        return "r/" + subName
    }
};
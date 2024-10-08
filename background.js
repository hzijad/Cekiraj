importScripts('list.js'); // Load the list of target domains

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const currentUrl = new URL(tab.url);
    const domain = currentUrl.hostname;

    // Check if the domain is in the targetDomains array
    if (targetDomains.includes(domain)) {
      console.log(`You are on a target domain: ${domain}`);

      // Inject the content script into the tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js'] // This file will inject custom UI
      });
    }
  }
});

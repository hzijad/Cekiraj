importScripts('list.js'); 
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if the tab is fully loaded (status is 'complete')
  if (changeInfo.status === 'complete' && tab.url) {
    // Extract the domain from the tab's URL
    const currentUrl = new URL(tab.url);
    const domain = currentUrl.hostname;

    // Compare the domain to your target domain list
    if (targetDomains.includes(domain)) {
      console.log(`You are on a target domain: ${domain}`);
      // Trigger your desired behavior here, e.g., sending a message or showing a popup
    } else {
      console.log(`This domain is not in the list: ${domain}`);
    }
  }
});

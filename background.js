chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const currentUrl = new URL(tab.url);
    const domain = currentUrl.hostname;

    if (targetDomains.includes(domain)) {
      const siteInfo = siteData[domain];
      const trustLevel = determineTrustLevel(siteInfo.articles);

      // Send a message to the content script with the trust level
      chrome.tabs.sendMessage(tabId, { trustLevel: trustLevel });
    }
  }
});

function determineTrustLevel(articles) {
  if (articles >= 200) {
    return "Highly Trusted";
  } else if (articles >= 100) {
    return "Moderately Trusted";
  } else {
    return "Less Trusted";
  }
}

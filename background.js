importScripts('list.js'); // Load the list of target domains

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const currentUrl = new URL(tab.url);
    let domain = currentUrl.hostname;

    // Handle domains with or without "www."
    if (!siteData[domain]) {
      domain = "www." + domain;  // Add "www." if not present
    }

    // Check if the domain is in the targetDomains array
    if (targetDomains.includes(domain.replace('www.', ''))) {
      const siteInfo = siteData[domain];
      if (siteInfo) {
        const trustLevel = determineTrustLevel(siteInfo.articles);  // Determine trust level

        // Inject a script to display the trust level
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: displayTrustLevelPopup,  // Pass the function instead of a file
          args: [trustLevel]  // Pass the trust level as an argument
        });
      } else {
        console.log(`No site data found for domain: ${domain}`);
      }
    } else {
      console.log(`Not a target domain: ${domain}`);
    }
  } else {
    console.log(`Tab is not fully loaded or URL is missing: ${tab.url}`);
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
function displayTrustLevelPopup(trustLevel) {
  // Create a shadow host to hold the shadow DOM
  const shadowHost = document.createElement('div');

  // Attach shadow DOM to the shadow host (open mode)
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Add the shadow host to the document body
  document.body.appendChild(shadowHost);

  // Define the popup's HTML and CSS inside the shadow DOM
  shadowRoot.innerHTML = `
    <style>
      :root {
        --default-padding: 10px;
      }
      .overlay {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(30px);
        z-index: 9999;
      }
      .window {
        display: flex;
        flex-direction: column;
        min-width: 400px;
        min-height: 300px;
        border: 5px solid #5e2ae9;
        box-shadow: 15px 15px 0 #5e2ae9;
        max-width: 600px;
        max-height: 500px;
        background-color: #7f00ff;
        filter: saturate(0.1);
        border-radius: 3px;
        z-index: 10000;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .window:focus-within {
        filter: saturate(1);
      }
      .window__title-bar {
        background-color: #8c5afb;
        color: white;
        padding: 13px var(--default-padding);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: default;
        user-select: none;
        z-index: 1;
        box-shadow: 0px 5px 6px -2px #bb99ff5e;
      }
      .window__body {
        flex-grow: 1;
        background-color: white;
        padding: var(--default-padding);
        overflow-y: auto;
      }
      .window__btn {
        cursor: pointer;
        background-color: #5e2ae9;
        width: 20px;
        height: 20px;
        border: none;
        padding: 0;
        margin: 0;
        border-radius: 5px;
        opacity: 0.8;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ae63e4;
      }
      .window__btn:hover {
        opacity: 1;
      }
      .window__status-bar {
        padding: 3px var(--default-padding);
        font-size: 0.75rem;
        color: #ecd4ff;
      }
    </style>

    <div class="overlay"></div>
    <div class="window" tabindex="0">
      <div class="window__title-bar">
        <div class="window__title">Trust Level</div>
        <button class="window__btn">&times;</button>
      </div>
      <div class="window__body">
        <h1>Site Trust Level</h1>
        <p>This site is considered: <strong>${trustLevel}</strong></p>
      </div>
      <div class="window__status-bar">
        Status: Trust level assessment
      </div>
    </div>
  `;

  // Add the close button functionality
  shadowRoot.querySelector('.window__btn').addEventListener('click', () => {
    shadowHost.remove();
  });
}

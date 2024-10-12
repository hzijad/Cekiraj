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
    // Log if the tab is not fully loaded or if there's no URL
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
  // Create a shadow host (this will hold our shadow DOM)
  const shadowHost = document.createElement('div');
  
  // Attach shadow DOM to the shadow host (use open mode)
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Add the shadow host to the document body
  document.body.appendChild(shadowHost);

  // Inside the shadow DOM, define the styles and structure of the popup
  shadowRoot.innerHTML = `
    <style>
      /* Global reset inside shadow DOM */
      * {
        all: unset; /* Reset everything */
        box-sizing: border-box;
      }

      #customUI {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .popup {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        width: 300px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: black;
      }
      .popup h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      .popup p {
        font-size: 18px;
        margin: 0;
      }
      .popup button {
        padding: 10px 20px;
        margin-top: 20px;
        border: none;
        background-color: #333;
        color: white;
        cursor: pointer;
        border-radius: 5px;
      }
    </style>

    <div id="customUI">
      <div class="popup">
        <h2>Site Trust Level</h2>
        <p>This site is considered: <strong>${trustLevel}</strong></p>
        <button id="closeCustomUI">Close</button>
      </div>
    </div>
  `;

  // Add an event listener to close the modal when the "Close" button is clicked
  shadowRoot.getElementById('closeCustomUI').addEventListener('click', () => {
    shadowHost.remove();
  });
}
/*
      UNESCO HACKATHON 2024. - FIRST PLACE WINNER
*/

importScripts('list.js'); // Load the list of target domains

let lastDomain = '';

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
      if (domain !== lastDomain) {  // Check if it's a different domain
        const siteInfo = siteData[domain];
        if (siteInfo) {
          const trustLevel = determineTrustLevel(siteInfo.articles);  // Determine trust level

          // Inject a script to display the trust level
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: displayTrustLevelPopup,  // Pass the function instead of a file
            args: [trustLevel]  // Pass the trust level as an argument
          });
          lastDomain = domain;
        } else {
          console.log(`No site data found for domain: ${domain}`);
        }
      } else {
        console.log(`Not a target domain: ${domain}`);
      }
    } else {
      console.log(`Tab is not fully loaded or URL is missing: ${tab.url}`);
    }
  }
});

function determineTrustLevel(articles) {
  if (articles <= 100) {
    return "Povjerena";
  } else if (articles <= 200 && articles >100) {
    return "Povjerenija od ostalih";
  } else {
    return "Manje povjerena";
  }
}

function displayTrustLevelPopup(trustLevel) {
  const shadowHost = document.createElement('div');
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  document.body.appendChild(shadowHost);

  // Determine checkmark icon and text color based on trust level
  let checkmarkIcon = '';
  let trustColor = '';

  if (trustLevel === "Povjerena") {
    checkmarkIcon = chrome.runtime.getURL('images/green-checkmark.png'); // Correct path to the image inside the 'images' folder
    trustColor = '#276D30'; // Green color
  } else if (trustLevel === "Povjerenija od ostalih") {
    checkmarkIcon = chrome.runtime.getURL('images/yellow-checkmark.png'); // Correct path to the yellow checkmark
    trustColor = '#B7AB17'; // Yellow color
  } else {
    checkmarkIcon = chrome.runtime.getURL('images/red-checkmark.png'); // Correct path to the red checkmark
    trustColor = '#B71335'; // Red color
  }

  const logoUrl = chrome.runtime.getURL('images/logo.png'); // Path to the logo image

  shadowRoot.innerHTML = `
  <style>
    /* CSS Reset */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif; /* Set a default font family */
      font-size: 14px; /* Set a default font size */
      font-weight: normal; /* Set a default font weight */
      line-height: 1.5; /* Set a default line height */
      letter-spacing: normal; /* Set a default letter spacing */
    }

    /* Scoped Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      background: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      background-color: white;
      border-radius: 8px;
      padding: 0.5rem; /* Increased padding */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      max-width: 300px;
      width: 100%;
      position: absolute;
      top: 20px !important;
      right: 20px !important;
      z-index: 10000 !important;
      text-align: center;
      overflow: hidden;
    }

    .close-modal {
      position: absolute;
      top: 5px; /* Increased top margin */
      right: 5px; /* Increased right margin */
      cursor: pointer;
    }

    .close-modal svg {
      width: 20px;
      height: 20px;
    }

    .modal-content {
      font-size: 16px;
      color: #333;
      margin: 10px 0; /* Increased margin */
      text-align: center; /* Center the text */
    }

    .warning-text {
      font-size: 14px; /* Make the text a bit smaller */
      color: #333;
      font-weight: bold;
      margin: 5px 0 15px 0; /* Reduced top margin, increased bottom margin */
    }

    .trust-level {
      font-size: 14px;
      color: ${trustColor};
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 15px; /* Increased margin */
    }

    .trust-level img {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }

    .logo {
      width: 80px; /* Slightly reduce size */
      height: auto;
      margin: 0 auto;
      display: block;
    }
    
    .warning-title {
      font-size: 1.6em;
      font-weight: bold;
      text-align: center;
      margin-bottom: 0.5em; /* Reduced margin */
    }

    .separator {
      width: 100%;
      height: 1px;
      background-color: #ccc;
      margin: 10px 0; /* Increased margin */
    }

    @media only screen and (max-width: 600px) {
      .modal {
        width: 90%;
        max-width: 90%;
      }

      .modal-content {
        font-size: 14px;
      }
    }
  </style>

  <div class="modal-overlay">
    <div class="modal">
      <a class="close-modal" aria-label="Close modal">
        <svg viewBox="0 0 20 20">
          <path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
        </svg>
      </a>
      <img src="${logoUrl}" alt="Logo" class="logo">
      <div class="separator"></div>
      <div class="modal-content">
        <div class="warning-title">Upozorenje</div>
        <div class="warning-text">
          Ova stranica je zabilježena da objavljuje neistinite sadržaje, pažnja preporučena prilikom čitanja.
        </div>
        <div class="trust-level">
          <img src="${checkmarkIcon}" alt="Trust Level Icon">
          ${trustLevel}
        </div>
      </div>
    </div>
  </div>
  `;

  // Modal functionality
  const modalOverlay = shadowRoot.querySelector('.modal-overlay');
  const closeModalElements = shadowRoot.querySelectorAll('.close-modal');

  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }

  closeModalElements.forEach(closeModal => {
    closeModal.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      shadowHost.remove();
    });
  });

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      shadowHost.remove();
    }
  });
}

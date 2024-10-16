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
    return "Povjerena";
  } else if (articles >= 100) {
    return "Povjerenija od ostalih";
  } else {
    return "Manje povjerena";
  }
}
function displayTrustLevelPopup(trustLevel) {
  const shadowHost = document.createElement('div');
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  document.body.appendChild(shadowHost);

  shadowRoot.innerHTML = `
    <style>
      body, html {
        margin: 0;
        padding: 0;
        box-sizing: border-box; /* Ensure consistent box sizing */
      }

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
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        max-width: 300px; /* Limit the maximum width */
        width: 100%; /* Ensure it takes full width up to the max */
        position: absolute;
        top: 20px;
        right: 20px;
        text-align: center;
        overflow: hidden; /* Prevent content overflow */
      }

      .close-modal {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }

      .close-modal svg {
        width: 20px;
        height: 20px;
      }

      .close-modal svg path {
        fill: #624E88; /* Ensure the SVG uses the desired color */
        stroke: #624E88; /* Thicken the X button */
        stroke-width: 1.5; /* Increase stroke width */
      }

      .modal-content {
        font-size: 16px; /* Set a consistent font size */
        color: #333;
        margin: 20px 0; /* Space around the content */
        text-align: left; /* Align text to the left */
      }

      .warning-text {
        font-size: 18px; /* Larger text for warning */
        color: #333; /* Dark color instead of red */
        font-weight: bold; /* Make the text bold */
        margin: 10px 0; /* Space around the warning text */
      }

      .trust-level {
        font-size: 14px; /* Smaller font size for trust level */
        color: #624E88; /* Color matching the close button */
        font-weight: bold; /* Make the text bold */
        position: absolute; /* Position it at the bottom left */
        bottom: 10px; /* Space from the bottom */
        left: 10px; /* Space from the left */
        transform: translateY(5px); /* Slightly pop out */
      }

      @media only screen and (max-width: 600px) {
        .modal {
          width: 90%; /* Full width on small screens */
          max-width: 90%; /* Limit max width on small screens */
        }

        .modal-content {
          font-size: 14px; /* Smaller font on mobile */
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
        <div class="modal-content">
          <div class="warning-text">
            Ova stranica je zabilježena da objavljuje neistinite sadržaje, upozorenje preporučeno prilikom čitanja.
          </div>
          <div class="trust-level">Ocjena: ${trustLevel}</div>
        </div>
      </div>
    </div>
  `;

  // JavaScript for modal functionality (open and close modal)
  const modalOverlay = shadowRoot.querySelector('.modal-overlay');
  const closeModalElements = shadowRoot.querySelectorAll('.close-modal');

  // Show modal automatically
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  } else {
    console.error("Modal overlay not found");
  }

  // Close modal when clicking on the close button
  closeModalElements.forEach(closeModal => {
    closeModal.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      shadowHost.remove(); // Remove modal after hiding
    });
  });

  // Close modal when clicking outside of the modal
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      shadowHost.remove(); // Remove modal after hiding
    }
  });
}

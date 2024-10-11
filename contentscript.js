// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.trustLevel) {
    showCustomPopup(message.trustLevel);
  }
});

function showCustomPopup(trustLevel) {
  // Create the custom UI as before
  const customUI = document.createElement('div');
  customUI.style.position = 'fixed';
  customUI.style.top = '0';
  customUI.style.left = '0';
  customUI.style.width = '100%';
  customUI.style.height = '100%';
  customUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  customUI.style.display = 'flex';
  customUI.style.alignItems = 'center';
  customUI.style.justifyContent = 'center';
  customUI.style.zIndex = '10000';

  // Modify the content to include the trust level
  customUI.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center; width: 300px;">
      <h2>Site Trust Level</h2>
      <p>This site is considered: <strong>${trustLevel}</strong></p>
      <button id="closeCustomUI" style="padding: 10px 20px; border: none; background-color: #333; color: white; cursor: pointer; border-radius: 5px;">Close</button>
    </div>
  `;

  // Append the custom UI to the page
  document.body.appendChild(customUI);

  // Add an event listener to close the popup
  document.getElementById('closeCustomUI').addEventListener('click', () => {
    customUI.remove();
  });
}

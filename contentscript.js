// contentScript.js

// Rnadom copy code for design
const customUI = document.createElement('div');
customUI.style.position = 'fixed';
customUI.style.top = '0';
customUI.style.left = '0';
customUI.style.width = '100%';
customUI.style.height = '100%';
customUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';  // Semi-transparent black background
customUI.style.display = 'flex';
customUI.style.alignItems = 'center';
customUI.style.justifyContent = 'center';
customUI.style.zIndex = '10000';  // Ensure it's on top of other elements

// Custom popup content
customUI.innerHTML = `
  <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center; width: 300px;">
    <h2>Special Notice</h2>
    <p>You are on a monitored website!</p>
    <button id="closeCustomUI" style="padding: 10px 20px; border: none; background-color: #333; color: white; cursor: pointer; border-radius: 5px;">Close</button>
  </div>
`;

// Append the custom UI to the page
document.body.appendChild(customUI);

// Add an event listener to close the modal when the "Close" button is clicked
document.getElementById('closeCustomUI').addEventListener('click', () => {
  customUI.remove();
});

console.log('Popup script loaded!');

// Get references to HTML elements
const gaslightButton = document.getElementById('gaslightButton');
const statusMessage = document.getElementById('statusMessage');
const responseDisplay = document.getElementById('responseDisplay');
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKeyButton');
const cancelApiKeyButton = document.getElementById('cancelApiKeyButton');

let openAIApiKey = ''; // Variable to store the OpenAI API key

// Function to create and append a ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple-effect');

    const ripple = button.getElementsByClassName('ripple-effect')[0];

    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// --- API Key Management Functions ---

// Function to save the API key using chrome.storage.local
async function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (key && key.startsWith('sk-')) { // Basic validation for OpenAI key format
        try {
            await chrome.storage.local.set({ openaiApiKey: key });
            openAIApiKey = key;
            statusMessage.textContent = 'OpenAI API Key saved successfully!';
            statusMessage.classList.remove('text-red-600');
            statusMessage.classList.add('text-green-600');
            setTimeout(() => statusMessage.textContent = '', 3000);
            settingsPanel.classList.add('hidden'); // Hide panel after saving
        } catch (error) {
            console.error('Error saving API Key:', error);
            statusMessage.textContent = 'Error saving API Key.';
            statusMessage.classList.remove('text-green-600');
            statusMessage.classList.add('text-red-600');
        }
    } else {
        statusMessage.textContent = 'Invalid API Key format. Must start with "sk-".';
        statusMessage.classList.remove('text-green-600');
        statusMessage.classList.add('text-red-600');
    }
}

// Function to load the API key from chrome.storage.local
async function loadApiKey() {
    try {
        const result = await chrome.storage.local.get('openaiApiKey');
        if (result.openaiApiKey) {
            openAIApiKey = result.openaiApiKey;
            apiKeyInput.value = openAIApiKey; // Pre-fill input if key exists
            console.log('OpenAI API Key loaded.');
        } else {
            console.log('No OpenAI API Key found.');
        }
    } catch (error) {
        console.error('Error loading API Key:', error);
    }
}

// --- Function to auto-type message into Facebook Marketplace textarea ---
async function autoTypeMessage(tabId, msg) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (messageToType) => {
                // Locate the message box. Facebook occasionally tweaks the placeholder
                // text, so check by aria-label first and fall back to a more generic query.
                const textarea =
                    document.querySelector('textarea[aria-label="Send seller a message"]') ||
                    document.querySelector('textarea[placeholder^="Send a"]');

                if (!textarea) {
                    console.warn("❌ Textarea not found on Marketplace page.");
                    return; // Don't proceed if textarea is not found
                }

                textarea.focus();
                // Simulate native input for React-based textareas
                const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                nativeInputSetter?.call(textarea, messageToType);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

                // Optionally, dispatch Enter key to send the message
                textarea.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                }));
                console.log("✅ Chet's message injected and sent.");
            },
            args: [msg]
        });
    } catch (err) {
        console.error("❌ Failed to inject typed message:", err);
        statusMessage.textContent = 'Failed to auto-type message.';
        statusMessage.classList.add('text-red-600');
    }
}


// --- Main Gaslight Button Click Listener ---
gaslightButton.addEventListener('click', async (event) => {
    createRipple(event); // Add ripple effect
    gaslightButton.disabled = true; // Disable button immediately

    responseDisplay.textContent = 'Chet is thinking...';
    responseDisplay.classList.remove('text-green-800', 'text-red-800');
    responseDisplay.classList.add('text-blue-800');

    statusMessage.textContent = 'Scraping data from Facebook Marketplace...';
    statusMessage.classList.remove('text-red-600', 'text-green-600'); // Clear any previous error styling

    try {
        // API Key Check (uses the globally loaded openAIApiKey)
        if (!openAIApiKey) {
            statusMessage.innerHTML = `<span class="text-red-600">Please enter your OpenAI API Key via the <i class="ph ph-gear"></i> settings.</span>`;
            responseDisplay.textContent = 'OpenAI API Key required to generate thoughts.';
            responseDisplay.classList.remove('text-blue-800');
            responseDisplay.classList.add('text-red-800');
            settingsPanel.classList.remove('hidden'); // Show settings panel if key is missing
            return;
        }

        // 1. Get current tab and validate URL
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url || !tab.url.startsWith('https://www.facebook.com/marketplace/item/')) {
            statusMessage.textContent = '⚠️ Go to a Facebook Marketplace listing first.';
            statusMessage.classList.add('text-red-600');
            responseDisplay.textContent = 'Chet only roasts Marketplace junk.';
            responseDisplay.classList.remove('text-blue-800');
            responseDisplay.classList.add('text-red-800');
            return;
        }

        // 2. Execute content.js to scrape data
        const scrapeResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'] // Assuming content.js exists and returns itemInfo
        });

        const itemInfo = scrapeResults[0]?.result;

        if (!itemInfo || !itemInfo.title) {
            statusMessage.textContent = '❌ Failed to scrape listing. DOM changed?';
            statusMessage.classList.add('text-red-600');
            responseDisplay.textContent = 'Chet can’t see this garbage.';
            responseDisplay.classList.remove('text-blue-800');
            responseDisplay.classList.add('text-red-800');
            return;
        }

        statusMessage.innerHTML = `
            <div class="flex items-center justify-center text-indigo-600">
                <svg class="animate-spin-custom h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Asking Chet for his opinion...
            </div>
        `;
        responseDisplay.textContent = 'Thinking...';
        responseDisplay.classList.remove('text-green-800', 'text-red-800');
        responseDisplay.classList.add('text-blue-800');

        // 3. Send message to background script for OpenAI API call
        const apiResponse = await chrome.runtime.sendMessage({
            action: "analyzeListing",
            itemInfo: itemInfo,
            apiKey: openAIApiKey // Pass the key from popup to background
        });

        console.log('📨 Popup: Received from background:', apiResponse);

        if (!apiResponse || apiResponse.error || !apiResponse.message) {
            const errorMessage = apiResponse?.error || 'No response from Chet.';
            statusMessage.textContent = `❌ ${errorMessage}`;
            statusMessage.classList.add('text-red-600');
            responseDisplay.textContent = `Chet is having a bad day: ${errorMessage}`;
            responseDisplay.classList.remove('text-blue-800');
            responseDisplay.classList.add('text-red-800');
            // Save empty or error state to storage if desired, or just clear previous
            chrome.storage.local.set({ lastChetResponse: '' });
            return;
        }

        // Show Chet's roast
        responseDisplay.textContent = apiResponse.message;
        statusMessage.textContent = '✅ Analysis complete!';
        statusMessage.classList.remove('text-red-600');
        statusMessage.classList.add('text-green-600');
        responseDisplay.classList.remove('text-blue-800');
        responseDisplay.classList.add('text-green-800');

        // --- NEW: Save the response to local storage ---
        await chrome.storage.local.set({ lastChetResponse: apiResponse.message });

        // 4. Auto-type into message box
        await autoTypeMessage(tab.id, apiResponse.message);

    } catch (error) {
        console.error('❌ Popup script error during main flow:', error);
        statusMessage.textContent = `Unexpected error: ${error.message}`;
        statusMessage.classList.add('text-red-600');
        responseDisplay.textContent = 'Chet broke something. Try again.';
        responseDisplay.classList.remove('text-blue-800');
        responseDisplay.classList.add('text-red-800');
        // Save empty or error state to storage if desired
        chrome.storage.local.set({ lastChetResponse: '' });
    } finally {
        gaslightButton.disabled = false; // Always re-enable button
        // Clear status message after a short delay if successful
        if (statusMessage.textContent.includes('complete!') || statusMessage.textContent.includes('successfully!')) {
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.classList.remove('text-green-600');
            }, 3000);
        }
    }
});

// --- Other Event Listeners ---
settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden'); // Toggle visibility of the settings panel
    if (!settingsPanel.classList.contains('hidden')) {
        apiKeyInput.focus(); // Focus input when panel opens
    }
});

saveApiKeyButton.addEventListener('click', saveApiKey);

cancelApiKeyButton.addEventListener('click', () => {
    settingsPanel.classList.add('hidden'); // Hide panel
    statusMessage.textContent = ''; // Clear status message
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadApiKey(); // Load API key on startup

    // --- NEW: Load the last saved response from local storage ---
    try {
        const result = await chrome.storage.local.get('lastChetResponse');
        if (result.lastChetResponse) {
            responseDisplay.textContent = result.lastChetResponse;
            responseDisplay.classList.remove('text-blue-800'); // Assume it's a previously successful response
            responseDisplay.classList.add('text-green-800');
        } else {
            responseDisplay.textContent = "Chet's thoughts will appear here...";
            responseDisplay.classList.remove('text-green-800', 'text-red-800');
            responseDisplay.classList.add('text-blue-800'); // Default text color
        }
    } catch (error) {
        console.error('Error loading last response:', error);
        responseDisplay.textContent = "Error loading previous response. Chet's thoughts will appear here...";
        responseDisplay.classList.remove('text-green-800', 'text-red-800');
        responseDisplay.classList.add('text-blue-800');
    }
});


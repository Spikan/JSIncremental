// ===============================================
// GOD MODULE - Divine Oracle and Sacred Wisdom
// ===============================================

// LCG (Linear Congruential Generator) for deterministic randomness
// This provides consistent, reproducible randomness for the god feature
// while maintaining good statistical properties
let lcgSeed = Date.now();

function lcgNext() {
    // LCG parameters: a = 1664525, c = 1013904223, m = 2^32
    // These are standard LCG parameters that provide good randomness
    lcgSeed = (1664525 * lcgSeed + 1013904223) >>> 0;
    return lcgSeed / 4294967296; // Normalize to [0, 1)
}

function lcgRandomInt(min, max) {
    return Math.floor(lcgNext() * (max - min + 1)) + min;
}

// Function to reset LCG seed (useful for testing or changing randomness)
function resetLCGSeed(newSeed = null) {
    lcgSeed = newSeed || Date.now();
    console.log('LCG seed reset to:', lcgSeed);
}

// Word bank array loaded from JSON
let bibleWordBank = null;

// Load the word bank from JSON file
async function loadWordBank() {
    if (!bibleWordBank) {
        try {
            console.log('Loading word bank from word_bank.json...');
            const response = await fetch('word_bank.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.words || !Array.isArray(data.words)) {
                throw new Error('Invalid word bank format - expected {words: [...]} structure');
            }

            bibleWordBank = data.words; // Access the 'words' array from the JSON structure
            console.log(`✅ Successfully loaded ${bibleWordBank.length} words from word_bank.json`);

        } catch (error) {
            console.error('❌ Failed to load word bank:', error);
            // Fallback to a small set of words if JSON fails to load
            bibleWordBank = ['lord', 'god', 'jesus', 'christ', 'spirit', 'holy', 'heaven', 'earth'];
            console.log('Using fallback word bank with', bibleWordBank.length, 'words');
        }
    }
    return bibleWordBank;
}

function getRandomBibleWord() {
    // Use the comprehensive word bank from word_bank.json
    // This contains 13,290 unique words from the King James Bible
    // (That's more words than most operating systems have for divine guidance!)
    if (!bibleWordBank) {
        console.warn('Word bank not loaded yet, using fallback');
        return 'word';
    }

    const randomIndex = lcgRandomInt(0, bibleWordBank.length - 1);
    return bibleWordBank[randomIndex];
}

// Function to check if word bank is ready
function isWordBankReady() {
    return bibleWordBank && bibleWordBank.length > 0;
}

// Helper function to generate Bible words
function generateBibleWords() {
    // Clean response - just 32 words, one per line
    // (Because 32-bit should be enough for anyone... or 64-bit if you're feeling divine)
    let words = [];

    // Generate exactly 32 words using LCG
    for (let i = 0; i < 32; i++) {
        words.push(getRandomBibleWord());
    }

    // Return just the words, one per line
    return words.join('\n');
}

// Function to get divine response (only phrases, no Giphy)
function getDivineResponse(userMessage) {
    // Ensure word bank is loaded
    if (!bibleWordBank || bibleWordBank.length === 0) {
        console.warn('Word bank not loaded yet, attempting to load...');
        loadWordBank().then(() => {
            // Retry the response after loading
            if (bibleWordBank && bibleWordBank.length > 0) {
                const response = generateBibleWords();
                addGodMessage(response);
            } else {
                addGodMessage("The sacred texts are temporarily unavailable. Please try again.");
            }
        }).catch(error => {
            console.error('Failed to load word bank:', error);
            addGodMessage("Divine wisdom is experiencing technical difficulties.");
        });
        return "Loading divine wisdom...";
    }

    return generateBibleWords();
}

function addGodMessage(content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message god-message';

    // Use divine styling for consistency
    messageDiv.classList.add('templeos-message');
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="images/TempleOS.jpg" alt="God" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
        </div>
        <div class="message-content">
            <div class="message-sender">God</div>
            <div class="message-text">${content}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function getGodResponse(userMessage) {
    try {
        // Check for the sacred "geodude" keyword first
        if (userMessage.toLowerCase().includes('geodude')) {
            // Trigger YouTube video autoplay
            triggerGeodudeVideo();
            addGodMessage("🎵 The sacred melodies of Geodude echo through the digital realm...");
            return;
        }

        // Divine mode is now the default - always respond with sacred phrases
        const divineResponse = getDivineResponse(userMessage);
        addGodMessage(divineResponse);
        return; // Exit early for divine mode



    } catch (error) {
        console.error('Error getting divine response:', error);

        const errorMessages = [
            "The divine connection is experiencing technical difficulties. Please try again later!",
            "The sacred system is temporarily offline. My apologies for the inconvenience!",
            "Even divine systems have bad days. Try again in a moment!",
            "The holy servers are overloaded. Please wait and try again!",
            "My sacred connection is acting up. Give it a moment and try again!"
        ];

        const randomError = errorMessages[lcgRandomInt(0, errorMessages.length - 1)];
        addGodMessage(randomError);
    }
}

// Sacred Geodude YouTube video autoplay function
function triggerGeodudeVideo() {
        // Two sacred YouTube videos that will autoplay at random
    const geodudeVideos = [
        'https://www.youtube.com/embed/Mhvl7X_as8I?autoplay=1&mute=0', // Geodude video 1
        'https://www.youtube.com/embed/ok7fOwdk2gc?autoplay=1&mute=0'  // Geodude video 2
    ];

    // Randomly select one of the two videos using LCG
    const randomVideo = geodudeVideos[lcgRandomInt(0, geodudeVideos.length - 1)];

    // Create video modal if it doesn't exist
    let videoModal = document.getElementById('geodudeVideoModal');
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'geodudeVideoModal';
        videoModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close Sacred Video';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: #00FF00;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            z-index: 10001;
        `;
        closeBtn.onclick = () => {
            videoModal.remove();
        };

        // Create iframe for YouTube video
        const videoFrame = document.createElement('iframe');
        videoFrame.src = randomVideo;
        videoFrame.style.cssText = `
            width: 80%;
            height: 80%;
            border: 2px solid #00FF00;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        `;
        videoFrame.allow = 'autoplay; encrypted-media';

        videoModal.appendChild(closeBtn);
        videoModal.appendChild(videoFrame);
        document.body.appendChild(videoModal);

        // Auto-close after 30 seconds (or user can close manually)
        setTimeout(() => {
            if (videoModal.parentNode) {
                videoModal.remove();
            }
        }, 30000);
    } else {
        // If modal already exists, just update the video source
        const videoFrame = videoModal.querySelector('iframe');
        if (videoFrame) {
            videoFrame.src = randomVideo;
        }
        videoModal.style.display = 'flex';
    }
}

// ===============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ===============================================

// Make functions globally available for HTML onclick handlers
window.addGodMessage = addGodMessage;
window.getGodResponse = getGodResponse;
window.triggerGeodudeVideo = triggerGeodudeVideo;
window.loadWordBank = loadWordBank;
window.isWordBankReady = isWordBankReady;
window.resetLCGSeed = resetLCGSeed;

// Initialize word bank on module load
loadWordBank();

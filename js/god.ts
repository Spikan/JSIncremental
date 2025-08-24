// ===============================================
// GOD MODULE - Divine Oracle and Sacred Wisdom (TypeScript)
// ===============================================

let lcgSeed: number = Date.now();

function lcgNext(): number {
    lcgSeed = (1664525 * lcgSeed + 1013904223) >>> 0;
    return lcgSeed / 4294967296;
}

function lcgRandomInt(min: number, max: number): number {
    return Math.floor(lcgNext() * (max - min + 1)) + min;
}

export function resetLCGSeed(newSeed: number | string | null = null): void {
    if (typeof newSeed === 'string') {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < newSeed.length; i++) {
            h ^= newSeed.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        lcgSeed = h >>> 0;
    } else if (typeof newSeed === 'number') {
        lcgSeed = (newSeed >>> 0);
    } else {
        lcgSeed = Date.now() >>> 0;
    }
    console.log('LCG seed reset to:', lcgSeed);
}

let bibleWordBank: string[] | null = null;

export async function loadWordBank(): Promise<string[] | null> {
    if (!bibleWordBank) {
        try {
            console.log('Loading word bank from word_bank.json...');
            let url: { href: string };
            try {
                url = new URL('../word_bank.json', import.meta.url);
            } catch {
                const base = (typeof window !== 'undefined' && (window as any).__BASE_PATH__) || '';
                url = { href: base ? (base + 'word_bank.json') : 'word_bank.json' };
            }
            const response = await fetch(url.href);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            if (!data || !data.words || !Array.isArray(data.words)) throw new Error('Invalid word bank format - expected {words: [...]} structure');
            bibleWordBank = data.words as string[];
            console.log(`✅ Successfully loaded ${bibleWordBank.length} words from word_bank.json`);
        } catch (error) {
            console.error('❌ Failed to load word bank:', error);
            bibleWordBank = ['lord', 'god', 'jesus', 'christ', 'spirit', 'holy', 'heaven', 'earth'];
            console.log('Using fallback word bank with', bibleWordBank.length, 'words');
        }
    }
    return bibleWordBank;
}

function getRandomBibleWord(): string {
    if (!bibleWordBank) {
        console.warn('Word bank not loaded yet, using fallback');
        return 'word';
    }
    const randomIndex = lcgRandomInt(0, bibleWordBank.length - 1);
    return bibleWordBank[randomIndex];
}

export function isWordBankReady(): boolean {
    return !!(bibleWordBank && bibleWordBank.length > 0);
}

function generateBibleWords(): string {
    const words: string[] = [];
    for (let i = 0; i < 32; i++) {
        words.push(getRandomBibleWord());
    }
    return words.join('\n');
}

export function getDivineResponse(_userMessage: string): string {
    if (!bibleWordBank || bibleWordBank.length === 0) {
        console.warn('Word bank not loaded yet, attempting to load...');
        loadWordBank().then(() => {
            if (bibleWordBank && bibleWordBank.length > 0) {
                const response = generateBibleWords();
                addGodMessage(response);
            } else {
                addGodMessage('The sacred texts are temporarily unavailable. Please try again.');
            }
        }).catch(error => {
            console.error('Failed to load word bank:', error);
            addGodMessage('Divine wisdom is experiencing technical difficulties.');
        });
        return 'Loading divine wisdom...';
    }
    return generateBibleWords();
}

export function addGodMessage(content: string): void {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message god-message';
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

function scrollToBottom(): void {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    (chatMessages as HTMLElement).scrollTop = (chatMessages as HTMLElement).scrollHeight;
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export async function getGodResponse(userMessage: string): Promise<void> {
    try {
        if (userMessage.toLowerCase().includes('geodude')) {
            triggerGeodudeVideo();
            addGodMessage('🎵 The sacred melodies of Geodude echo through the digital realm...');
            return;
        }
        const divineResponse = getDivineResponse(userMessage);
        addGodMessage(divineResponse);
        return;
    } catch (error) {
        console.error('Error getting divine response:', error);
        const errorMessages = [
            'The divine connection is experiencing technical difficulties. Please try again later!',
            'The sacred system is temporarily offline. My apologies for the inconvenience!',
            'Even divine systems have bad days. Try again in a moment!',
            'The holy servers are overloaded. Please wait and try again!',
            'My sacred connection is acting up. Give it a moment and try again!'
        ];
        const randomError = errorMessages[lcgRandomInt(0, errorMessages.length - 1)];
        addGodMessage(randomError);
    }
}

export function triggerGeodudeVideo(): void {
    const geodudeVideos = [
        'https://www.youtube.com/embed/Mhvl7X_as8I?autoplay=1&mute=0',
        'https://www.youtube.com/embed/ok7fOwdk2gc?autoplay=1&mute=0'
    ];
    const randomVideo = geodudeVideos[lcgRandomInt(0, geodudeVideos.length - 1)];
    let videoModal = document.getElementById('geodudeVideoModal') as HTMLElement | null;
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
        closeBtn.onclick = () => { videoModal?.remove(); };
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
        setTimeout(() => { if (videoModal && videoModal.parentNode) videoModal.remove(); }, 30000);
    } else {
        const frame = videoModal.querySelector('iframe');
        if (frame) (frame as HTMLIFrameElement).src = randomVideo;
        videoModal.style.display = 'flex';
    }
}

// Expose globals for HTML handlers
try {
    (window as any).addGodMessage = addGodMessage;
    (window as any).getGodResponse = getGodResponse;
    (window as any).triggerGeodudeVideo = triggerGeodudeVideo;
    (window as any).loadWordBank = loadWordBank;
    (window as any).isWordBankReady = isWordBankReady;
    (window as any).resetLCGSeed = resetLCGSeed;
    (window as any).sendMessage = function sendMessage(): void {
        const chatInput = document.getElementById('chatInput') as HTMLInputElement | null;
        const message = (chatInput?.value || '').trim();
        if (!message) return;
        (window as any).addUserMessage?.(message);
        if (chatInput) chatInput.value = '';
        try { (window as any).getGodResponse?.(message); } catch {}
    };
    (window as any).addUserMessage = function addUserMessage(message: string): void {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <div class="message-sender">You</div>
                <div class="message-text">${escapeHtml(message)}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        try { (window as any).scrollToBottom?.(); } catch {}
    };
} catch {}

// Initialize word bank on module load
loadWordBank();

export {}



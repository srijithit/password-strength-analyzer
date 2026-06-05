// Password Strength Analyzer - Core Logic

// Clean wordlist for Diceware passphrase generation (120 memorable words)
const DICEWARE_WORDS = [
    "apple", "autumn", "breeze", "backup", "banana", "beacon", "bounce", "brave", "bright", "button",
    "cabin", "camel", "camera", "canvas", "canyon", "castle", "cherry", "cipher", "clever", "cloud",
    "coffee", "copper", "crater", "crypto", "crystal", "danger", "desert", "device", "digital", "dinner",
    "dolphin", "dragon", "dream", "driver", "eagle", "earth", "engine", "factor", "forest", "fossil",
    "galaxy", "garden", "garlic", "gentle", "glance", "golden", "guitar", "harbor", "helmet", "honest",
    "hunter", "hybrid", "island", "jacket", "jaguar", "jungle", "kernel", "keyboard", "kitten", "ladder",
    "lantern", "legacy", "lemon", "leopard", "light", "lizard", "magnet", "matrix", "melody", "memory",
    "monkey", "morning", "mountain", "nebula", "network", "ninja", "noble", "ocean", "olive", "orbit",
    "oxygen", "oyster", "palace", "pattern", "penguin", "pepper", "planet", "pocket", "portal", "proton",
    "pulse", "quantum", "rabbit", "radar", "rainbow", "rescue", "river", "rocket", "runner", "saddle",
    "shadow", "shield", "silent", "silver", "sketch", "solar", "sphere", "spider", "spring", "stable",
    "stone", "summer", "sunlight", "temple", "timber", "tunnel", "valley", "velvet", "volcano", "vortex"
];

// Document Elements
let passwordInput, togglePasswordBtn;
let strengthLabel, strengthScoreVal, strengthRankVal;
let entropyVal, timePC, timeGPU, timeBotnet;
let checkLength, checkUpper, checkLower, checkNumber, checkSymbol, checkUnique;
let vulnPanel, vulnDesc;
let strengthSegments;

// Generator Elements
let genLengthSlider, genLengthVal;
let optUpper, optLower, optNumbers, optSymbols, optDiceware;
let suggestionText, btnGenerate, btnCopy;

// Mock DB Elements
let dbUsername, dbPassword, btnAuthRegister, btnAuthLogin;
let dbUserDisplay, dbLoggedInPanel, dbLoggedOutPanel, btnAuthLogout;
let currentUsernameSpan, newPasswordInput, btnChangePassword;
let passwordHistoryList;

// Active Session
let activeUser = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initDOMElements();
    setupEventListeners();
    updateAnalyzer();
    loadActiveSession();
    initBgCanvas(); // Start background cyber tech UI animation
});

function initDOMElements() {
    // Analyzer Elements
    passwordInput = document.getElementById("password-input");
    togglePasswordBtn = document.getElementById("toggle-password-btn");
    strengthLabel = document.getElementById("strength-label");
    strengthScoreVal = document.getElementById("strength-score-val");
    entropyVal = document.getElementById("entropy-val");
    strengthRankVal = document.getElementById("strength-rank");
    
    // Brute Force Times
    timePC = document.getElementById("time-pc");
    timeGPU = document.getElementById("time-gpu");
    timeBotnet = document.getElementById("time-botnet");
    
    // Checklist
    checkLength = document.getElementById("check-length");
    checkUpper = document.getElementById("check-upper");
    checkLower = document.getElementById("check-lower");
    checkNumber = document.getElementById("check-number");
    checkSymbol = document.getElementById("check-symbol");
    checkUnique = document.getElementById("check-unique");
    
    // Vuln Panel
    vulnPanel = document.getElementById("vulnerabilities-panel");
    vulnDesc = document.getElementById("vulnerabilities-desc");
    
    // Segments
    strengthSegments = document.querySelectorAll(".strength-segment");
    
    // Generator
    genLengthSlider = document.getElementById("gen-length");
    genLengthVal = document.getElementById("gen-length-val");
    optUpper = document.getElementById("opt-upper");
    optLower = document.getElementById("opt-lower");
    optNumbers = document.getElementById("opt-number");
    optSymbols = document.getElementById("opt-symbol");
    optDiceware = document.getElementById("opt-diceware");
    suggestionText = document.getElementById("suggestion-text");
    btnGenerate = document.getElementById("btn-generate");
    btnCopy = document.getElementById("btn-copy");
    
    // Mock DB
    dbUsername = document.getElementById("db-username");
    dbPassword = document.getElementById("db-password");
    btnAuthRegister = document.getElementById("btn-auth-register");
    btnAuthLogin = document.getElementById("btn-auth-login");
    dbUserDisplay = document.getElementById("db-user-display");
    dbLoggedInPanel = document.getElementById("db-logged-in-panel");
    dbLoggedOutPanel = document.getElementById("db-logged-out-panel");
    btnAuthLogout = document.getElementById("btn-auth-logout");
    currentUsernameSpan = document.getElementById("current-username");
    newPasswordInput = document.getElementById("new-password-input");
    btnChangePassword = document.getElementById("btn-change-password");
    passwordHistoryList = document.getElementById("password-history-list");
}

function setupEventListeners() {
    // Real-time strength analyzer
    passwordInput.addEventListener("input", updateAnalyzer);
    
    // Password visibility toggle
    togglePasswordBtn.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        // Toggle icon visual
        if (type === "text") {
            togglePasswordBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
            `;
        } else {
            togglePasswordBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    });
    
    // Generator length slider
    genLengthSlider.addEventListener("input", () => {
        const isDiceware = optDiceware.checked;
        genLengthVal.textContent = genLengthSlider.value + (isDiceware ? " words" : " chars");
    });
    
    // Generator type toggle (Diceware changes labels)
    optDiceware.addEventListener("change", () => {
        const checked = optDiceware.checked;
        if (checked) {
            genLengthSlider.min = 3;
            genLengthSlider.max = 10;
            if (genLengthSlider.value < 3) genLengthSlider.value = 3;
            if (genLengthSlider.value > 10) genLengthSlider.value = 6;
            genLengthVal.textContent = genLengthSlider.value + " words";
            
            // Disable sub-options
            optUpper.disabled = true;
            optLower.disabled = true;
            optNumbers.disabled = true;
            optSymbols.disabled = true;
        } else {
            genLengthSlider.min = 8;
            genLengthSlider.max = 64;
            if (genLengthSlider.value < 8) genLengthSlider.value = 16;
            genLengthVal.textContent = genLengthSlider.value + " chars";
            
            // Enable sub-options
            optUpper.disabled = false;
            optLower.disabled = false;
            optNumbers.disabled = false;
            optSymbols.disabled = false;
        }
        generateSuggestedPassword();
    });
    
    btnGenerate.addEventListener("click", generateSuggestedPassword);
    
    // Suggestion copy to clipboard
    btnCopy.addEventListener("click", () => {
        const text = suggestionText.textContent;
        if (text && text !== "Click generate...") {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Password copied to clipboard!");
            }).catch(() => {
                showToast("Failed to copy password.");
            });
        }
    });
    
    // Mock Authentication Logic
    btnAuthRegister.addEventListener("click", registerUser);
    btnAuthLogin.addEventListener("click", loginUser);
    btnAuthLogout.addEventListener("click", logoutUser);
    btnChangePassword.addEventListener("click", changePassword);
    
    // Educational Tabs Navigation
    const tabs = document.querySelectorAll(".edu-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const targetId = tab.getAttribute("data-tab");
            const panels = document.querySelectorAll(".edu-content-panel");
            panels.forEach(p => p.classList.remove("active"));
            document.getElementById(targetId).classList.add("active");
        });
    });
}

// Global Toast System
function showToast(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
    `;
    
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// -------------------------------------------------------------
// PASSWORD STRENGTH ANALYSIS LOGIC
// -------------------------------------------------------------

function calculateComplexity(password) {
    const pool = {
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^a-zA-Z0-9]/.test(password)
    };
    
    let poolSize = 0;
    if (pool.lowercase) poolSize += 26;
    if (pool.uppercase) poolSize += 26;
    if (pool.numbers) poolSize += 10;
    if (pool.symbols) poolSize += 33; // Approx standard keyboard symbols
    
    return { pool, poolSize };
}

function updateAnalyzer() {
    const password = passwordInput.value;
    
    if (password.length === 0) {
        resetAnalyzerUI();
        return;
    }
    
    // 1. Calculate Metrics
    const len = password.length;
    const { pool, poolSize } = calculateComplexity(password);
    
    // Shannon Entropy: H = L * log2(R)
    let entropy = 0;
    if (poolSize > 0) {
        entropy = len * Math.log2(poolSize);
    }
    
    // 2. Perform vulnerability and common checks
    const commonCheck = window.PasswordDb.isCommon(password);
    
    // Set entropy to 0 if password is dead common
    if (commonCheck.matched && commonCheck.type === "common_password") {
        entropy = 0;
    }
    
    // 3. Update checklist UI
    updateChecklist(password, pool, commonCheck);
    
    // 4. Calculate Score (0 to 5)
    let score = 0;
    
    // Rules for scoring:
    if (len >= 8) score++;
    if (len >= 12) score++;
    if (pool.lowercase && pool.uppercase) score++;
    if (pool.numbers) score++;
    if (pool.symbols) score++;
    
    // Penalties
    if (len < 6) score = Math.min(score, 1);
    if (commonCheck.matched) {
        // Severe penalty for common passwords or patterns
        if (commonCheck.type === "common_password") score = 0;
        else score = Math.max(0, score - 2);
    }
    
    // Cap score at 5
    score = Math.max(0, Math.min(5, score));
    
    // 5. Update Vulnerabilities UI
    if (commonCheck.matched) {
        vulnPanel.classList.add("visible");
        vulnDesc.innerHTML = `<strong>Vulnerability Warning:</strong> ${commonCheck.detail}`;
    } else {
        vulnPanel.classList.remove("visible");
    }
    
    // 6. Update UI labels and colors
    updateStrengthVisuals(score, entropy);
    
    // 7. Calculate and update Brute Force Estimates
    updateBruteForceEstimates(entropy, commonCheck.matched);
}

function resetAnalyzerUI() {
    strengthLabel.textContent = "Enter Password";
    strengthLabel.className = "strength-label";
    strengthScoreVal.textContent = "0";
    entropyVal.textContent = "0";
    strengthRankVal.textContent = "Checked";
    strengthRankVal.className = "";
    
    strengthSegments.forEach(seg => {
        seg.style.backgroundColor = "transparent";
    });
    
    vulnPanel.classList.remove("visible");
    
    // Reset Checklist
    const checks = [checkLength, checkUpper, checkLower, checkNumber, checkSymbol, checkUnique];
    checks.forEach(chk => {
        chk.className = "checklist-item unmet";
        chk.querySelector("svg").outerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
        `;
    });
    
    timePC.textContent = "-";
    timeGPU.textContent = "-";
    timeBotnet.textContent = "-";
}

function updateChecklist(password, pool, commonCheck) {
    const setStatus = (element, state) => {
        element.className = `checklist-item ${state}`;
        const svg = element.querySelector("svg");
        
        if (state === "met") {
            svg.outerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
        } else if (state === "warning") {
            svg.outerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        } else {
            svg.outerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            `;
        }
    };
    
    // Length (>= 12 recommended)
    if (password.length >= 12) setStatus(checkLength, "met");
    else if (password.length >= 8) setStatus(checkLength, "met"); // Acceptable minimum
    else setStatus(checkLength, "unmet");
    
    // Capital & Lowercase
    setStatus(checkUpper, pool.uppercase ? "met" : "unmet");
    setStatus(checkLower, pool.lowercase ? "met" : "unmet");
    
    // Numbers & Symbols
    setStatus(checkNumber, pool.numbers ? "met" : "unmet");
    setStatus(checkSymbol, pool.symbols ? "met" : "unmet");
    
    // Uniqueness (No vulnerabilities matched)
    if (commonCheck.matched) {
        setStatus(checkUnique, "warning");
    } else {
        setStatus(checkUnique, "met");
    }
}

function updateStrengthVisuals(score, entropy) {
    strengthScoreVal.textContent = score;
    entropyVal.textContent = Math.round(entropy);
    
    const states = [
        { label: "Very Weak", class: "text-weak", color: "var(--color-weak)", count: 1 },
        { label: "Weak", class: "text-weak", color: "var(--color-weak)", count: 2 },
        { label: "Fair", class: "text-fair", color: "var(--color-fair)", count: 3 },
        { label: "Good", class: "text-good", color: "var(--color-good)", count: 4 },
        { label: "Strong", class: "text-strong", color: "var(--color-strong)", count: 5 },
        { label: "Excellent", class: "text-excellent", color: "var(--color-excellent)", count: 5 }
    ];
    
    const currentState = states[score];
    strengthLabel.textContent = currentState.label;
    strengthLabel.className = `strength-label ${currentState.class}`;
    
    const rankLabels = ["High Risk", "Weak", "Moderate", "Good", "Strong", "Excellent"];
    strengthRankVal.textContent = rankLabels[score];
    strengthRankVal.className = currentState.class;
    
    // Fill segments
    strengthSegments.forEach((seg, index) => {
        if (index < currentState.count) {
            seg.style.backgroundColor = currentState.color;
            seg.style.boxShadow = `0 0 8px ${currentState.color}`;
        } else {
            seg.style.backgroundColor = "transparent";
            seg.style.boxShadow = "none";
        }
    });
}

function updateBruteForceEstimates(entropy, isCommon) {
    if (isCommon) {
        timePC.textContent = "Instant (leaked/common)";
        timeGPU.textContent = "Instant";
        timeBotnet.textContent = "Instant";
        return;
    }
    
    // C = 2^H
    const combinations = Math.pow(2, entropy);
    
    // Speeds:
    const speedPC = 1e7;      // 10 Million hashes/sec (Standard PC CPU/GPU)
    const speedGPU = 1e11;     // 100 Billion hashes/sec (Modern High-end Attack Rig)
    const speedBotnet = 1e15;  // 1 Quadrillion hashes/sec (Advanced Nation State Botnet)
    
    timePC.textContent = formatTime(combinations / speedPC);
    timeGPU.textContent = formatTime(combinations / speedGPU);
    timeBotnet.textContent = formatTime(combinations / speedBotnet);
}

function formatTime(seconds) {
    if (seconds < 0.01) return "Instantly";
    if (seconds < 1) return "Under a second";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    
    const years = days / 365;
    if (years < 100) return `${Math.round(years)} years`;
    
    const centuries = years / 100;
    if (centuries < 1000000) return `${Math.round(centuries)} centuries`;
    
    return "Eons (10^6+ centuries)";
}

// -------------------------------------------------------------
// PASSWORD GENERATION LOGIC
// -------------------------------------------------------------

function generateSuggestedPassword() {
    const isDiceware = optDiceware.checked;
    const len = parseInt(genLengthSlider.value);
    
    if (isDiceware) {
        // Select random words from DICEWARE_WORDS
        const selectedWords = [];
        for (let i = 0; i < len; i++) {
            const index = Math.floor(Math.random() * DICEWARE_WORDS.length);
            selectedWords.push(DICEWARE_WORDS[index]);
        }
        const passphrase = selectedWords.join("-");
        suggestionText.textContent = passphrase;
    } else {
        // Random character password
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        
        let charset = "";
        let mandatoryChars = [];
        
        if (optUpper.checked) {
            charset += upper;
            mandatoryChars.push(upper[Math.floor(Math.random() * upper.length)]);
        }
        if (optLower.checked) {
            charset += lower;
            mandatoryChars.push(lower[Math.floor(Math.random() * lower.length)]);
        }
        if (optNumbers.checked) {
            charset += numbers;
            mandatoryChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
        }
        if (optSymbols.checked) {
            charset += symbols;
            mandatoryChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        
        // Fallback if none checked
        if (charset === "") {
            charset += lower + numbers;
            mandatoryChars.push(lower[Math.floor(Math.random() * lower.length)]);
            mandatoryChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
        }
        
        let password = "";
        // Pre-fill with mandatory characters to ensure all criteria are strictly met
        password += mandatoryChars.join("");
        
        const remainingLength = len - mandatoryChars.length;
        for (let i = 0; i < remainingLength; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        // Shuffle the password to hide pre-filled characters position
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        suggestionText.textContent = password;
    }
}

// -------------------------------------------------------------
// SECURE PASSWORD HISTORY DATABASE LOGIC
// -------------------------------------------------------------

// Web Crypto SHA-256 Hasher
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsersDb() {
    const db = localStorage.getItem("password_analyzer_users");
    return db ? JSON.parse(db) : {};
}

function saveUsersDb(db) {
    localStorage.setItem("password_analyzer_users", JSON.stringify(db));
}

async function registerUser() {
    const username = dbUsername.value.trim().toLowerCase();
    const password = dbPassword.value;
    
    if (!username || !password) {
        showToast("Please enter both username and password.");
        return;
    }
    
    const db = getUsersDb();
    if (db[username]) {
        showToast("Username already exists. Please login.");
        return;
    }
    
    // Hash the password for storage
    const passwordHash = await hashString(password);
    
    db[username] = {
        username: username,
        passwordHistory: [passwordHash] // Keep track of the last 5 hashes
    };
    
    saveUsersDb(db);
    showToast("Registration successful! Logging in...");
    
    dbUsername.value = "";
    dbPassword.value = "";
    
    setSession(username);
}

async function loginUser() {
    const username = dbUsername.value.trim().toLowerCase();
    const password = dbPassword.value;
    
    if (!username || !password) {
        showToast("Please enter both username and password.");
        return;
    }
    
    const db = getUsersDb();
    const user = db[username];
    
    if (!user) {
        showToast("User not found. Check username or register.");
        return;
    }
    
    // Hash input password and verify against current password (the latest hash)
    const passwordHash = await hashString(password);
    const currentHash = user.passwordHistory[user.passwordHistory.length - 1];
    
    if (passwordHash === currentHash) {
        showToast("Login successful!");
        dbUsername.value = "";
        dbPassword.value = "";
        setSession(username);
    } else {
        showToast("Incorrect password. Please try again.");
    }
}

function setSession(username) {
    activeUser = username;
    sessionStorage.setItem("active_security_user", username);
    renderSessionUI();
}

function loadActiveSession() {
    const savedSession = sessionStorage.getItem("active_security_user");
    if (savedSession) {
        activeUser = savedSession;
        renderSessionUI();
    } else {
        renderLoggedOutUI();
    }
}

function logoutUser() {
    activeUser = null;
    sessionStorage.removeItem("active_security_user");
    renderLoggedOutUI();
    showToast("Logged out successfully.");
}

function renderSessionUI() {
    dbLoggedOutPanel.style.display = "none";
    dbLoggedInPanel.style.display = "flex";
    currentUsernameSpan.textContent = activeUser;
    
    // Render current hashes in database for training visualization
    renderHashHistory();
}

function renderLoggedOutUI() {
    dbLoggedOutPanel.style.display = "flex";
    dbLoggedInPanel.style.display = "none";
}

function renderHashHistory() {
    const db = getUsersDb();
    const user = db[activeUser];
    if (!user) return;
    
    passwordHistoryList.innerHTML = "";
    
    // Render starting with the oldest hash
    user.passwordHistory.forEach((hash, idx) => {
        const li = document.createElement("li");
        li.className = "history-item";
        
        let label = `Password Hash #${idx + 1}`;
        if (idx === user.passwordHistory.length - 1) {
            label += " (Active)";
        }
        
        li.innerHTML = `
            <span>${label}</span>
            <span class="hash" title="${hash}">${hash.substring(0, 10)}...${hash.substring(54)}</span>
        `;
        passwordHistoryList.appendChild(li);
    });
}

async function changePassword() {
    const newPassword = newPasswordInput.value;
    if (!newPassword) {
        showToast("Please enter a new password.");
        return;
    }
    
    const db = getUsersDb();
    const user = db[activeUser];
    if (!user) return;
    
    // 1. Check strength first
    const complexity = calculateComplexity(newPassword);
    const commonCheck = window.PasswordDb.isCommon(newPassword);
    const len = newPassword.length;
    
    if (len < 8 || (commonCheck.matched && commonCheck.type === "common_password")) {
        showToast("Change failed: New password is too weak or compromised.");
        return;
    }
    
    // 2. Hash new password
    const newHash = await hashString(newPassword);
    
    // 3. Prevent Reuse Check (Core cryptograhic feature)
    // Check if new hash exists in the password history
    if (user.passwordHistory.includes(newHash)) {
        showToast("Security Block: Cannot reuse any of your last 5 passwords!");
        
        // Flash the match visual in database history
        const hashItems = passwordHistoryList.querySelectorAll(".history-item");
        const matchIdx = user.passwordHistory.indexOf(newHash);
        if (matchIdx !== -1 && hashItems[matchIdx]) {
            hashItems[matchIdx].style.border = "1.5px solid var(--color-weak)";
            hashItems[matchIdx].style.background = "rgba(239, 68, 68, 0.1)";
            setTimeout(() => {
                hashItems[matchIdx].style.border = "1px solid rgba(255, 255, 255, 0.03)";
                hashItems[matchIdx].style.background = "rgba(255, 255, 255, 0.01)";
            }, 3000);
        }
        return;
    }
    
    // 4. Update History (Max 5 items)
    user.passwordHistory.push(newHash);
    if (user.passwordHistory.length > 5) {
        user.passwordHistory.shift(); // Remove oldest
    }
    
    // 5. Save and notify
    db[activeUser] = user;
    saveUsersDb(db);
    
    newPasswordInput.value = "";
    renderHashHistory();
    showToast("Password updated successfully!");
}

// -------------------------------------------------------------
// CYBER TECH BACKGROUND ANIMATION CANVAS
// -------------------------------------------------------------
function initBgCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    // Resize handler
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    // Nodes for interactive neural constellation network
    const nodes = [];
    const maxNodes = 60;
    
    for (let i = 0; i < maxNodes; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? "rgba(99, 102, 241, 0.55)" : "rgba(6, 182, 212, 0.55)" // Indigo vs Cyan
        });
    }
    
    // Faint falling binary code streams
    const streams = [];
    const maxStreams = 18;
    for (let i = 0; i < maxStreams; i++) {
        streams.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: Math.random() * 0.6 + 0.3,
            chars: Array.from({ length: 6 }, () => Math.random() > 0.5 ? "1" : "0"),
            opacity: Math.random() * 0.15 + 0.05
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // 1. Draw subtle background cyber grid layout
        ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
        ctx.lineWidth = 1;
        const gridSize = 90;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // 2. Render falling binary streams
        ctx.font = "9px monospace";
        for (let s of streams) {
            s.y += s.vy;
            if (s.y > height) {
                s.y = -60;
                s.x = Math.random() * width;
                s.vy = Math.random() * 0.6 + 0.3;
            }
            
            ctx.fillStyle = `rgba(6, 182, 212, ${s.opacity})`;
            for (let idx = 0; idx < s.chars.length; idx++) {
                if (Math.random() < 0.015) {
                    s.chars[idx] = Math.random() > 0.5 ? "1" : "0";
                }
                ctx.fillText(s.chars[idx], s.x, s.y + (idx * 13));
            }
        }
        
        // 3. Render drifting nodes and drawing connecting lines
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            
            n.x += n.vx;
            n.y += n.vy;
            
            // Bounce on wall bounds
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();
            
            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                const dx = n.x - n2.x;
                const dy = n.y - n2.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < 130) {
                    const alpha = (1 - dist / 130) * 0.12;
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

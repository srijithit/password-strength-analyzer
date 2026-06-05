// Common Passwords and Vulnerable Patterns Database
// Exposed globally to window.PasswordDb

const COMMON_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "12345", "qwerty", "1234567", "google", "drowssap",
    "letmein1", "letmein", "admin", "1234567890", "1234", "password123", "onesuperkey", "welcome",
    "football", "iloveyou", "alexander", "charlie", "donald", "monkey", "sunshine", "princess",
    "shadow", "dragon", "simpson", "superman", "batman", "spiderman", "pokemon", "mustang",
    "soccer", "baseball", "basketball", "family", "whiskey", "tequila", "testing", "killer",
    "matrix", "justin", "jessica", "michael", "andrew", "ashley", "daniel", "sarah", "matthew",
    "security", "passwords", "changeit", "secret", "trustnoone", "godkey", "rootadmin",
    "qazwsx", "edcrfv", "tgbnhy", "ujmikol", "okmjiu", "yhnwxs", "plmokn", "wsxedc",
    "admin123", "login123", "user123", "manager", "support", "system", "operator", "guest",
    "master", "oracle", "postgres", "mysql", "apache", "nginx", "docker", "github", "gitlab",
    "microsoft", "windows", "android", "iphone", "macbook", "linux", "ubuntu", "debian", "redhat",
    "keyboard", "typewriter", "asdfghjk", "zxcvbnm", "qwertz", "azerty", "poiuytrewq", "mnbvcxz",
    "asdfghjkl", "zxcvbnm,", "1q2w3e4r", "123123", "111111", "222222", "333333", "444444", "555555",
    "666666", "777777", "888888", "999999", "000000", "aaaaaa", "bbbbbb", "cccccc", "dddddd",
    "eeeeee", "ffffff", "gggggg", "hhhhhh", "iiiiii", "jjjjjj", "kkkkkk", "llllll", "mmmmmm",
    "nnnnnn", "oooooo", "pppppp", "qqqqqq", "rrrrrr", "ssssss", "tttttt", "uuuuuu", "vvvvvv",
    "wwwwww", "xxxxxx", "yyyyyy", "zzzzzz", "lovecode", "coder123", "develop", "software",
    "hacker1", "hacked", "infected", "password1", "pass123", "p@ssword", "p@$$w0rd", "pa$$word",
    "P@ssword", "P@ssw0rd", "Pa$$word", "Pa$$w0rd", "123456a", "123456b", "123456c", "123456d",
    "abc123", "123abc", "password!", "password@", "password#", "password$", "admin!", "admin@",
    "admin#", "admin$", "qwerty123", "123qwerty", "welcome1", "welcome123", "welcome!", "welcome@"
];

const KEYBOARD_PATTERNS = [
    "qwertyuiop", "asdfghjkl", "zxcvbnm",
    "qwertzuiop", "asdfghjklöä", "yxcvbnm",
    "azertyuiop", "qsdfghjklm", "wxcvbn",
    "1234567890", "0987654321",
    "poiuytrewq", "lkjhgfdsa", "mnbvcxz"
];

window.PasswordDb = {
    common: COMMON_PASSWORDS,
    keyboardPatterns: KEYBOARD_PATTERNS,
    
    // Checks if the password matches a common pattern or password
    isCommon: function(password) {
        const lower = password.toLowerCase();
        
        // 1. Direct match
        if (COMMON_PASSWORDS.includes(lower)) {
            return { matched: true, type: "common_password", detail: "This is a highly common password." };
        }
        
        // 2. Keyboard walk match
        for (const pattern of KEYBOARD_PATTERNS) {
            if (pattern.includes(lower) && lower.length >= 4) {
                return { matched: true, type: "keyboard_pattern", detail: "Contains sequential keyboard layout paths." };
            }
        }
        
        // 3. Repeated characters
        const repeats = /(.)\1{3,}/;
        if (repeats.test(password)) {
            return { matched: true, type: "repeated_characters", detail: "Contains a single character repeated 4 or more times." };
        }
        
        // 4. Sequential numbers/alphabet
        if (this.isSequential(lower)) {
            return { matched: true, type: "sequential_characters", detail: "Contains sequential alphabetical or numeric characters." };
        }
        
        return { matched: false };
    },
    
    // Helper to check for sequential alphabet/numbers
    isSequential: function(str) {
        if (str.length < 4) return false;
        
        // Check forwards and backwards sequences
        for (let i = 0; i <= str.length - 4; i++) {
            const chunk = str.substring(i, i + 4);
            const codes = Array.from(chunk).map(c => c.charCodeAt(0));
            
            // Check ascending sequence (e.g. abcd or 1234)
            let isAscending = true;
            let isDescending = true;
            for (let j = 1; j < codes.length; j++) {
                if (codes[j] !== codes[j-1] + 1) isAscending = false;
                if (codes[j] !== codes[j-1] - 1) isDescending = false;
            }
            if (isAscending || isDescending) return true;
        }
        return false;
    }
};

/**
 * Firebase Configuration for Secure AI Agent
 * This file contains the Firebase configuration for the AI agent backend
 */

// Firebase configuration
const firebaseConfig = {
    // These are safe to expose as they're public configuration
    apiKey: "AIzaSyAukl6P8LiAO4uuCvAXXcHW2xwZwAjPknc",
    authDomain: "matome-portfolio.firebaseapp.com",
    projectId: "matome-portfolio",
    storageBucket: "matome-portfolio.firebasestorage.app",
    messagingSenderId: "624270835371",
    appId: "1:624270835371:web:69d2db270767e98423c1ee"
};

// Security configuration
const securityConfig = {
    // Rate limiting
    rateLimit: {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
        message: "Too many requests. Please try again later."
    },
    
    // Content filtering
    contentFilter: {
        maxLength: 500,
        blockedWords: ['spam', 'inappropriate'],
        message: "Your message contains inappropriate content."
    },
    
    // API security
    apiSecurity: {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        encryption: true
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, securityConfig };
} else {
    window.firebaseConfig = firebaseConfig;
    window.securityConfig = securityConfig;
}

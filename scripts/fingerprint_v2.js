/**
 * Device fingerprinting implementation
 * Combines hardware information, browser characteristics, and IP address
 * to create a stable and unique identifier across sessions
 */
class DeviceFingerprint {
    constructor() {
        this.components = [];
    }

    /**
     * Fetches user's IP address from ipify API
     */
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org/?format=json');
            const data = await response.json();
            console.log("User IP Address:", data.ip);
            if (!data.ip) {
                throw new Error('IP address not received');
            }
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            return null;
        }
    }

    /**
     * Hardware-specific methods
     */
    getCPU() {
        const ua = navigator.userAgent;
        if (ua.includes("x64") || ua.includes("x86_64")) return "x64";
        if (ua.includes("x86") || ua.includes("i686")) return "x86";
        if (ua.includes("arm")) return "ARM";
        return "Unknown";
    }

    getCurrentResolution() {
        return `${window.screen.width}x${window.screen.height}`;
    }

    getAvailableResolution() {
        return `${window.screen.availWidth}x${window.screen.availHeight}`;
    }

    getColorDepth() {
        return window.screen.colorDepth;
    }

    /**
     * OS-specific methods
     */
    getOS() {
        const ua = navigator.userAgent;
        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac OS X")) return "Mac OS X";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iOS")) return "iOS";
        return "Unknown";
    }

    getOSVersion() {
        const ua = navigator.userAgent;
        const os = this.getOS();
        let match;

        switch (os) {
            case "Windows":
                match = ua.match(/Windows NT (\d+\.\d+)/);
                break;
            case "Mac OS X":
                match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
                break;
            case "Android":
                match = ua.match(/Android (\d+\.\d+)/);
                break;
            case "iOS":
                match = ua.match(/OS (\d+_\d+)/);
                break;
        }

        return match ? match[1].replace(/_/g, '.') : "Unknown";
    }

    /**
     * Device-specific methods
     */
    getDevice() {
        if (this.isMobile()) {
            const ua = navigator.userAgent;
            if (ua.includes("iPhone")) return "iPhone";
            if (ua.includes("iPad")) return "iPad";
            if (ua.includes("Android")) return "Android Device";
            return "Mobile Device";
        }
        return "Desktop";
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (ua.includes("Mobile")) return "Mobile";
        if (ua.includes("Tablet")) return "Tablet";
        return "Desktop";
    }

    isMobile() {
        return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    /**
     * Hardware feature detection
     */
    getHardwareFeatures() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 'unknown',
            pixelRatio: window.devicePixelRatio || 'unknown'
        };
    }

    /**
     * Browser-specific characteristics
     */
    getBrowserLanguage() {
        return navigator.language || navigator.userLanguage || "Unknown";
    }

    /**
     * Collect all components for fingerprinting
     */
    getAllComponents() {
        const components = {
            cpu: this.getCPU(),
            currentResolution: this.getCurrentResolution(),
            availableResolution: this.getAvailableResolution(),
            colorDepth: this.getColorDepth(),
            os: this.getOS(),
            osVersion: this.getOSVersion(),
            device: this.getDevice(),
            deviceType: this.getDeviceType(),
            hardwareFeatures: this.getHardwareFeatures(),
            isMobile: this.isMobile(),
            browserLanguage: this.getBrowserLanguage()
        };

        // Log all components
        console.log("Device Fingerprint Components:");
        console.log("- CPU Architecture:", components.cpu);
        console.log("- Screen Resolution:", components.currentResolution);
        console.log("- Available Resolution:", components.availableResolution);
        console.log("- Color Depth:", components.colorDepth);
        console.log("- Operating System:", components.os);
        console.log("- OS Version:", components.osVersion);
        console.log("- Device Type:", components.deviceType);
        console.log("- Hardware Features:", components.hardwareFeatures);
        console.log("- Is Mobile:", components.isMobile);
        console.log("- Browser Language:", components.browserLanguage);

        return components;
    }

    /**
     * Generate cryptographic hash
     */
    async generateHash(data) {
        try {
            const encoder = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return btoa(String.fromCharCode(...hashArray))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        } catch (error) {
            console.error('Hash generation failed:', error);
            throw error;
        }
    }

    /**
     * Calculate final fingerprint
     */
    async calculateFingerprint() {
        try {
            // Get IP address
            const ipAddress = await this.getUserIP();
            if (!ipAddress) {
                console.warn("Warning: IP address not available");
            }

            // Get all components
            const components = this.getAllComponents();

            // Create stable string for hashing
            const rawData = {
                hw: {
                    cpu: components.cpu,
                    screen: {
                        resolution: components.currentResolution,
                        available: components.availableResolution,
                        colorDepth: components.colorDepth
                    },
                    hardware: components.hardwareFeatures,
                    isMobile: components.isMobile
                },
                sys: {
                    os: components.os,
                    osVersion: components.osVersion,
                    device: components.device,
                    deviceType: components.deviceType,
                    language: components.browserLanguage
                },
                net: {
                    ip: ipAddress || 'unknown',
                    subnet: ipAddress ? ipAddress.split('.').slice(0, 3).join('.') : 'unknown'
                }
            };

            console.log('Raw fingerprint data:', rawData);
            const stableString = JSON.stringify(rawData);
            const fingerprint = await this.generateHash(stableString);

            return {
                fingerprint,
                components
            };
        } catch (error) {
            console.error('Error during fingerprint generation:', error);
            throw new Error('Fingerprint generation failed');
        }
    }
}

/**
 * Main export function
 * Returns an object containing the fingerprint and all components
 */
export const generateFingerprint = async () => {
    try {
        const fingerprinter = new DeviceFingerprint();
        return await fingerprinter.calculateFingerprint();
    } catch (error) {
        console.error('Fingerprint generation error:', error);
        throw error;
    }
};
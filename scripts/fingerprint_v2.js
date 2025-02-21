/**
 * Enhanced device fingerprinting implementation
 * Combines hardware information, browser characteristics, and IP address
 * to create a stable and unique identifier across sessions
 */
class EnhancedDeviceFingerprint {
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
     * Enhanced hardware feature detection
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
     * Enhanced canvas fingerprinting
     */
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            if (!canvas.getContext) return null;
            
            const ctx = canvas.getContext('2d');
            canvas.width = 240;
            canvas.height = 140;

            // Text with special characters
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            
            // Mixing fill styles
            ctx.fillStyle = "#069";
            ctx.font = "15px 'Arial'";
            ctx.fillText("Fingerprint", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.font = "16px 'Arial'";
            ctx.fillText("👨‍💻Test∑∆", 4, 17);

            // Complex shape with gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#FF0000");
            gradient.addColorStop(1, "#00FF00");
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return canvas.toDataURL();
        } catch (e) {
            return null;
        }
    }

    /**
     * WebGL fingerprinting
     */
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return null;

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return debugInfo ? {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            } : null;
        } catch (e) {
            return null;
        }
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
            browserLanguage: this.getBrowserLanguage(),
            canvas: this.getCanvasFingerprint(),
            webgl: this.getWebGLFingerprint()
        };

        // Log all components in original style
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
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return btoa(String.fromCharCode(...hashArray))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    /**
     * Calculate final fingerprint
     */
    async calculateFingerprint() {
        // Get IP address
        const ipAddress = await this.getUserIP();
        if (!ipAddress) {
            console.warn("Warning: IP address not available, fingerprint may be less reliable");
        }

        // Get all components
        const components = this.getAllComponents();
        
        // Add IP to components if available
        if (ipAddress) {
            components.ip = ipAddress;
            console.log("- IP Address:", ipAddress);
        }

        // Create stable string for hashing
        const stableString = JSON.stringify({
            // Hardware identifiers
            hw: {
                cpu: components.cpu,
                screen: {
                    resolution: components.currentResolution,
                    available: components.availableResolution,
                    colorDepth: components.colorDepth
                },
                hardware: components.hardwareFeatures,
                isMobile: components.isMobile,
                gpu: components.webgl
            },
            // System identifiers
            sys: {
                os: components.os,
                osVersion: components.osVersion,
                device: components.device,
                deviceType: components.deviceType,
                language: components.browserLanguage
            },
            // Network identifiers
            net: {
                ip: ipAddress || 'unknown',
                subnet: ipAddress ? ipAddress.split('.').slice(0, 3).join('.') : 'unknown'
            },
            // Graphics identifiers
            graphics: {
                canvas: components.canvas
            }
        });

        // Generate fingerprint
        const fingerprint = await this.generateHash(stableString);
        
        // Log the final fingerprint
        console.log("Generated Device Fingerprint:", fingerprint);

        return {
            fingerprint,
            components
        };
    }
}

/**
 * Main export function
 * Returns an object containing the fingerprint and all components
 */
export const generateFingerprint = async () => {
    const fingerprinter = new EnhancedDeviceFingerprint();
    return await fingerprinter.calculateFingerprint();
};
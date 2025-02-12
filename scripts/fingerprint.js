// fingerprint.js
class StableDeviceFingerprint {
    constructor() {
        this.components = [];
    }

    // Hardware-specific methods
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

    // OS-specific methods
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

    // Device-specific methods
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

    // Canvas fingerprinting (hardware-dependent)
    getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext) return null;
        
        const ctx = canvas.getContext('2d');
        canvas.width = 220;
        canvas.height = 30;

        // Text with special characters
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        
        // Mixing fill styles
        ctx.fillStyle = "#069";
        ctx.font = "15px 'Arial'";
        ctx.fillText("ClientJS<canvas>", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.font = "16px 'Arial'";
        ctx.fillText("ClientJS<canvas>", 4, 17);

        // Draw a complex shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        ctx.fill();

        return canvas.toDataURL();
    }

    // Hardware features
    getHardwareFeatures() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 'unknown'
        };
    }

    // Browser language detection
    getBrowserLanguage() {
        return navigator.language || navigator.userLanguage || "Unknown";
    }

    // Calculate stable device fingerprint
    calculateFingerprint() {
        // Collect stable components
        this.components = [
            this.getCPU(),
            this.getCurrentResolution(),
            this.getAvailableResolution(),
            this.getColorDepth().toString(),
            this.getOS(),
            this.getOSVersion(),
            this.getDevice(),
            this.getDeviceType(),
            this.getCanvasFingerprint(),
            JSON.stringify(this.getHardwareFeatures())
        ];

        // Generate hash
        return this.generateHash(this.components.join('###'));
    }

    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

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
            browserLanguage: this.getBrowserLanguage() // Added browser language as component
        };

        // Log all components for debugging
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
}

export const generateFingerprint = () => {
    const fingerprinter = new StableDeviceFingerprint();
    const fingerprint = fingerprinter.calculateFingerprint();
    const components = fingerprinter.getAllComponents();

    console.log("Generated Device Fingerprint:", fingerprint);
    
    return {
        fingerprint,
        components
    };
};

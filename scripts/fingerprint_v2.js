// fingerprint.js
class StableDeviceFingerprint {
    constructor() {
        this.components = [];
        this.ipAddress = null;
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
        canvas.width = 280;
        canvas.height = 60;

        // Add more complex drawing operations
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        
        // Add company name and special characters for more uniqueness
        ctx.fillStyle = "#069";
        ctx.font = "15px 'Arial'";
        ctx.fillText("🌟 HypeDigitaly s.r.o. fingerprint ©®™", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.font = "16px 'Arial'";
        ctx.fillText("¶ Test †‡§", 4, 35);

        // Add WebGL context if available
        try {
            const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (webgl) {
                const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    ctx.fillText(webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL), 4, 50);
                }
            }
        } catch (e) {}

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

    // Add new method to get IP
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org/?format=json');
            const data = await response.json();
            console.log("User IP Address:", data.ip);
            if (!data.ip) {
                throw new Error('IP address not received');
            }
            this.ipAddress = data.ip;
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            this.ipAddress = null;
            return null;
        }
    }

    // Add audio fingerprinting
    getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            gainNode.gain.value = 0; // Mute the sound
            oscillator.type = 'triangle';
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(0);
            
            const audioData = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(audioData);
            
            oscillator.stop();
            audioContext.close();
            
            return audioData.slice(0, 5).join(',');
        } catch (e) {
            return null;
        }
    }

    // Modify calculateFingerprint to be async
    async calculateFingerprint() {
        await this.getIPAddress();
        
        // Collect stable components with additional entropy
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
            this.getAudioFingerprint(),
            JSON.stringify(this.getHardwareFeatures()),
            navigator.plugins.length.toString(),
            Array.from(navigator.plugins, p => p.name).join(','),
            navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen.pixelDepth.toString(),
            navigator.hardwareConcurrency.toString(),
            // Add IP as a separate component for filtering but not as primary identifier
            this.ipAddress
        ];

        // Generate hash
        return this.generateHash(this.components.join('###'));
    }

    async generateHash(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    getAllComponents() {
        const components = {
            ipAddress: this.ipAddress, // Add IP address to components
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

        // Modify logging to include IP
        console.log("Device Fingerprint Components:");
        console.log("- IP Address:", components.ipAddress);
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

// Modify the export function to be async
export const generateFingerprint = async () => {
    const fingerprinter = new StableDeviceFingerprint();
    const fingerprint = await fingerprinter.calculateFingerprint();
    const components = fingerprinter.getAllComponents();

    console.log("Generated Device Fingerprint:", fingerprint);
    
    return {
        fingerprint,
        components
    };
};

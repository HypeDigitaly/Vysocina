// fingerprint.js
class ComprehensiveBrowserFingerprint {
    constructor() {
        this.components = [];
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
    }

    getUserAgent() {
        return this.userAgent;
    }

    getBrowser() {
        const ua = this.userAgent;
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
        if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
        if (ua.includes("Edge")) return "Edge";
        if (ua.includes("MSIE") || ua.includes("Trident/")) return "Internet Explorer";
        return "Unknown";
    }

    getBrowserVersion() {
        const ua = this.userAgent;
        const browser = this.getBrowser();
        let match;

        switch (browser) {
            case "Chrome":
                match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
                break;
            case "Firefox":
                match = ua.match(/Firefox\/(\d+\.\d+)/);
                break;
            case "Safari":
                match = ua.match(/Version\/(\d+\.\d+\.\d+)/);
                break;
            case "Opera":
                match = ua.match(/OPR\/(\d+\.\d+\.\d+)/);
                break;
            case "Edge":
                match = ua.match(/Edge\/(\d+\.\d+\.\d+)/);
                break;
            case "Internet Explorer":
                match = ua.match(/MSIE (\d+\.\d+)/);
                break;
        }

        return match ? match[1] : "Unknown";
    }

    getEngine() {
        const ua = this.userAgent;
        if (ua.includes("Gecko/")) return "Gecko";
        if (ua.includes("AppleWebKit")) return "WebKit";
        if (ua.includes("Trident/")) return "Trident";
        if (ua.includes("Presto/")) return "Presto";
        return "Unknown";
    }

    getEngineVersion() {
        const ua = this.userAgent;
        const engine = this.getEngine();
        let match;

        switch (engine) {
            case "WebKit":
                match = ua.match(/AppleWebKit\/(\d+\.\d+)/);
                break;
            case "Gecko":
                match = ua.match(/rv:(\d+\.\d+)/);
                break;
            case "Trident":
                match = ua.match(/Trident\/(\d+\.\d+)/);
                break;
            case "Presto":
                match = ua.match(/Presto\/(\d+\.\d+)/);
                break;
        }

        return match ? match[1] : "Unknown";
    }

    getOS() {
        const ua = this.userAgent;
        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac OS X")) return "Mac OS X";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iOS")) return "iOS";
        if (ua.includes("Ubuntu")) return "Ubuntu";
        return "Unknown";
    }

    getOSVersion() {
        const ua = this.userAgent;
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

    getDevice() {
        const ua = this.userAgent;
        if (ua.includes("iPhone")) return "iPhone";
        if (ua.includes("iPad")) return "iPad";
        if (ua.includes("Android")) return "Android Device";
        return "Desktop";
    }

    getDeviceType() {
        const ua = this.userAgent;
        if (ua.includes("Mobile")) return "Mobile";
        if (ua.includes("Tablet")) return "Tablet";
        return "Desktop";
    }

    getDeviceVendor() {
        const ua = this.userAgent;
        if (ua.includes("iPhone") || ua.includes("iPad")) return "Apple";
        if (ua.includes("Samsung")) return "Samsung";
        if (ua.includes("Huawei")) return "Huawei";
        if (ua.includes("Pixel")) return "Google";
        return "Unknown";
    }

    getCPU() {
        const ua = this.userAgent;
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

    getTimeZone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    getLanguage() {
        return navigator.language || navigator.userLanguage || "Unknown";
    }

    getSystemLanguage() {
        return navigator.language || "Unknown";
    }

    calculateFingerprint() {
        this.components = [
            this.getUserAgent(),
            this.getBrowser(),
            this.getBrowserVersion(),
            this.getEngine(),
            this.getEngineVersion(),
            this.getOS(),
            this.getOSVersion(),
            this.getDevice(),
            this.getDeviceType(),
            this.getDeviceVendor(),
            this.getCPU(),
            this.getCurrentResolution(),
            this.getAvailableResolution(),
            this.getTimeZone(),
            this.getLanguage(),
            this.getSystemLanguage()
        ];

        const componentsStr = this.components.join('###');
        return this.generateHash(componentsStr);
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
        return {
            userAgent: this.getUserAgent(),
            browser: this.getBrowser(),
            browserVersion: this.getBrowserVersion(),
            engine: this.getEngine(),
            engineVersion: this.getEngineVersion(),
            os: this.getOS(),
            osVersion: this.getOSVersion(),
            device: this.getDevice(),
            deviceType: this.getDeviceType(),
            deviceVendor: this.getDeviceVendor(),
            cpu: this.getCPU(),
            currentResolution: this.getCurrentResolution(),
            availableResolution: this.getAvailableResolution(),
            timeZone: this.getTimeZone(),
            language: this.getLanguage(),
            systemLanguage: this.getSystemLanguage()
        };
    }
}

export const generateFingerprint = () => {
    const fingerprinter = new ComprehensiveBrowserFingerprint();
    return {
        fingerprint: fingerprinter.calculateFingerprint(),
        components: fingerprinter.getAllComponents()
    };
};

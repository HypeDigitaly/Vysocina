// fingerprint.js
export const generateFingerprint = () => {
    // Hash function that converts a string into a number
    const hashString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char; // hash * 31 + char
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36); // Convert to base36 for shorter string
    };

    // Collect system information
    const getSystemInfo = () => {
        const userAgent = navigator.userAgent;
        let os = "Unknown";
        let osVersion = "Unknown";
        let deviceType = "desktop";
        let deviceVendor = "";

        // Detect OS and version
        if (userAgent.includes("Win")) {
            os = "Windows";
            osVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Mac")) {
            os = "MacOS";
            osVersion = userAgent.match(/Mac OS X ([\d._]+)/)?.[1]?.replace(/_/g, '.') || "Unknown";
        } else if (userAgent.includes("Linux")) {
            os = "Linux";
        } else if (userAgent.includes("Android")) {
            os = "Android";
            osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("iOS")) {
            os = "iOS";
            osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || "Unknown";
        }

        // Detect device type
        if (/Mobi|Android|iPhone|iPad|Windows Phone/i.test(userAgent)) {
            deviceType = "mobile";
            if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
                deviceType = "tablet";
            }
        }

        // Detect device vendor
        if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
            deviceVendor = "Apple";
        } else if (userAgent.includes("Samsung")) {
            deviceVendor = "Samsung";
        } else if (userAgent.includes("Huawei")) {
            deviceVendor = "Huawei";
        } else {
            deviceVendor = navigator.vendor || "Unknown";
        }

        return {
            type: deviceType,
            os,
            osVersion,
            deviceVendor,
            platform: navigator.platform,
            processors: navigator.hardwareConcurrency || 1,
            memory: navigator?.deviceMemory || null,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1
            }
        };
    };

    // Calculate the actual fingerprint
    const calculateFingerprint = (data) => {
        try {
            // Hardware identifier - combines stable hardware characteristics
            const hardwareId = [
                data.os,                     // Operating system name
                data.osVersion,              // OS version
                data.deviceVendor,           // Device manufacturer
                data.processors,             // Number of CPU cores
                data.memory || 'unknown',    // Amount of RAM
                `${data.screen.width}x${data.screen.height}`, // Screen resolution
                data.screen.colorDepth,      // Color depth
                data.platform                // System platform
            ].join('::');

            // Browser identifier - basic browser info
            const browserId = [
                navigator.userAgent,         // Browser user agent
                navigator.language           // Browser language
            ].join('::');

            // Environment identifier - system environment
            const envId = [
                data.type,                   // Device type (desktop/mobile/tablet)
                data.os                      // OS name
            ].join('::');

            // Weight different components (hardware gets highest weight)
            const getWeightedComponent = (component, weight) => {
                const hash = hashString(component);
                return hash.repeat(weight);  // Repeat hash string to increase its influence
            };

            // Combine all components with weights
            const components = [
                getWeightedComponent(hardwareId, 10),  // Hardware gets highest weight (10)
                getWeightedComponent(browserId, 1),    // Browser gets normal weight (1)
                getWeightedComponent(envId, 1)         // Environment gets normal weight (1)
            ].join('||');
            
            // Generate final fingerprint
            return hashString(components);
        } catch (error) {
            console.error('Error calculating fingerprint:', error);
            return 'X';
        }
    };

    // Generate and return the fingerprint
    const systemInfo = getSystemInfo();
    return calculateFingerprint(systemInfo);
};

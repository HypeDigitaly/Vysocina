export const BrowserDataExtension = {
  name: "BrowserData",
  type: "effect",
  match: ({ trace }) => 
    trace.type === "ext_browserData" || 
    trace.payload?.name === "ext_browserData",
  effect: async ({ trace }) => {
    // Simple hash function implementation
    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36); // Convert to base36 for shorter representation
    };

    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org/?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Error fetching IP:', error);
        return 'X';
      }
    };

    const getBrowserDetails = () => {
      const userAgent = navigator.userAgent;
      let name = "Unknown";
      let version = "Unknown";
      let engine = "Unknown";
      let engineVersion = "Unknown";

      if (userAgent.includes("Chrome")) {
        name = "Chrome";
        version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown";
        engine = "Blink";
      } else if (userAgent.includes("Firefox")) {
        name = "Firefox";
        version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || "Unknown";
        engine = "Gecko";
      } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        name = "Safari";
        version = userAgent.match(/Version\/([\d.]+)/)?.[1] || "Unknown";
        engine = "WebKit";
      } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
        name = "IE";
        version = userAgent.match(/(MSIE |rv:)([\d.]+)/)?.[2] || "Unknown";
        engine = "Trident";
      }

      if (engine === "Blink") {
        engineVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown";
      } else if (engine === "Gecko") {
        engineVersion = userAgent.match(/rv:([\d.]+)/)?.[1] || "Unknown";
      } else if (engine === "WebKit") {
        engineVersion = userAgent.match(/WebKit\/([\d.]+)/)?.[1] || "Unknown";
      } else if (engine === "Trident") {
        engineVersion = userAgent.match(/rv:([\d.]+)/)?.[1] || "Unknown";
      }
      
      return {
        userAgent,
        name,
        version,
        engine,
        engineVersion,
        language: navigator.language,
        systemLanguage: navigator.languages?.[0] || navigator.language
      };
    };

    const getSystemInfo = () => {
      const userAgent = navigator.userAgent;
      let os = "Unknown";
      let osVersion = "Unknown";
      let deviceType = "desktop";
      let deviceVendor = "";

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

      if (/Mobi|Android|iPhone|iPad|Windows Phone/i.test(userAgent)) {
        deviceType = "mobile";
        if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
          deviceType = "tablet";
        }
      }

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
        touchPoints: navigator.maxTouchPoints || 0,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight
        }
      };
    };

    const calculateFingerprint = (data) => {
      try {
        // Hardware-specific identifiers (pouze skutečně stabilní hardware údaje)
        const hardwareId = [
          data.os,
          data.osVersion,
          data.deviceVendor,
          data.processors,
          data.memory || 'unknown',
          `${data.screen.width}x${data.screen.height}`,
          data.screen.colorDepth,
          data.platform
        ].join('::');

        // Browser core identifiers (pouze nejstabilnější části)
        const browserId = [
          data.browser,
          data.engine
        ].join('::');

        // System environment (minimální set systémových informací)
        const envId = [
          data.type,
          data.os
        ].join('::');

        // Calculate weights for the final hash
        const getWeightedComponent = (component, weight) => {
          const hash = hashString(component);
          return hash.repeat(weight);
        };

        // Ještě větší důraz na hardware
        const components = [
          getWeightedComponent(hardwareId, 10),    // Hardware gets even higher weight
          getWeightedComponent(browserId, 1),      // Browser info gets minimal weight
          getWeightedComponent(envId, 1)           // Environment gets minimal weight
        ].join('||');
        
        return hashString(components);
      } catch (error) {
        console.error('Error calculating fingerprint:', error);
        return 'X';
      }
    };

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserDetails = getBrowserDetails();
    const systemInfo = getSystemInfo();
    const url = window.location.href;

    const payload = {
      url,
      ip_address: 'X',  // Default value
      timezone,
      userAgent: browserDetails.userAgent,
      browser: browserDetails.name,
      browserVersion: browserDetails.version,
      engine: browserDetails.engine,
      engineVersion: browserDetails.engineVersion,
      os: systemInfo.os,
      osVersion: systemInfo.osVersion,
      device: systemInfo.type,
      deviceType: systemInfo.type,
      deviceVendor: systemInfo.deviceVendor,
      cpu: systemInfo.processors,
      currentResolution: `${systemInfo.screen.width}x${systemInfo.screen.height}`,
      availableResolution: `${systemInfo.screen.availWidth}x${systemInfo.screen.availHeight}`,
      language: browserDetails.language,
      systemLanguage: browserDetails.systemLanguage,
      type: systemInfo.type,
      platform: systemInfo.platform,
      processors: systemInfo.processors,
      memory: systemInfo.memory,
      touchPoints: systemInfo.touchPoints,
      screen: {
        width: systemInfo.screen.width,
        height: systemInfo.screen.height,
        colorDepth: systemInfo.screen.colorDepth,
        pixelRatio: systemInfo.screen.pixelRatio
      }
    };

    try {
      // Try to get IP address
      const ipAddress = await getUserIP();
      payload.ip_address = ipAddress;

      // Try to calculate fingerprint
      payload.fingerprint = calculateFingerprint(payload);
    } catch (error) {
      console.error('Error in data processing:', error);
      payload.fingerprint = 'X';
    }

    window.voiceflow.chat.interact({
      type: "complete",
      payload
    });
  }
};

export const StreamingResponseExtension = {
  name: 'StreamingResponse',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_streamingResponse' ||
    trace.payload?.name === 'ext_streamingResponse',
  render: async ({ trace, element }) => {
    console.log('StreamingResponse extension render started', { trace })
    
    const container = document.createElement('div')
    container.className = 'streaming-container'

    // Function to format model name (simplified)
    function formatModelName(model) {
      return model
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Create the base structure first
    container.innerHTML = `
      <style>
        .streaming-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .streaming-section {
          background-color: #F9FAFB;
          border-radius: 12px;
          padding: 16px;
          margin: 0;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        .streaming-section.collapsed {
          padding: 10px 16px;
          cursor: pointer;
        }
        .streaming-section.has-answer {
          margin-bottom: 8px;
        }
        .streaming-section.collapsed .streaming-content,
        .streaming-section.collapsed .streaming-intro {
          display: none;
        }
        .streaming-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }
        .streaming-section.collapsed .streaming-header {
          margin-bottom: 0;
        }
        .streaming-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .streaming-icon svg {
          width: 28px;
          height: 28px;
        }
        .streaming-title-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .streaming-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }
        .streaming-model {
          font-weight: normal;
          color: #6B7280;
          margin-left: 4px;
        }
        .toggle-icon {
          width: 16px;
          height: 16px;
          color: #6B7280;
          transition: transform 0.3s ease;
        }
        .streaming-section.collapsed .toggle-icon {
          transform: rotate(-180deg);
        }
        .streaming-intro {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          line-height: 1.4;
          color: #6B7280;
          margin-bottom: 12px;
        }
        .loading-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 20px;
        }
        .loading-dots .dot {
          width: 4px;
          height: 4px;
          background-color: #6B7280;
          border-radius: 50%;
          animation: dotPulse 1.5s infinite;
        }
        .loading-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        .streaming-content {
          font-size: 12px;
          line-height: 1.4;
          color: #4B5563;
        }
        .streaming-step {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        .step-checkbox {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          margin-top: 1px;
          position: relative;
        }
        .step-checkbox svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 14px;
          height: 14px;
        }
        .step-content {
          flex: 1;
          font-size: 12px;
          line-height: 1.4;
          padding-top: 1px;
        }
        .step-checkbox .unchecked {
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .step-checkbox .checked {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .step-checkbox.is-checked .unchecked {
          opacity: 0;
        }
        .step-checkbox.is-checked .checked {
          opacity: 1;
        }
        .answer-section {
          padding: 0;
          margin: 0;
          width: 100%;
          box-sizing: border-box;
          opacity: 0;
          height: 0;
          overflow: hidden;
          transition: opacity 0.3s ease;
        }
        .answer-section.visible {
          opacity: 1;
          height: auto;
          overflow: visible;
        }
        .vfrc-message--extension-StreamingResponse {
          width: 100% !important;
          max-width: none !important;
        }
        .answer-content {
          font-size: 14px;
          line-height: 1.4;
          color: #374151;
          margin: 0;
          padding: 0;
        }
        code {
          background-color: #F3F4F6;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        pre {
          background-color: #F3F4F6;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
        }
        pre code {
          background-color: transparent;
          padding: 0;
        }
      </style>
      <div class="streaming-section">
        <div class="streaming-header">
          <div class="streaming-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="none" viewBox="0 0 128 128" id="science">
  <ellipse cx="72" cy="48" stroke="#1B1B1B" stroke-width="6" rx="21.076" ry="10.036" transform="rotate(-45 72 48)"></ellipse>
  <ellipse cx="72" cy="48" stroke="#1B1B1B" stroke-width="6" rx="21.076" ry="10.036" transform="rotate(45 72 48)"></ellipse>
  <path fill="#1B1B1B" d="M107 46.7758C107 45.1189 105.657 43.7758 104 43.7758C102.343 43.7758 101 45.1189 101 46.7758H107ZM70.0342 19C71.6911 19 73.0342 17.6569 73.0342 16C73.0342 14.3431 71.6911 13 70.0342 13V19ZM29.8205 72.6634H32.8205C32.8205 71.446 32.0848 70.3493 30.9583 69.8876L29.8205 72.6634ZM89.611 94.2028C90.1916 95.7546 91.9203 96.5419 93.4721 95.9613C95.0238 95.3807 95.8111 93.652 95.2305 92.1002L89.611 94.2028ZM57.1417 91.2742C58.6739 90.6437 59.4048 88.8904 58.7742 87.3583C58.1437 85.8261 56.3904 85.0952 54.8583 85.7258L57.1417 91.2742ZM86.8025 111V114V111ZM23.3165 69.9974L22.1787 72.7733L23.3165 69.9974ZM55.8648 111L55.8648 114L55.8648 111ZM31.6171 53.0102L29.4088 50.9795L31.6171 53.0102ZM33.6399 48.7818L30.6731 48.3368L33.6399 48.7818ZM39.0923 93.2606L38.6153 90.2988L39.0923 93.2606ZM92.4208 93.1515L95.3162 92.3663C95.2918 92.2764 95.2632 92.1876 95.2305 92.1002L92.4208 93.1515ZM101 46.7758C101 61.4182 98.9356 67.2732 96.6185 70.2041L101.325 73.9252C104.992 69.2875 107 61.607 107 46.7758H101ZM24.0975 65.6194L33.8254 55.0409L29.4088 50.9795L19.681 61.5581L24.0975 65.6194ZM30.9583 69.8876L24.4543 67.2216L22.1787 72.7733L28.6826 75.4393L30.9583 69.8876ZM32.8205 85.3624V72.6634H26.8205V85.3624H32.8205ZM47.3879 88.8862L38.6153 90.2988L39.5692 96.2225L48.3417 94.8099L47.3879 88.8862ZM50.8648 103V91.8481H44.8648V103H50.8648ZM86.8025 108L55.8648 108L55.8648 114L86.8025 114V108ZM89.5253 93.9367L91.6282 101.691L97.4191 100.121L95.3162 92.3663L89.5253 93.9367ZM49.0065 94.6223L57.1417 91.2742L54.8583 85.7258L46.723 89.0738L49.0065 94.6223ZM40.6287 32.7137C48.0449 20.3612 59.6888 19 70.0342 19V13C59.2988 13 44.6452 14.3673 35.4846 29.6252L40.6287 32.7137ZM31.7491 41.1633L30.6731 48.3368L36.6067 49.2268L37.6827 42.0534L31.7491 41.1633ZM86.8025 114C94.049 114 99.3157 107.115 97.4191 100.121L91.6282 101.691C92.4903 104.87 90.0964 108 86.8025 108V114ZM19.681 61.5581C16.3813 65.1463 17.6681 70.9244 22.1787 72.7733L24.4543 67.2216C23.81 66.9575 23.6262 66.132 24.0975 65.6194L19.681 61.5581ZM44.8648 103C44.8648 109.075 49.7897 114 55.8648 114L55.8648 108C53.1034 108 50.8648 105.761 50.8648 103H44.8648ZM33.8254 55.0409C35.3122 53.424 36.2809 51.399 36.6067 49.2268L30.6731 48.3368C30.525 49.3242 30.0847 50.2446 29.4088 50.9795L33.8254 55.0409ZM26.8205 85.3624C26.8205 92.1352 32.8825 97.2992 39.5692 96.2225L38.6153 90.2988C35.5759 90.7882 32.8205 88.441 32.8205 85.3624H26.8205ZM35.4846 29.6252C33.2896 33.2812 32.3184 37.368 31.7491 41.1633L37.6827 42.0534C38.207 38.5581 39.0289 35.3782 40.6287 32.7137L35.4846 29.6252ZM96.6185 70.2041C91.4986 76.6802 86.0249 84.6185 89.611 94.2028L95.2305 92.1002C92.9397 85.9776 96.0444 80.6049 101.325 73.9252L96.6185 70.2041Z"></path>
</svg>
          </div>
          <div class="streaming-title-wrapper">
            <div class="streaming-title">Streaming<span class="streaming-model">with ${formatModelName(
              trace.payload?.model || 'Unknown Model'
            )}</span></div>
            <svg class="toggle-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div class="streaming-intro">
          <span>Thinking</span>
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <div class="streaming-content" id="streaming-content"></div>
      </div>
      <div class="answer-section" style="display: block;">
        <div class="answer-content" id="answer-content"></div>
      </div>
    `

    // Add the container to the element first
    element.appendChild(container)

    // Initialize sections
    const streamingSection = container.querySelector('.streaming-section')
    const answerSection = container.querySelector('.answer-section')
    
    // Make sure answer section is visible
    streamingSection.style.display = 'none'
    answerSection.style.display = 'block'
    answerSection.classList.add('visible')

    console.log('Container initialized, checking for messages')

    if (trace.payload?.messages) {
      console.log('Found messages, starting stream')
      await streamResponse(trace.payload.messages)
    } else {
      console.log('No messages found in trace payload')
    }
    
    window.voiceflow.chat.interact({
      type: 'continue',
    })
  },
}

// Update the streamResponse function
async function streamResponse(messages) {
  try {
    // Get references to elements
    const streamingSection = container.querySelector('.streaming-section')
    const streamingContent = container.querySelector('#streaming-content')
    const answerContent = container.querySelector('#answer-content')
    const answerSection = container.querySelector('.answer-section')

    // Debug logging
    console.log('Starting streamResponse with messages:', messages)

    // Initialize the sections properly
    streamingSection.style.display = 'block'
    answerSection.style.display = 'block'
    answerSection.classList.add('visible')
    
    // Show initial loading state
    answerContent.innerHTML = 'Connecting to Claude API...'

    // Prepare the request payload according to server.js expectations
    const payload = {
      userData: messages[messages.length - 1].content, // Get the last message content
      model: trace.payload?.model || 'claude-3-sonnet-20240229',
      systemPrompt: "You are a helpful AI assistant.",
      temperature: 0,
      max_tokens: 4096
    }

    console.log('Sending request with payload:', payload)

    const response = await fetch('http://localhost:3000/api/claude/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('Got response from server, starting to read stream')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        console.log('Stream complete')
        break
      }
      
      const chunk = decoder.decode(value)
      console.log('Received chunk:', chunk)

      try {
        // Split chunk into lines and process each SSE event
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = JSON.parse(line.slice(6))
            if (eventData.type === 'content_block_delta') {
              currentResponse += eventData.delta?.text || ''
              answerContent.innerHTML = markdownToHtml(currentResponse)
              
              // Make sure the content is visible
              answerSection.style.display = 'block'
              answerSection.classList.add('visible')
            }
          }
        }
      } catch (e) {
        console.error('Error processing chunk:', e)
      }
    }

  } catch (error) {
    console.error('Stream Error:', error)
    answerContent.innerHTML = `
      <div style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 6px;">
        <strong>Error:</strong> ${error.message}
      </div>
    `
  }
}

// Simplified markdown to HTML converter
function markdownToHtml(markdown) {
  return markdown
    .trim()
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => 
      `<pre><code class="language-${lang || ''}">${code.trim()}</code></pre>`
    )
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
    .replace(/^-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, '<p>$1</p>')
}

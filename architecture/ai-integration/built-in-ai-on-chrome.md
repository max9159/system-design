# XPrompt System Design Architecture

XPrompt(https://xprompt.app/) is a multi-LLM orchestration platform that allows users to prompt multiple AI models simultaneously, synthesize their responses, and leverage local Chrome AI for prompt enhancement.

## 1. System Context (C4 Layer 1)

This diagram shows XPrompt in the context of its users and external systems.

```mermaid
graph TD
    User([User])
    
    subgraph "XPrompt Ecosystem"
        Portal["XPrompt Portal (Web App)"]
        Extension["XPrompt Extension (Browser Add-on)"]
        API["XPrompt API (Backend)"]
    end
    
    subgraph "External Systems"
        LLM_Providers["LLM Providers (ChatGPT, Gemini, Claude, etc.)"]
        Chrome_AI["Chrome built-in AI (Gemini Nano)"]
    end
    
    User <--> Portal
    Portal <--> Extension
    Portal <--> API
    Extension <--> API
    Extension <--> LLM_Providers
    Extension <--> Chrome_AI
```

---

## 2. Integrated Module Architecture

The following diagram illustrates the internal components and their integration paths.

```mermaid
flowchart TB
    subgraph Browser
        subgraph "Portal (React)"
            UI[User Interface]
            State[State Management]
        end

        subgraph "XPrompt Extension"
            BGSW["Background Service Worker (Orchestrator)"]
            Executor["Executor (Content Script)"]
            Offscreen["Offscreen Document (Chrome AI Bridge)"]
        end
        
        Windows["LLM Windows / Tabs"]
    end

    subgraph "Cloud / Storage"
        Backend["API Server (Node.js/Express)"]
        DB[(MongoDB)]
    end

    %% Interactions
    UI <-->|External Messaging| BGSW
    UI <-->|REST API| Backend
    
    BGSW <-->|chrome.scripting| Executor
    BGSW <-->|chrome.runtime.sendMessage| Offscreen
    BGSW <-->|REST API| Backend
    
    Executor <-->|DOM Manipulation / Scraping| Windows
    
    Backend <--> DB
```

---

## 3. Core Functions & Flow Charts

### 3.1 Multi-LLM Parallel Submission
This function allows a user to send a single prompt to multiple LLMs simultaneously.

```mermaid
sequenceDiagram
    participant P as Portal
    participant B as Background (Extension)
    participant A as API
    participant W as LLM Window
    participant E as Executor (Injected)

    P->>B: SUBMIT_PROMPT (prompt, selectedLLMs, authToken)
    B-->>P: { success: true } (immediate ack)
    B->>A: POST /prompts (Create Entry)
    A-->>B: promptId
    B->>A: PUT /prompts/:id/status (processing: "Opening LLM windows...")
    
    loop for each Selected LLM
        B->>W: Create Window (Tiled Position)
        W-->>B: Tab load complete
        B->>E: Inject executor.js
        B->>E: executePromptWithCallback(execId, config, promptText)
        E->>W: Fill Input & Click Submit
        E-->>B: EXECUTION_COMPLETE(execId, responseText + responseHtml)
        B->>A: PUT /prompts/:id (Append Response)
    end
    
    B->>A: PUT /prompts/:id/status (completed: "All Done")
    Note over A,P: API emits `promptUpdate` via Socket.io on each status/response update
```

### 3.2 Response Synthesis (Conclusion)
XPrompt can use one LLM to summarize and synthesize responses from all other models.

```mermaid
sequenceDiagram
    participant P as Portal
    participant B as Background (Extension)
    participant A as API
    participant W as Conclusion LLM Window
    participant E as Executor (Injected)

    P->>B: GENERATE_CONCLUSION (promptId, promptText, responses[], conclusionLLM, authToken)
    B->>B: buildConclusionPrompt(CONCLUSION_TEMPLATE)
    B->>A: GET /llms (resolve conclusion LLM config)
    B->>W: Open Window (tiled) at conclusion LLM URL
    W-->>B: Tab load complete
    B->>E: Inject executor.js
    B->>E: executePromptWithCallback(execId, config, conclusionPrompt)
    E-->>B: EXECUTION_COMPLETE(execId, conclusionText + conclusionHtml)
    B->>A: PUT /prompts/:id/conclusion (save)
    A-->>P: promptUpdate (Socket.io)
    B-->>P: { success: true, sourceUrl }
```

### 3.3 Local AI Prompt Enhancement
Leverages Chrome Built-in AI Prompt API (`LanguageModel`, with legacy `window.ai` fallback) for privacy-preserving, local prompt optimization.

```mermaid
sequenceDiagram
    participant P as Portal
    participant B as Background (Extension)
    participant O as Offscreen Document (DOM Context)
    participant C as Chrome AI (Gemini Nano)

    P->>B: CHECK_AI_AVAILABLE
    B->>O: OFFSCREEN_CHECK_AI (ensureOffscreenDocument)
    O->>C: LanguageModel.availability() / params()
    O-->>B: { available, status, backend, params }
    B-->>P: availability response

    P->>B: ENHANCE_PROMPT (promptText)
    B->>O: OFFSCREEN_ENHANCE_PROMPT (promptText)
    O->>C: LanguageModel.create() & session.prompt()
    O-->>B: { success, enhanced }
    B-->>P: enhanced prompt
```

### 3.4 Dynamic Re-scraping
Allows users to manually refresh a specific response if the initial scraping failed or the user continued the conversation manually.

```mermaid
sequenceDiagram
    participant P as Portal
    participant B as Background (Extension)
    participant W as Target LLM Window
    participant E as Executor (Injected)
    participant A as API

    P->>B: RESCRAPE_RESPONSE (promptId, source, sourceUrl, authToken)
    B->>A: GET /llms (selectors for source)
    B->>W: Open Window (tiled) at sourceUrl
    B->>E: Inject executor.js
    B->>E: scrapeWithCallback(execId, selectors)
    E-->>B: EXECUTION_COMPLETE(execId, responseText + responseHtml)
    B->>A: PUT /prompts/:id/response (Replace)
    A-->>P: promptUpdate (Socket.io)
    B-->>P: { success: true }
```
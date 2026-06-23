[![DeepWiki](https://img.shields.io/badge/DeepWiki-max9159%2Fsystem--design-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/max9159/system-design)

# System Design Repository
> A comprehensive collection of system design concepts and examples using **Mermaid diagrams** and **draw.io**, featuring real-world architectures, flowcharts, and sequence diagrams.

<!-- omit in toc -->
## 📋 Table of Contents
- [System Design Repository](#system-design-repository)
  - [Overview](#overview)
  - [Technologies](#technologies)
    - [🧩 Mermaid](#-mermaid)
    - [📐 draw.io](#-drawio)
  - [Project Structure](#project-structure)
  - [AI Agent](#ai-agent)
    - [Claude Code Dynamic Workflows](#claude-code-dynamic-workflows)
    - [Claude Code Custom Status Line](#claude-code-custom-status-line)
  - [Architecture Diagrams](#architecture-diagrams)
    - [Popular Product System Designs](#popular-product-system-designs)
    - [🏗️ CI/CD \& DevOps](#️-cicd--devops)
    - [🤖 AI Integration](#-ai-integration)
    - [🛒 E-Commerce Systems](#-e-commerce-systems)
  - [Flowcharts](#flowcharts)
    - [🤖 AI \& Automation](#-ai--automation)
    - [🎮 Gaming \& Betting Systems](#-gaming--betting-systems)
    - [💰 Reward \& Token Systems](#-reward--token-systems)
    - [🔄 Dynamic Loading Patterns](#-dynamic-loading-patterns)
  - [Sequence Diagrams](#sequence-diagrams)
    - [📊 Data Flow Sequences](#-data-flow-sequences)
  - [SDLC](#sdlc)
    - [🌿 Git Flow](#-git-flow)
  - [Getting Started](#getting-started)
    - [Viewing Mermaid Diagrams](#viewing-mermaid-diagrams)
    - [Viewing draw.io Diagrams](#viewing-drawio-diagrams)
    - [Quick Links](#quick-links)
  - [Contributing](#contributing)
  - [License](#license)

## Overview
This repository serves as a practical reference for system design patterns and architectural solutions. It includes various diagram types that illustrate software architectures, data flows, and system interactions across different domains including e-commerce, CI/CD pipelines, gaming systems, and AI applications.

## Technologies

### 🧩 Mermaid
[Mermaid](https://mermaid.js.org/) is a JavaScript-based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically. It supports:
- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity Relationship diagrams
- Gantt charts
- And more...

### 📐 draw.io
[draw.io](https://app.diagrams.net/) (diagrams.net) is a free, open-source diagramming application that allows you to create professional diagrams. Features include:
- Wide variety of diagram types (UML, ER, Network diagrams, etc.)
- Multiple export formats (PNG, JPEG, SVG, PDF)
- Integration with cloud storage services
- Offline and online editing capabilities

## Project Structure
```
system-design/
├── ai-agent/              # AI agent designs and runnable artifacts
│   ├── claude-code-workflows/ # Claude Code dynamic-workflows write-up + workflow scripts
│   └── claude-code-statusline/ # Claude Code custom status-line setup guide + script
├── architecture/          # System architecture diagrams
│   ├── ai-integration/   # AI integration and LLM proxy designs
│   ├── eCommerceWebSite/ # E-commerce system designs
│   ├── jenkins/          # CI/CD pipeline architectures
│   ├── netflix/          # Netflix streaming design pack
│   ├── syncStatusWith3rdParty/ # Third-party integration patterns
│   └── uber/             # Uber ride-hailing design pack
├── flowchart/            # Process flow diagrams
│   └── dynamicLoading/   # Frontend component loading patterns
├── sdlc/                 # Software development lifecycle diagrams
│   └── git-flow-in-real-world/ # Git branch promotion and hotfix flows
├── sequenceDiagram/      # Interaction sequence diagrams
└── LICENSE              # MIT License
```

## AI Agent
Designs and runnable artifacts for building AI agents. See **[`ai-agent/`](./ai-agent/)** for the full index.

### Claude Code Dynamic Workflows
- **[Claude Code Dynamic Workflows](./ai-agent/claude-code-workflows/)** - A practical guide to *dynamic workflows* on Claude Code (the orchestration layer that fans out tens to hundreds of sub-agents in one session and verifies its own work), the six reusable patterns, and two runnable workflow scripts — `code-review-fanout.js` and `sdlc-workflow.js`. Includes a [繁體中文版](./ai-agent/claude-code-workflows/claude-code-dynamic-workflows-design.zh-TW.md).

### Claude Code Custom Status Line
- **[Claude Code Custom Status Line](./ai-agent/claude-code-statusline/)** - A guide to reproduce a rich single-line status bar (directory + branch, model, context-window remaining, 5h/7d rate limits, session cost) with a zero-dependency. 
e.g.
  ```
  my-project | feat/my-branch │ Fable 5 │  ━━━━━━┄┄┄┄ 63% │  5h:88% │  7d:15% │  $1.23
  ```

## Architecture Diagrams

### Popular Product System Designs
- **[Design Uber](./architecture/uber/)** - Ride request, trip lifecycle, and live location update diagrams with source-backed fulfillment and push-delivery boundaries
- **[Netflix Video Processing Pipeline Rebuild](./architecture/netflix/)** - Cosmos pipeline decomposition, media service boundaries, and VES workflow diagrams

### 🏗️ CI/CD & DevOps
- **[Jenkins CI/CD Architecture](./architecture/jenkins/)** - C4 context diagram showing Jenkins and Git repositories integration
- **[Sync Status with 3rd Party](./architecture/syncStatusWith3rdParty/)** - Architecture for synchronizing data with external systems

### 🤖 AI Integration
- **[Built-in AI on Chrome](./architecture/ai-integration/built-in-ai-on-chrome.md)** - Multi-LLM orchestration platform design for XPrompt, including browser extension, backend, response synthesis, and Chrome built-in AI prompt enhancement flows
- **[LLM Proxy on OpenClaw](./architecture/ai-integration/llm-proxy-on-openclaw.md)** - OpenClaw sidecar proxy design for LLM credential isolation, quota enforcement, webhook relay, and orchestrator admin APIs. (try use an AI tool, text to diagram : Napkin https://www.napkin.ai/)

### 🛒 E-Commerce Systems
- **[E-Commerce Website System Design](./architecture/eCommerceWebSite/)** - Complete system design using C4 Model
  - Available in both Mermaid and draw.io formats
  - Includes context and container diagrams
  - [Interactive draw.io viewer](https://viewer.diagrams.net/index.html?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=System_Design_C4Model_v1.drawio#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fmax9159%2Fsystem-design%2Fmain%2Farchitecture%2FeCommerceWebSite%2FSystem_Design_C4Model_v1.drawio)

## Flowcharts

### 🤖 AI & Automation
- **[AI Patent Infringement Check App](./flowchart/AIPatentInfringementCheckApp.flowchart.md)** - Dockerized AI application flow with OpenAI integration
- **[MCP Server with Playwright](./flowchart/McpServerWithPlaywrightExample.flowchart.md)** - Browser automation server architecture

### 🎮 Gaming & Betting Systems
- **[Auto Campaign Events Flow](./flowchart/AutoCampaignEventsFlow.flowchart.md)** - Automated campaign management system
- **[Bet Slip States](./flowchart/BetSlipStates.graph.md)** - State management for betting applications
- **[Shopping Cart States](./flowchart/#shopping-cart-states---frontend-component)** - Frontend component state management

### 💰 Reward & Token Systems
- **[Calculate Available Reward Tokens](./flowchart/TriggersCalcAvailableTokens.flowchart.md)** - Token calculation triggers and flow

### 🔄 Dynamic Loading Patterns
- **[Dynamic Loading Mechanism](./flowchart/dynamicLoading/)** - Frontend component lazy loading strategies
  - Left-to-right loading pattern
  - Top-to-bottom loading pattern

## Sequence Diagrams

### 📊 Data Flow Sequences
- **[Remain Campaign Count Flow](./sequenceDiagram/RemainCampaignCountFlow.sequenceDiagram.md)** - API interaction sequence for campaign counting
- **[Token States in Bet Placement](./sequenceDiagram/StatesInBetPlacementFlow.sequenceDiagram.md)** - Token state management during bet placement

## SDLC

### 🌿 Git Flow
- **[Git Flow in Real World](./sdlc/git-flow-in-real-world/)** - Mermaid git graph showing branch promotion from `dev` to `qat`, `uat`, and `prod`, plus production hotfix sync-back flow

## Getting Started

### Viewing Mermaid Diagrams
1. **GitHub**: Mermaid diagrams render automatically in `.md` files on GitHub
2. **Local**: Use any Markdown editor with Mermaid support (VS Code with Mermaid extension, Typora, etc.)
3. **Online**: Use the [Mermaid Live Editor](https://mermaid.live/)

### Viewing draw.io Diagrams
1. **Online**: Open `.drawio` files directly at [app.diagrams.net](https://app.diagrams.net/)
2. **Offline**: Download the [draw.io desktop app](https://github.com/jgraph/drawio-desktop/releases)
3. **HTML Preview**: Open the provided `.html` files in any web browser

### Quick Links
- 🤖 [AI Agent](./ai-agent/)
- 📁 [Architecture Diagrams](./architecture/)
- 📊 [Flowcharts](./flowchart/)
- 🔄 [Sequence Diagrams](./sequenceDiagram/)
- 🌿 [SDLC](./sdlc/)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. When contributing:
1. Use clear, descriptive names for your diagrams
2. Include a brief description of what the diagram represents
3. Follow the existing folder structure
4. Update relevant README files

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---
*Created and maintained by Max © 2026*

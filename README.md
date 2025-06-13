[![DeepWiki](https://img.shields.io/badge/DeepWiki-max9159%2Fsystem--design-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/max9159/system-design)

# System Design Repository
> A comprehensive collection of system design concepts and examples using **Mermaid diagrams** and **draw.io**, featuring real-world architectures, flowcharts, and sequence diagrams.

## 📋 Table of Contents
- [System Design Repository](#system-design-repository)
  - [📋 Table of Contents](#-table-of-contents)
  - [Overview](#overview)
  - [Technologies](#technologies)
    - [🧩 Mermaid](#-mermaid)
    - [📐 draw.io](#-drawio)
  - [Project Structure](#project-structure)
  - [Architecture Diagrams](#architecture-diagrams)
    - [🏗️ CI/CD \& DevOps](#️-cicd--devops)
    - [🛒 E-Commerce Systems](#-e-commerce-systems)
  - [Flowcharts](#flowcharts)
    - [🤖 AI \& Automation](#-ai--automation)
    - [🎮 Gaming \& Betting Systems](#-gaming--betting-systems)
    - [💰 Reward \& Token Systems](#-reward--token-systems)
    - [🔄 Dynamic Loading Patterns](#-dynamic-loading-patterns)
  - [Sequence Diagrams](#sequence-diagrams)
    - [📊 Data Flow Sequences](#-data-flow-sequences)
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
├── architecture/          # System architecture diagrams
│   ├── jenkins/          # CI/CD pipeline architectures
│   ├── eCommerceWebSite/ # E-commerce system designs
│   └── syncStatusWith3rdParty/ # Third-party integration patterns
├── flowchart/            # Process flow diagrams
│   └── dynamicLoading/   # Frontend component loading patterns
├── sequenceDiagram/      # Interaction sequence diagrams
└── LICENSE              # MIT License
```

## Architecture Diagrams

### 🏗️ CI/CD & DevOps
- **[Jenkins CI/CD Architecture](./architecture/jenkins/)** - C4 context diagram showing Jenkins and Git repositories integration
- **[Sync Status with 3rd Party](./architecture/syncStatusWith3rdParty/)** - Architecture for synchronizing data with external systems

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
- 📁 [Architecture Diagrams](./architecture/)
- 📊 [Flowcharts](./flowchart/)
- 🔄 [Sequence Diagrams](./sequenceDiagram/)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. When contributing:
1. Use clear, descriptive names for your diagrams
2. Include a brief description of what the diagram represents
3. Follow the existing folder structure
4. Update relevant README files

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---
*Created and maintained by Max © 2023*
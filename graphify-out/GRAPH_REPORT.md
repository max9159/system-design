# Graph Report - .  (2026-05-22)

## Corpus Check
- 19 files · ~50,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 171 nodes · 183 edges · 20 communities detected
- Extraction: 90% EXTRACTED · 8% INFERRED · 2% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.7)
- Token cost: 12,500 input · 3,800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Survey Distributed Systems|Survey: Distributed Systems]]
- [[_COMMUNITY_Netflix Cosmos Architecture|Netflix Cosmos Architecture]]
- [[_COMMUNITY_Chrome AI Extensions|Chrome AI Extensions]]
- [[_COMMUNITY_Video Processing & CDN|Video Processing & CDN]]
- [[_COMMUNITY_GoGoShop Container Design|GoGoShop Container Design]]
- [[_COMMUNITY_AI Patent System|AI Patent System]]
- [[_COMMUNITY_Campaign Management|Campaign Management]]
- [[_COMMUNITY_E-commerce Microservices|E-commerce Microservices]]
- [[_COMMUNITY_LLM Proxy Architecture|LLM Proxy Architecture]]
- [[_COMMUNITY_GoGoShop System Context|GoGoShop System Context]]
- [[_COMMUNITY_Betting Platform Components|Betting Platform Components]]
- [[_COMMUNITY_Jenkins CICD Pipeline|Jenkins CI/CD Pipeline]]
- [[_COMMUNITY_Diagram Documentation|Diagram Documentation]]
- [[_COMMUNITY_Campaign API Layer|Campaign API Layer]]
- [[_COMMUNITY_Airbnb Data Mesh|Airbnb Data Mesh]]
- [[_COMMUNITY_Git Branching Strategy|Git Branching Strategy]]
- [[_COMMUNITY_GitHub Code Search|GitHub Code Search]]
- [[_COMMUNITY_Flowchart Docs|Flowchart Docs]]
- [[_COMMUNITY_Sequence Diagram Docs|Sequence Diagram Docs]]
- [[_COMMUNITY_YouTube Design Survey|YouTube Design Survey]]

## God Nodes (most connected - your core abstractions)
1. `Netflix Cosmos Workflow-Driven Platform` - 13 edges
2. `Uber Fulfillment Platform Re-architecture` - 12 edges
3. `Microservices Architecture` - 7 edges
4. `iclaw-openclaw-proxy Sidecar` - 6 edges
5. `iclaw-openclaw-proxy` - 6 edges
6. `ProductService` - 6 edges
7. `Shopping Portal` - 6 edges
8. `Back Office` - 6 edges
9. `XPrompt` - 5 edges
10. `Back Office` - 5 edges

## Surprising Connections (you probably didn't know these)
- `XPrompt` --semantically_similar_to--> `MCP Processing Pipeline`  [INFERRED] [semantically similar]
  architecture/ai-integration/built-in-ai-on-chrome.md → flowchart/McpServerWithPlaywrightExample.flowchart.md
- `Chrome Built-in AI` --semantically_similar_to--> `OpenAI API`  [INFERRED] [semantically similar]
  architecture/ai-integration/built-in-ai-on-chrome.md → flowchart/AIPatentInfringementCheckApp.flowchart.md
- `Kafka` --semantically_similar_to--> `AutoCampaignHandler Job`  [INFERRED] [semantically similar]
  architecture/syncStatusWith3rdParty/index.md → flowchart/AutoCampaignEventsFlow.flowchart.md
- `Bet Slip States Store` --semantically_similar_to--> `Active Tokens State`  [INFERRED] [semantically similar]
  flowchart/BetSlipStates.graph.md → sequenceDiagram/StatesInBetPlacementFlow.sequenceDiagram.md
- `VES Chunked Parallel Encoding Strategy` --semantically_similar_to--> `Dropbox Object Store PUT Batching and Chunking`  [INFERRED] [semantically similar]
  architecture/netflix/index.md → survey/dropbox-object-store.md

## Hyperedges (group relationships)
- **Netflix Cosmos Video Processing Pipeline (VIS â†’ CAS â†’ LGS â†’ VES â†’ VQS â†’ VVS)** — netflix_vis_service, netflix_cas_service, netflix_lgs_service, netflix_ves_service, netflix_vqs_service, netflix_vvs_service, netflix_cosmos_platform [EXTRACTED 1.00]
- **Uber New Fulfillment Platform: BTC + Statecharts + ORM + Spanner + LATE** — uber_btc_coordinator, uber_entity_statecharts, uber_orm_layer, uber_spanner_storage, uber_late_action_table [EXTRACTED 1.00]
- **Multi-Entity Transactional Lifecycle Pattern (Uber Trip+Supply, Stripe Ledger, FOQS Queue)** — uber_entity_statecharts, survey_stripe_ledger_state_machine, survey_meta_foqs_priority_queue, uber_late_action_table [INFERRED 0.75]

## Communities

### Community 0 - "Survey: Distributed Systems"
Cohesion: 0.11
Nodes (21): Design Uber Topic Index, FOQS Multi-Tenant Topic and Consumer Model, Meta FOQS Distributed Priority Queue, Stripe Ledger Money Movement System, Stripe Ledger Immutable Transaction Model, Stripe Ledger Payment State Machine, Uber gRPC Bidirectional Streaming (vs SSE), Uber Next Gen Push Platform on gRPC (+13 more)

### Community 1 - "Netflix Cosmos Architecture"
Cohesion: 0.14
Nodes (18): Architecture Overview, CAS - Complexity Analysis Service, Netflix Cosmos Workflow-Driven Platform, Rationale: Microservice Boundaries Hide Execution Strategy, Rationale: Workflow-Driven Platform over Synchronous Request Chain, Netflix Video Processing Pipeline Rebuild, LGS - Ladder Generation Service, Optimus - Cosmos API Layer (+10 more)

### Community 2 - "Chrome AI Extensions"
Cohesion: 0.13
Nodes (17): Jenkins and Git Repositories C4 Context, XPrompt API, XPrompt Extension, LLM Providers, XPrompt Portal, XPrompt, Admin API, LLM Credential Boundary Rationale (+9 more)

### Community 3 - "Video Processing & CDN"
Cohesion: 0.13
Nodes (16): VES Chunked Parallel Encoding Strategy, VES - Video Encoding Service, Cloudflare Images Pipeline, Cloudflare Images Signed URL Access Control, Cloudflare Images Variant Generation and CDN Delivery, Design Instagram Topic Index, Design WhatsApp Topic Index, Discord Message Storage (Trillions of Messages) (+8 more)

### Community 4 - "GoGoShop Container Design"
Cohesion: 0.22
Nodes (15): Back Office, Cache, Firebase Cloud Messaging, GoGoShop Container Diagram, Merchant, Message Queue, Product DB, ProductService (+7 more)

### Community 5 - "AI Patent System"
Cohesion: 0.15
Nodes (13): Patent ID and Company Input Handler, AI Patent Node.js Backend, OpenAI API, OpenAI Prompt Template, AI Patent React Frontend, Background Service Worker, Chrome Built-in AI, Executor Content Script (+5 more)

### Community 6 - "Campaign Management"
Cohesion: 0.17
Nodes (12): Auto Campaign DomainService, AutoCampaignHandler Job, AutoCampaignSettleHandler Job, Auto Campaign Third-Party API, Kafka, Notification Status Flow, Notify Consume Service, Notify Integration API (+4 more)

### Community 7 - "E-commerce Microservices"
Cohesion: 0.2
Nodes (10): JWT Authentication, Microservices Architecture, Monolithic Architecture Limitations, ProductService, Single Page Application Frontend, Third-Party Communication Services, UserService, WebSockets Real-Time Updates (+2 more)

### Community 8 - "LLM Proxy Architecture"
Cohesion: 0.27
Nodes (10): iclaw-openclaw-proxy, Inject real LLM_API_KEY from memory, LLM upstream, OpenClaw never sees the real API key, OpenClaw Gateway, OpenClaw Gateway to LLM Upstream, POST /v1/chat/completions, Real LLM API key (+2 more)

### Community 9 - "GoGoShop System Context"
Cohesion: 0.29
Nodes (10): Back Office, Business Report, Customer Account, GoGoShop System Context, Merchant, Product, Promotion, Shopping Portal (+2 more)

### Community 10 - "Betting Platform Components"
Cohesion: 0.4
Nodes (6): Bet Selection Components, Bet Slip States Store, dynamicMarketSelections, Active Tokens State, Bet Placement Client, Bet Placement Server

### Community 11 - "Jenkins CI/CD Pipeline"
Cohesion: 0.4
Nodes (5): Git Repo Source Database Package Sources, PROD Internal Artifacts Branch, PROD.Generatepackage, UAT Internal Artifacts Branch, UAT.Generatepackage

### Community 12 - "Diagram Documentation"
Cohesion: 0.5
Nodes (4): eCommerce C4 Model draw.io Sources, draw.io, Mermaid, System Design Repository

### Community 13 - "Campaign API Layer"
Cohesion: 0.5
Nodes (4): ClientApp, DomainAPI, PublicAPI, Redis remainCampaignCount

### Community 14 - "Airbnb Data Mesh"
Cohesion: 0.67
Nodes (3): Airbnb Viaduct Data-Oriented Service Mesh, Viaduct Central GraphQL Execution Engine, Viaduct Tenant Modules (Hosted Business Logic)

### Community 15 - "Git Branching Strategy"
Cohesion: 1.0
Nodes (2): Git Flow Branch Promotion, Production Hotfix Sync Back

### Community 16 - "GitHub Code Search"
Cohesion: 1.0
Nodes (2): GitHub Blackbird Code Search Engine, GitHub Code Search Indexing Pipeline

### Community 17 - "Flowchart Docs"
Cohesion: 1.0
Nodes (1): Flowcharts

### Community 18 - "Sequence Diagram Docs"
Cohesion: 1.0
Nodes (1): Sequence Diagrams

### Community 19 - "YouTube Design Survey"
Cohesion: 1.0
Nodes (1): Design YouTube Topic Index

## Ambiguous Edges - Review These
- `Offscreen Document Chrome AI Bridge` → `LayoutConfig State`  [AMBIGUOUS]
  flowchart/dynamicLoading/DynamicLoadindgMechanism.flowchart.md · relation: conceptually_related_to
- `UserService` → `ProductService`  [AMBIGUOUS]
  architecture/eCommerceWebSite/System_Design_v1-Container.drawio.png · relation: calls
- `Cloudflare Images Variant Generation and CDN Delivery` → `Discord Cassandra to ScyllaDB Migration`  [AMBIGUOUS]
  survey/cloudflare-images-pipeline.md · relation: semantically_similar_to

## Knowledge Gaps
- **71 isolated node(s):** `Mermaid`, `Flowcharts`, `Sequence Diagrams`, `Jenkins and Git Repositories C4 Context`, `UAT Internal Artifacts Branch` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Git Branching Strategy`** (2 nodes): `Git Flow Branch Promotion`, `Production Hotfix Sync Back`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GitHub Code Search`** (2 nodes): `GitHub Blackbird Code Search Engine`, `GitHub Code Search Indexing Pipeline`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Flowchart Docs`** (1 nodes): `Flowcharts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sequence Diagram Docs`** (1 nodes): `Sequence Diagrams`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `YouTube Design Survey`** (1 nodes): `Design YouTube Topic Index`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Offscreen Document Chrome AI Bridge` and `LayoutConfig State`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `UserService` and `ProductService`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **What is the exact relationship between `Cloudflare Images Variant Generation and CDN Delivery` and `Discord Cassandra to ScyllaDB Migration`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `Netflix Cosmos Workflow-Driven Platform` connect `Netflix Cosmos Architecture` to `Video Processing & CDN`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Uber Fulfillment Platform Re-architecture` connect `Survey: Distributed Systems` to `Netflix Cosmos Architecture`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `Mermaid`, `Flowcharts`, `Sequence Diagrams` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Survey: Distributed Systems` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
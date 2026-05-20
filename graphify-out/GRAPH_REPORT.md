# Graph Report - D:\GitHub\_self\system-design  (2026-05-20)

## Corpus Check
- Corpus is ~21,954 words - fits in a single context window. You may not need a graph.

## Summary
- 110 nodes · 117 edges · 15 communities detected
- Extraction: 90% EXTRACTED · 9% INFERRED · 2% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_GoGoShop Containers|GoGoShop Containers]]
- [[_COMMUNITY_AI UI Workflows|AI UI Workflows]]
- [[_COMMUNITY_Notification Campaigns|Notification Campaigns]]
- [[_COMMUNITY_eCommerce Microservices|eCommerce Microservices]]
- [[_COMMUNITY_LLM Proxy Flow|LLM Proxy Flow]]
- [[_COMMUNITY_GoGoShop Context|GoGoShop Context]]
- [[_COMMUNITY_XPrompt MCP AI|XPrompt MCP AI]]
- [[_COMMUNITY_OpenClaw Sidecar|OpenClaw Sidecar]]
- [[_COMMUNITY_Bet State Management|Bet State Management]]
- [[_COMMUNITY_Jenkins Artifact Flow|Jenkins Artifact Flow]]
- [[_COMMUNITY_Diagram Tooling|Diagram Tooling]]
- [[_COMMUNITY_Campaign Count API|Campaign Count API]]
- [[_COMMUNITY_Git Flow|Git Flow]]
- [[_COMMUNITY_Flowchart Index|Flowchart Index]]
- [[_COMMUNITY_Sequence Index|Sequence Index]]

## God Nodes (most connected - your core abstractions)
1. `Microservices Architecture` - 7 edges
2. `iclaw-openclaw-proxy Sidecar` - 6 edges
3. `iclaw-openclaw-proxy` - 6 edges
4. `ProductService` - 6 edges
5. `Shopping Portal` - 6 edges
6. `Back Office` - 6 edges
7. `XPrompt` - 5 edges
8. `Back Office` - 5 edges
9. `UserService` - 5 edges
10. `Architecture Diagrams` - 4 edges

## Surprising Connections (you probably didn't know these)
- `XPrompt` --semantically_similar_to--> `MCP Processing Pipeline`  [INFERRED] [semantically similar]
  architecture/ai-integration/built-in-ai-on-chrome.md → flowchart/McpServerWithPlaywrightExample.flowchart.md
- `Chrome Built-in AI` --semantically_similar_to--> `OpenAI API`  [INFERRED] [semantically similar]
  architecture/ai-integration/built-in-ai-on-chrome.md → flowchart/AIPatentInfringementCheckApp.flowchart.md
- `Kafka` --semantically_similar_to--> `AutoCampaignHandler Job`  [INFERRED] [semantically similar]
  architecture/syncStatusWith3rdParty/index.md → flowchart/AutoCampaignEventsFlow.flowchart.md
- `Bet Slip States Store` --semantically_similar_to--> `Active Tokens State`  [INFERRED] [semantically similar]
  flowchart/BetSlipStates.graph.md → sequenceDiagram/StatesInBetPlacementFlow.sequenceDiagram.md
- `LayoutConfig State` --conceptually_related_to--> `Offscreen Document Chrome AI Bridge`  [AMBIGUOUS]
  flowchart/dynamicLoading/DynamicLoadindgMechanism.flowchart.md → architecture/ai-integration/built-in-ai-on-chrome.md

## Hyperedges (group relationships)
- **XPrompt Multi-LLM Orchestration Flow** — built_in_ai_on_chrome_portal, built_in_ai_on_chrome_background_service_worker, built_in_ai_on_chrome_executor, built_in_ai_on_chrome_llm_providers, built_in_ai_on_chrome_api [EXTRACTED 1.00]
- **Notification Status Sync Flow** — sync_status_notify_integration_api, sync_status_kafka, sync_status_notify_consume_service, sync_status_third_party_api, sync_status_portal_notification [EXTRACTED 1.00]
- **Dynamic Component Loading Pattern** — dynamic_loading_results_component, dynamic_loading_layout_config, dynamic_loading_result_ball_loader, dynamic_loading_result_summary_loader, dynamic_loading_counter_dynamic_market_selections [EXTRACTED 1.00]
- **Gateway Proxy Upstream Flow** — llm_proxy_cmp_diagram_openclaw_gateway, llm_proxy_cmp_diagram_iclaw_openclaw_proxy, llm_proxy_cmp_diagram_llm_upstream [EXTRACTED 1.00]
- **Proxy Auth Header Rewrite** — llm_proxy_cmp_diagram_strip_incoming_auth_headers, llm_proxy_cmp_diagram_inject_real_llm_api_key_from_memory, llm_proxy_cmp_diagram_real_llm_api_key [EXTRACTED 1.00]
- **GoGoShop Frontend Clients** — System_Design_v1-Container_user, System_Design_v1-Container_merchant, System_Design_v1-Container_shopping_portal, System_Design_v1-Container_back_office [EXTRACTED 1.00]
- **GoGoShop REST Service Layer** — System_Design_v1-Container_shopping_portal, System_Design_v1-Container_back_office, System_Design_v1-Container_user_service, System_Design_v1-Container_product_service, System_Design_v1-Container_rest_api [EXTRACTED 1.00]
- **GoGoShop Messaging Flow** — System_Design_v1-Container_firebase_cloud_messaging, System_Design_v1-Container_real_time_message, System_Design_v1-Container_back_office, System_Design_v1-Container_product_service, System_Design_v1-Container_message_queue, System_Design_v1-Container_pub_sub_message [INFERRED 0.80]
- **GoGoShop Customer Purchase Context** — system_design_v1_context_user, system_design_v1_context_shopping_portal, system_design_v1_context_product, system_design_v1_context_merchant, system_design_v1_context_customer_account [EXTRACTED 1.00]
- **GoGoShop Merchant Management Context** — system_design_v1_context_merchant, system_design_v1_context_back_office, system_design_v1_context_store, system_design_v1_context_user, system_design_v1_context_promotion, system_design_v1_context_business_report [INFERRED 0.75]

## Communities

### Community 0 - "GoGoShop Containers"
Cohesion: 0.22
Nodes (15): Back Office, Cache, Firebase Cloud Messaging, GoGoShop Container Diagram, Merchant, Message Queue, Product DB, ProductService (+7 more)

### Community 1 - "AI UI Workflows"
Cohesion: 0.15
Nodes (13): Patent ID and Company Input Handler, AI Patent Node.js Backend, OpenAI API, OpenAI Prompt Template, AI Patent React Frontend, Background Service Worker, Chrome Built-in AI, Executor Content Script (+5 more)

### Community 2 - "Notification Campaigns"
Cohesion: 0.17
Nodes (12): Auto Campaign DomainService, AutoCampaignHandler Job, AutoCampaignSettleHandler Job, Auto Campaign Third-Party API, Kafka, Notification Status Flow, Notify Consume Service, Notify Integration API (+4 more)

### Community 3 - "eCommerce Microservices"
Cohesion: 0.2
Nodes (10): JWT Authentication, Microservices Architecture, Monolithic Architecture Limitations, ProductService, Single Page Application Frontend, Third-Party Communication Services, UserService, WebSockets Real-Time Updates (+2 more)

### Community 4 - "LLM Proxy Flow"
Cohesion: 0.27
Nodes (10): iclaw-openclaw-proxy, Inject real LLM_API_KEY from memory, LLM upstream, OpenClaw never sees the real API key, OpenClaw Gateway, OpenClaw Gateway to LLM Upstream, POST /v1/chat/completions, Real LLM API key (+2 more)

### Community 5 - "GoGoShop Context"
Cohesion: 0.29
Nodes (10): Back Office, Business Report, Customer Account, GoGoShop System Context, Merchant, Product, Promotion, Shopping Portal (+2 more)

### Community 6 - "XPrompt MCP AI"
Cohesion: 0.28
Nodes (9): XPrompt API, XPrompt Extension, LLM Providers, XPrompt Portal, XPrompt, Context Management, LLM API, MCP Processing Pipeline (+1 more)

### Community 7 - "OpenClaw Sidecar"
Cohesion: 0.25
Nodes (8): Jenkins and Git Repositories C4 Context, Admin API, LLM Credential Boundary Rationale, LLM Reverse Proxy, OpenClaw Gateway, iclaw-openclaw-proxy Sidecar, Webhook Relay, Architecture Diagrams

### Community 8 - "Bet State Management"
Cohesion: 0.4
Nodes (6): Bet Selection Components, Bet Slip States Store, dynamicMarketSelections, Active Tokens State, Bet Placement Client, Bet Placement Server

### Community 9 - "Jenkins Artifact Flow"
Cohesion: 0.4
Nodes (5): Git Repo Source Database Package Sources, PROD Internal Artifacts Branch, PROD.Generatepackage, UAT Internal Artifacts Branch, UAT.Generatepackage

### Community 10 - "Diagram Tooling"
Cohesion: 0.5
Nodes (4): eCommerce C4 Model draw.io Sources, draw.io, Mermaid, System Design Repository

### Community 11 - "Campaign Count API"
Cohesion: 0.5
Nodes (4): ClientApp, DomainAPI, PublicAPI, Redis remainCampaignCount

### Community 12 - "Git Flow"
Cohesion: 1.0
Nodes (2): Git Flow Branch Promotion, Production Hotfix Sync Back

### Community 13 - "Flowchart Index"
Cohesion: 1.0
Nodes (1): Flowcharts

### Community 14 - "Sequence Index"
Cohesion: 1.0
Nodes (1): Sequence Diagrams

## Ambiguous Edges - Review These
- `Offscreen Document Chrome AI Bridge` → `LayoutConfig State`  [AMBIGUOUS]
  flowchart/dynamicLoading/DynamicLoadindgMechanism.flowchart.md · relation: conceptually_related_to
- `UserService` → `ProductService`  [AMBIGUOUS]
  architecture/eCommerceWebSite/System_Design_v1-Container.drawio.png · relation: calls

## Knowledge Gaps
- **45 isolated node(s):** `Mermaid`, `Flowcharts`, `Sequence Diagrams`, `Jenkins and Git Repositories C4 Context`, `UAT Internal Artifacts Branch` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Git Flow`** (2 nodes): `Git Flow Branch Promotion`, `Production Hotfix Sync Back`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Flowchart Index`** (1 nodes): `Flowcharts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sequence Index`** (1 nodes): `Sequence Diagrams`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Offscreen Document Chrome AI Bridge` and `LayoutConfig State`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `UserService` and `ProductService`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **Why does `XPrompt` connect `XPrompt MCP AI` to `OpenClaw Sidecar`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `Architecture Diagrams` connect `OpenClaw Sidecar` to `eCommerce Microservices`, `XPrompt MCP AI`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `XPrompt Extension` connect `XPrompt MCP AI` to `AI UI Workflows`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `Mermaid`, `Flowcharts`, `Sequence Diagrams` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
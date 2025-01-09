# Sequence Diagrams<!-- omit in toc -->
<!-- table of content -->
- [Abstract](#abstract)
- [Remaining Campaign Count Flow](#remaining-campaign-count-flow)
- [Token States in Bet Placement Flow](#token-states-in-bet-placement-flow)

## Abstract
This document provides a collection of `sequence diagrams` that **describe various processes and systems** in the context of software development. These sequence diagrams are created using the `Mermaid` syntax and are designed to help `visualize` the flow of data, events, and interactions within a system.

## Remaining Campaign Count Flow
```mermaid
---
title: Remain Campaign Count Flow
---
sequenceDiagram
    ClientApp->>+PublicAPI: GET /api/CampaignInfo
    PublicAPI->>+DomainAPI: GET /api/Campaign/RemainCampaignCount
    DomainAPI->>+Redis: GET remainCampaignCount
    Redis-->>-DomainAPI: Return remainCampaignCount
    DomainAPI-->>-PublicAPI: Return remainCampaignCount 
    PublicAPI-->>-ClientApp: Return remainCampaignCount 
    OpenCampaignJob->>+DomainAPI: PUT /api/Campaign/RemainCampaignCount
    DomainAPI->>-Redis: Update remainCampaignCount
```

## Token States in Bet Placement Flow
```mermaid
---
title: Token States in Bet Placement Flow
---
sequenceDiagram
    Client->>+Server: Invoke api/PlaceBet with Free Bet Token
    Server-->>-Client: Respond Success Bets with free bet token
    Client->>Client: Remove Success Free Bet Token
    Client->>+Server: Invoke api/Reward/ActiveTokens
    Server-->>-Client: Respond Active Tokens
    Client->>Client : Update Active Tokens 
    Note right of Client: If tokens change UI will be affected.
    Note right of Client: Don't change success bet's used token.
```

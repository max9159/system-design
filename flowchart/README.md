<!-- table of content -->
- [Abstract](#abstract)
- [AI Patent Infringement Check App](#ai-patent-infringement-check-app)
- [Auto Campaign Events Flow](#auto-campaign-events-flow)
- [Shopping Cart States - Frontend Component](#shopping-cart-states---frontend-component)
- [Triggers - Calculate Available Reward Tokens](#triggers---calculate-available-reward-tokens)
- [Dynamic Loadindg Mechanism - Frontend Component (Left to Right)](#dynamic-loadindg-mechanism---frontend-component-left-to-right)
- [Dynamic Loadindg Mechanism - Frontend Component (Top to Bottom)](#dynamic-loadindg-mechanism---frontend-component-top-to-bottom)

## Abstract
This document provides a collection of `flowcharts` that **describe various processes and systems** in the context of software development. These flowcharts are created using the `Mermaid` syntax and are designed to help `visualize` the flow of data, events, and interactions within a system.

## AI Patent Infringement Check App
```mermaid
---
title: AI Patent Infringement Check App
---
flowchart TB
    subgraph Client["Client Layer"]
        Browser["User's Browser"]
        Frontend["React Frontend (Dockerized)"]
    end

    subgraph Backend["Server Layer (Dockerized)"]
        NodeBackend["Node.js Backend"]
        Template["OpenAI Prompt Template"]
        
        subgraph Processing["Data Processing"]
            InputHandler["Patent ID & Company Input Handler"]
        end
    end

    subgraph External["External Services"]
        OpenAI["OpenAI API"]
    end

    Browser --> Frontend
    Frontend --> NodeBackend
    NodeBackend --> InputHandler
    InputHandler --> Template
    Template --> InputHandler
    InputHandler --> NodeBackend
    NodeBackend --Prompt with Patent & Company Info--> OpenAI
    OpenAI --Response Standard JSON--> NodeBackend
    NodeBackend --> Frontend

    classDef docker fill:#e1f5fe,stroke:#01579b
    classDef process fill:#e8f5e9,stroke:#2e7d32
    classDef External fill:#fff3e0,stroke:#e65100
    
    class Frontend,NodeBackend docker
    class InputHandler,Template process
    class OpenAI,Standard External
```

## Auto Campaign Events Flow
```mermaid
---
title: Auto Campaign Events Flow
---
flowchart TD; 
D[1.GameConsole] -->|API:CreateAutoCampaignSetting| A[DomainService]; 
A --> |Message:UpdateAutoCampaignSettingForProcessing| B[Job:AutoCampaignHandler];
C[2.Job:CampaignSettlement] -->|Message:AutoCampaignReport| E[Job:AutoCampaignSettleHandler]; 
E --> |API:SettleAutoCampaigns| A;
A --> |Message:AutoCampaign.SettleBet| B;
F[3.Job:OpenCampaign] --> |API:OpenCampaign| A;
A --> |Message:OpenCampaign| B;
B --> |API:BetPlacement| H[3rd-party's API]
```

## Shopping Cart States - Frontend Component
```mermaid
---
title: Shopping Cart States - Frontend Component
---
graph LR
          subgraph main-selection
            subgraph selection-category 
              simple-selection
            end
            quick-selection
          end
          subgraph balls-selection-single
            D[ball-selection]
          end
          subgraph balls-selection-three-in-one
            E[ball-selection]
            pre-shopping-cart
          end
		shopping-cart
		shopping-cart-states
simple-selection --Add/Remove bet item--> shopping-cart-states;
quick-selection --Add/Remove bet item--> shopping-cart-states;
D[ball-selection] --Add/Remove bet item--> shopping-cart-states;
E[ball-selection] --Add/Remove bet item--> pre-shopping-cart;
pre-shopping-cart --Add/Remove bet item--> shopping-cart-states;
shopping-cart --Subscribe States--> shopping-cart-states;
D[ball-selection] --Subscribe States--> shopping-cart-states;
simple-selection --Subscribe States--> shopping-cart-states;
quick-selection --Subscribe States--> shopping-cart-states;
```

## Triggers - Calculate Available Reward Tokens
```mermaid
---
title: Triggers:Calculate Available Reward Tokens
---
flowchart 
    subgraph State Management
        subgraph Bets
            CreateAndUpdateBetSlipsAction
            RemoveBetSlipsAction
            ToAddUsedRewardOnBetSlipItem
            ToRemoveUsedRewardOnBetSlipItem
            P[PlaceBetWithBetSlipItemsAction]
        end
        S{HasSuccessBets}
        N[Do Nothing]
        Y[Success Actions]
        subgraph Reward
            SaveFreeBetActiveTokensAction
            SaveTokenGroupsAction
            RemoveActiveTokensBySuccessBetAction
            FetchActiveRewardTokensAction
            FetchAllRewardTokensAction
            CalcAvailableRewardTokensAction
        end
        
    end

CreateAndUpdateBetSlipsAction --> CalcAvailableRewardTokensAction
RemoveBetSlipsAction --> CalcAvailableRewardTokensAction
ToAddUsedRewardOnBetSlipItem --> CalcAvailableRewardTokensAction
ToRemoveUsedRewardOnBetSlipItem --> CalcAvailableRewardTokensAction
P-->S
S--YES--> Y
Y-->RemoveActiveTokensBySuccessBetAction --> CalcAvailableRewardTokensAction
Y--> FetchActiveRewardTokensAction
S--NO--> N
FetchActiveRewardTokensAction --API Respond--> SaveFreeBetActiveTokensAction--> CalcAvailableRewardTokensAction

FetchAllRewardTokensAction --API Respond--> SaveTokenGroupsAction
SaveTokenGroupsAction --> CalcAvailableRewardTokensAction

```

## Dynamic Loadindg Mechanism - Frontend Component (Left to Right)
```mermaid
---
title: Dynamic Loadindg Mechanism - Frontend Component
---
flowchart LR
    subgraph ResultsComponent
        GameDropDown
        DateFilterBar
        Loop:ResultContainer
        subgraph ResultContainer
            ResultBallLoader
            ResultSummaryLoader
        end
    end

ResultsComponent -- Get `resultSummary`, `displayResultNumbers`  --> API:Results
ResultsComponent -- Get `componetId` of `miniResultLayout` by counter  --> State:LayoutConfig
Loop:ResultContainer -- Single Result Data --> ResultContainer

ResultSummaryLoader -- Dynamic loading by componentId --> GeneralSummaryResult
ResultBallLoader -- Dynamic loading by componentId --> TwoRowsBallResult
ResultBallLoader -- Dynamic loading by componentId --> OneRowBallResult
ResultBallLoader -- Dynamic loading by componentId --> OneRowAddUpBallResult
ResultBallLoader -- Dynamic loading by componentId --> TwoRowsWithHeaderBallResult

```

## Dynamic Loadindg Mechanism - Frontend Component (Top to Bottom)
```mermaid
---
title: Dynamic Loadindg Mechanism (Counter)
---
flowchart TB
    subgraph counter-layout
        subgraph counter-info
          mini-result-layout
          mini-results-listing
          mini-result
        end
        subgraph market-selection-tab
		  subgraph dynamicMarketSelections
          end
          subgraph main-selection
            subgraph selection-category 
              simple-selection
            end
          end
          subgraph balls-selection-single
            D[ball-selection]
          end
          subgraph balls-selection-three-in-one
            E[ball-selection]
            pre-bet-slip
          end
        end
    end
dynamicMarketSelections --Dynamic loading--> main-selection
dynamicMarketSelections --Dynamic loading--> balls-selection-single
dynamicMarketSelections --Dynamic loading--> balls-selection-three-in-one
mini-result-layout -- Popup --> mini-results-listing
mini-result-layout -- Single Display --> mini-result
mini-results-listing -- Multiple Display  --> mini-result
```

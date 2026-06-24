<!-- omit in toc -->
# Uber Fulfillment Platform Re-architecture
> This Uber case study is more useful than a generic "request a ride" diagram. The official Fulfillment articles explain why lifecycle-heavy marketplace systems become hard to evolve when one business action must update several entities, emit side effects, survive retries, and keep a consistent view for consumers.

<!-- omit in toc -->
## 📋 Table of Contents

- [Case-Study Focus](#case-study-focus)
- [Read This First](#read-this-first)
- [Source Map](#source-map)
- [Evidence Boundary](#evidence-boundary)
- [1. Why The Previous Write Path Became Hard](#1-why-the-previous-write-path-became-hard)
- [2. What The Rebuild Changes](#2-what-the-rebuild-changes)
- [3. Transactional Trigger And Durable Side Effects](#3-transactional-trigger-and-durable-side-effects)
- [Technical Takeaways](#technical-takeaways)
- [Follow-Up Depth](#follow-up-depth)

## Case-Study Focus

- Fulfillment entities such as `Trip` and `Supply`, not pricing, routing, or the dispatch algorithm.
- The previous architecture's availability-first write model and its multi-entity consistency cost.
- The new programming model built around statecharts, a Business Transaction Coordinator, an ORM layer, Spanner transactions, and durable post-commit work.
- Technical patterns that transfer to order orchestration, delivery, booking, and other multi-entity lifecycle systems.

## Read This First

Start with the old multi-entity write problem. It explains why Uber's rebuild matters before looking at Spanner or the new framework components.

## Source Map

The diagrams below distill the official sources collected by [Design Uber](../../survey/design-uber-index.md).

| Source | Used for |
| --- | --- |
| [Uber Fulfillment Platform re-architecture](https://www.uber.com/blog/fulfillment-platform-rearchitecture/) | Previous architecture problems, Trip and Supply entities, new programming model, LATE, and the application architecture components. |
| [Building Uber's Fulfillment Platform using Spanner](https://www.uber.com/blog/building-ubers-fulfillment-platform/) | Why consistency became a selection criterion and what Spanner contributes to multi-row, multi-table transactions. |

## Evidence Boundary

**Verified by the source set**

- A driver accepting a trip offer is a multi-entity write: the Trip entity changes and the Supply plan gains trip waypoints.
- The previous stack used `rt-demand` and `rt-supply` over Cassandra and Redis, Ringpop serialization, and Saga coordination for cross-entity work.
- Uber moved fulfillment storage to Spanner for transactional consistency, horizontal scalability, and lower operational overhead.
- The new application model centers on statecharts, a Business Transaction Coordinator, and an ORM layer; post-commit operations and timers are committed to a LATE action table for at-least-once execution.

**Assumptions in these diagrams**

- The diagrams are educational reconstructions from the public articles, not copies of Uber's internal diagrams or a current service inventory.
- The examples use the simple UberX `Trip` and `Supply` terms because the official article uses them to explain the platform.
- RPC endpoints, table names beyond the published LATE action table concept, retries, and observability hooks are intentionally abstracted.

## 1. Why The Previous Write Path Became Hard

One acceptance action touches both demand and supply state. In the previous architecture, application-layer coordination could leave entities temporarily inconsistent between operations and made cross-service debugging harder as flows became more complex.

```mermaid
flowchart LR
    Accept["Driver accepts trip offer"] --> Saga["Saga / RPC coordination"]

    subgraph Demand["rt-demand"]
        DemandLock["Ringpop owner<br/>serial read-modify-write"]
        Trip["Trip entity"]
        DemandStore[("Redis + Cassandra")]
        DemandLock --> Trip --> DemandStore
    end

    subgraph Supply["rt-supply"]
        SupplyLock["Ringpop owner<br/>serial read-modify-write"]
        Plan["Supply entity<br/>driver plan + waypoints"]
        SupplyStore[("Redis + Cassandra")]
        SupplyLock --> Plan --> SupplyStore
    end

    Saga --> DemandLock
    Saga --> SupplyLock
    DemandStore --> Outcome["Logical transaction outcome"]
    SupplyStore --> Outcome
    Outcome --> Good["Both entities agree"]
    Outcome --> Gap["Failure window<br/>mismatch, compensation,<br/>reconciliation"]
```

## 2. What The Rebuild Changes

The rebuild is not just a database swap. It moves business lifecycle modeling, multi-entity coordination, transaction abstraction, and post-commit work into explicit platform components. The previous stack favored availability through application sharding and best-effort coordination; the new requirements call out strong consistency for multi-row and multi-table transactions.

```mermaid
flowchart LR
    subgraph Previous["Previous fulfillment stack"]
        OldAPI["rt-demand / rt-supply"]
        Ringpop["Ringpop ownership<br/>serial queue + in-memory lock"]
        Saga["Saga + RPC coordination"]
        Cache["In-memory cache + Redis"]
        Cassandra[("MSG / Cassandra")]
        OldAPI --> Ringpop --> Saga
        Ringpop --> Cache --> Cassandra
        Saga --> Cassandra
    end

    subgraph New["New fulfillment platform"]
        Gateway["Gateway<br/>triggers + queries"]
        BTC["Business Transaction Coordinator<br/>DAG of entity triggers"]
        Charts["Entity Statecharts<br/>Trip, Supply, jobs"]
        ORM["ORM layer<br/>transaction + relationship abstraction"]
        Spanner[("Spanner<br/>cross-row + cross-table transaction")]
        LATE[("LATE action table")]
        Workers["LATE workers<br/>post-commit actions + timers"]
        Gateway --> BTC --> Charts --> ORM --> Spanner
        ORM --> LATE --> Workers
    end

    Previous -. "consistency and extensibility pressure" .-> New
```

## 3. Transactional Trigger And Durable Side Effects

The new programming model lets a trigger coordinate entity transitions inside one read-write transaction. Side effects that should run after commit, such as notifications or Kafka publication, need a durable handoff instead of being silently coupled to the transaction response path.

```mermaid
sequenceDiagram
    participant Caller as Client or Internal System
    participant Gateway as Fulfillment Gateway
    participant BTC as Business Transaction Coordinator
    participant Trip as Trip Statechart
    participant Supply as Supply Statechart
    participant ORM as ORM Layer
    participant DB as Spanner Transaction
    participant LATE as LATE Action Table
    participant Worker as LATE Worker
    participant SideEffect as Kafka / Notification / Timer

    Caller->>Gateway: Trigger business action
    Gateway->>BTC: Resolve DAG of entity triggers
    BTC->>Trip: Evaluate trigger and transition
    BTC->>Supply: Evaluate related trigger and transition
    Trip->>ORM: Entity update
    Supply->>ORM: Entity update
    ORM->>DB: Commit entity writes atomically
    ORM->>LATE: Commit post-commit actions with transaction
    DB-->>Gateway: Transaction result
    Gateway-->>Caller: Consistent business response
    Worker->>LATE: Scan pending actions
    Worker->>SideEffect: Execute at least once
```

## Technical Takeaways

- Start by drawing the business transaction boundary. If one user action mutates several lifecycle entities, generic microservice boxes hide the hardest part.
- State machines help make transitions explicit, but they need a transaction model when multiple entities must change together.
- A consistency upgrade changes the programming model too: write coordination, data abstraction, and extension points need to become platform concepts.
- Post-commit effects need a durable handoff if they matter after the transaction commits; "send an event after write" is not enough design detail.
- Storage selection is workload-specific. Uber selected Spanner around transactional consistency, horizontal scale, and operational overhead for fulfillment, not as a blanket answer for every Uber subsystem.

## Follow-Up Depth

- Add a storage topology page only when the design needs Uber-to-GCP network redundancy, multi-region Spanner placement, failover latency, or cost modeling.
- Keep H3, real-time mobile push, ETA, and pricing in separate packs. They solve different technical problems than fulfillment write correctness.

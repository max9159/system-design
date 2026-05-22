---
title: "Design Uber"
source: "Product system design topic index"
source_type: "product_system_design_topic_index"
published: "2026-05-22"
reference_urls:
  - "https://www.uber.com/blog/fulfillment-platform-rearchitecture/"
  - "https://www.uber.com/blog/building-ubers-fulfillment-platform/"
  - "https://www.uber.com/us/en/blog/ubers-next-gen-push-platform-on-grpc/"
  - "https://www.uber.com/blog/h3/"
system_design_category: "ride_hailing_marketplace"
tags:
  - "system-design"
  - "popular-product-topic"
  - "uber"
  - "ride-hailing"
  - "trip-lifecycle"
  - "location"
  - "matching"
---

# Design Uber

## Why this topic

Uber is a canonical real-time marketplace design topic. It combines rider intent, driver supply, matching, location updates, trip state machines, ETA and pricing dependencies, payment edges, and live mobile updates.

## Product scope

- Rider, driver, vehicle, trip, supply session, offer, location update, route, ETA, fare, and payment entities.
- Request ride, match driver, accept offer, pickup, in-trip, dropoff, cancellation, and receipt flows.
- Nearby supply lookup, geospatial indexing, live location updates, and mobile event push.
- Multi-region correctness and ongoing-trip durability.

## Official source map

- [Uber's Fulfillment Platform: Ground-up Re-architecture to Accelerate Uber's Go/Get Strategy](https://www.uber.com/blog/fulfillment-platform-rearchitecture/) - Trip and Supply domain model, lifecycle orchestration, statecharts, pods, and migration concerns.
- [Building Uber's Fulfillment Platform for Planet-Scale using Google Cloud Spanner](https://www.uber.com/blog/building-ubers-fulfillment-platform/) - transactional consistency and global storage choices for fulfillment.
- [Uber's Next Gen Push Platform on gRPC](https://www.uber.com/us/en/blog/ubers-next-gen-push-platform-on-grpc/) - mobile real-time delivery transport.
- [H3: Uber's Hexagonal Hierarchical Spatial Index](https://www.uber.com/blog/h3/) - geospatial indexing for dispatch, pricing, and marketplace analysis; this official Uber source is from 2018 and is included because H3 is directly relevant to the canonical ride-hailing topic.

## Reuse from this survey

- [Uber's Next Gen Push Platform on gRPC](uber-realtime-push-platform.md) already extracts real-time delivery diagram hints.

## Focus for later analysis

- Model the trip lifecycle state machine before layering pricing, ETA, or payment.
- Separate high-frequency location events from transactional trip state updates.
- Distinguish geospatial candidate lookup from final matching and offer acceptance.

## Diagram candidates

- Ride request through nearby driver candidate lookup, offer, acceptance, and trip start.
- Trip and supply lifecycle statecharts with cancellation and dropoff branches.
- Live driver location update and rider app push path.

## Coverage gaps

- H3 is older than the preferred post-2020 date filter but remains a direct official geospatial reference.
- The source map covers fulfillment and live updates better than the full pricing and ETA stack.

---
title: "Uber's Next Gen Push Platform on gRPC"
source: "Uber"
source_type: "official_company_engineering_blog"
published: "2022-08-16"
authors:
  - "Anirudh Raja"
  - "Shivani Bhatia"
  - "Shahbaz Kaladiya"
reference_url: "https://www.uber.com/us/en/blog/ubers-next-gen-push-platform-on-grpc/"
system_design_category: "real_time_push_delivery"
tags:
  - "system-design"
  - "realtime"
  - "push-platform"
  - "grpc"
  - "streaming"
  - "mobile"
  - "acknowledgement"
---

# Uber's Next Gen Push Platform on gRPC

## Why this source

Uber documents a real-time push platform protocol change from SSE to bidirectional streaming. It exposes connection management, acknowledgements, persistent mobile connections, topology components, and reliability tradeoffs.

## Focus for later analysis

- Compare the SSE path and gRPC bidirectional stream path.
- Capture message delivery, heartbeat, acknowledgement, and resend concerns.
- Keep client-side connection behavior and server-side sharding or storage responsibilities separate.

## Diagram candidates

- Mobile push delivery sequence with stream setup, message, heartbeat, and acknowledgement.
- Protocol migration comparison between SSE and gRPC.
- RAMEN backend component diagram for message delivery.

## Reference

- [Original article](https://www.uber.com/us/en/blog/ubers-next-gen-push-platform-on-grpc/)

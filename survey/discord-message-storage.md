---
title: "How Discord Stores Trillions of Messages"
source: "Discord"
source_type: "official_company_engineering_blog"
published: "2023-03-06"
authors:
  - "Bo Ingram"
reference_url: "https://discord.com/blog/how-discord-stores-trillions-of-messages"
system_design_category: "instant_message_storage"
tags:
  - "system-design"
  - "instant-messaging"
  - "message-storage"
  - "database-migration"
  - "request-coalescing"
  - "cassandra"
  - "scylladb"
---

# How Discord Stores Trillions of Messages

## Why this source

This is a production-scale message storage case study from Discord. It covers a real migration path, read hot spots, request coalescing, consistent routing, and no-downtime movement of a very large message dataset.

## Focus for later analysis

- Separate the API, data service, and database responsibilities in the read path.
- Capture how hot partitions appear in a channel-based access pattern.
- Compare the old Cassandra topology with the ScyllaDB target topology and the migration flow.

## Diagram candidates

- Message read flow with request coalescing and consistent hash routing.
- Dual-write and bulk migration flow for moving historical messages.
- Failure or load path for a hot channel read spike.

## Reference

- [Original article](https://discord.com/blog/how-discord-stores-trillions-of-messages)

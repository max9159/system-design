---
title: "Making multiplayer more reliable"
source: "Figma"
source_type: "official_company_engineering_blog"
published: "2022-10-20"
authors:
  - "Darren Tsung"
reference_url: "https://www.figma.com/blog/making-multiplayer-more-reliable/"
system_design_category: "real_time_collaborative_editing"
tags:
  - "system-design"
  - "collaborative-editing"
  - "websocket"
  - "write-ahead-log"
  - "checkpointing"
  - "durability"
  - "dynamodb"
---

# Making multiplayer more reliable

## Why this source

This Figma article explains how an authoritative real-time multiplayer service improves durability with a journal while keeping the existing checkpoint model. The tradeoffs are useful for collaborative editor and shared-state designs.

## Focus for later analysis

- Model the WebSocket update path through the in-memory multiplayer service.
- Contrast periodic checkpoints with an append-oriented change journal.
- Track recovery, ownership locking, and deployment behavior when multiplayer instances close files.

## Diagram candidates

- Edit propagation from clients to multiplayer, journal, checkpoints, and storage.
- Crash recovery flow from checkpoint plus journal entries.
- File ownership lock and conflicting writer prevention.

## Reference

- [Original article](https://www.figma.com/blog/making-multiplayer-more-reliable/)

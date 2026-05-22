---
title: "Design WhatsApp"
source: "Product system design topic index"
source_type: "product_system_design_topic_index"
published: "2026-05-22"
reference_urls:
  - "https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/"
  - "https://engineering.fb.com/2021/09/10/security/whatsapp-e2ee-backups/"
  - "https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/"
  - "https://engineering.fb.com/2023/11/08/security/whatsapp-calls-enhancing-security/"
system_design_category: "encrypted_messaging_platform"
tags:
  - "system-design"
  - "popular-product-topic"
  - "whatsapp"
  - "instant-messaging"
  - "multi-device"
  - "end-to-end-encryption"
  - "voice-video-calls"
---

# Design WhatsApp

## Why this topic

WhatsApp is a strong messaging topic because it forces delivery, fanout, offline or multi-device sync, end-to-end encryption, group semantics, backup, and call signaling tradeoffs into one product.

## Product scope

- User identity, device identity, contacts, chats, groups, messages, media attachments, delivery receipts, and presence signals.
- One-to-one messages, group messages, offline delivery, push notification, and client synchronization.
- Device linking, key verification, encrypted backups, voice calls, and video calls.
- Abuse controls and metadata minimization boundaries.

## Official source map

- [How WhatsApp enables multi-device capability](https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/) - standalone companion devices, device identity mapping, client fanout, calls, and encrypted history sync.
- [How WhatsApp is enabling end-to-end encrypted backups](https://engineering.fb.com/2021/09/10/security/whatsapp-e2ee-backups/) - encrypted backup key handling and backup restore considerations.
- [Deploying key transparency at WhatsApp](https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/) - public key lookup integrity and automatic verification.
- [Enhancing the security of WhatsApp calls](https://engineering.fb.com/2023/11/08/security/whatsapp-calls-enhancing-security/) - call relay and call-flow privacy controls.

## Reuse from this survey

- [How Discord Stores Trillions of Messages](discord-message-storage.md) is a useful contrast source for server-side message storage and hot-channel database behavior.

## Focus for later analysis

- Start with a one-to-one send flow, then extend it to multi-device fanout and group messaging.
- Keep encryption-key management separate from transport delivery and push notification.
- Treat backup and newly linked device history sync as separate recovery paths.

## Diagram candidates

- Multi-device one-to-one send with device list lookup and per-device encryption.
- Group message and sender-key flow boundary.
- Device linking, recent history transfer, and encrypted backup restore flow.

## Coverage gaps

- Official public sources emphasize privacy, multi-device behavior, and calls more than server storage internals.
- Avoid copying Discord storage assumptions into WhatsApp without labeling them as comparison material.

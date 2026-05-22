---
title: "FOQS: Scaling a distributed priority queue"
source: "Meta"
source_type: "official_company_engineering_blog"
published: "2021-02-22"
authors:
  - "Akshay Nanavati"
  - "Girish Joshi"
reference_url: "https://engineering.fb.com/2021/02/22/production-engineering/foqs-scaling-a-distributed-priority-queue/"
system_design_category: "distributed_priority_queue"
tags:
  - "system-design"
  - "queue"
  - "priority-queue"
  - "async-processing"
  - "multi-tenant"
  - "persistent-queue"
  - "mysql"
---

# FOQS: Scaling a distributed priority queue

## Why this source

FOQS is a focused queue-system article from Meta. It is useful for asynchronous work orchestration, delayed delivery, priority handling, producer and consumer contracts, and multi-tenant scaling.

## Focus for later analysis

- Extract queue semantics for enqueue, dequeue, ack, nack, priority, delay, and redelivery.
- Track the role of topics and consumers in work discovery.
- Separate logical queue guarantees from storage and sharding choices.

## Diagram candidates

- Producer and consumer lifecycle for a queue item.
- Priority and delayed redelivery sequence.
- Multi-tenant queue topology over persistent storage shards.

## Reference

- [Original article](https://engineering.fb.com/2021/02/22/production-engineering/foqs-scaling-a-distributed-priority-queue/)

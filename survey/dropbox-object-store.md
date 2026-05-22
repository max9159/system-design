---
title: "Everything in its write place: Cloud storage abstraction with Object Store"
source: "Dropbox"
source_type: "official_company_engineering_blog"
published: "2022-10-11"
authors:
  - "Lawrence Xing"
reference_url: "https://dropbox.tech/infrastructure/abstracting-cloud-storage-backends-with-object-store"
system_design_category: "object_storage_abstraction"
tags:
  - "system-design"
  - "object-storage"
  - "storage-abstraction"
  - "blob-storage"
  - "batching"
  - "encryption"
  - "metadata"
---

# Everything in its write place: Cloud storage abstraction with Object Store

## Why this source

Dropbox explains how a storage abstraction layer routes object traffic across backing stores while adding batching, placement metadata, encryption, deletion handling, and chunking. It is useful for storage platform diagrams.

## Focus for later analysis

- Split object API behavior from the physical backing stores.
- Track the MySQL metadata needed to map client object keys to batched or chunked data.
- Compare PUT batching, GET slicing, DELETE compaction, and large-object chunking paths.

## Diagram candidates

- PUT path from object API to metadata and selected backend.
- GET path from object lookup to ranged backend read and slice reconstruction.
- Batch and chunk layout for small and large objects.

## Reference

- [Original article](https://dropbox.tech/infrastructure/abstracting-cloud-storage-backends-with-object-store)

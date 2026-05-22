---
title: "Cloudflare Images Now Available to Everyone"
source: "Cloudflare"
source_type: "official_company_engineering_blog"
published: "2021-09-15"
authors:
  - "Zaid Farooqui"
reference_url: "https://blog.cloudflare.com/announcing-cloudflare-images/"
system_design_category: "image_storage_optimization_delivery"
tags:
  - "system-design"
  - "image-pipeline"
  - "cdn"
  - "object-storage"
  - "image-resizing"
  - "signed-url"
  - "media-delivery"
---

# Cloudflare Images Now Available to Everyone

## Why this source

This article frames a media system as upload, storage, variant generation, optimization, access control, and delivery. It is a compact official source for image pipeline design.

## Focus for later analysis

- Compare precomputed variants with a stored-image plus variant model.
- Capture direct creator upload and signed URL access control concerns.
- Separate image storage, transformation, format selection, and CDN delivery responsibilities.

## Diagram candidates

- Client upload path using a one-time direct upload URL.
- Variant rendering and optimized delivery path.
- Private image delivery path with signed URL issuance.

## Reference

- [Original article](https://blog.cloudflare.com/announcing-cloudflare-images/)

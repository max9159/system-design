---
title: "Design Instagram"
source: "Product system design topic index"
source_type: "product_system_design_topic_index"
published: "2026-05-22"
reference_urls:
  - "https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/"
  - "https://engineering.fb.com/2025/05/21/production-engineering/journey-to-1000-models-scaling-instagrams-recommendation-system/"
  - "https://engineering.fb.com/2022/11/04/video-engineering/instagram-video-processing-encoding-reduction/"
  - "https://engineering.fb.com/2023/02/21/video-engineering/av1-codec-facebook-instagram-reels/"
system_design_category: "social_photo_video_platform"
tags:
  - "system-design"
  - "popular-product-topic"
  - "instagram"
  - "social-feed"
  - "media-upload"
  - "recommendation"
  - "reels"
---

# Design Instagram

## Why this topic

Instagram is a common product-level system design target because it combines social graph reads, feed ranking, image and video upload, media delivery, engagement writes, notifications, and short-video recommendation.

## Product scope

- User, profile, follow graph, post, comment, like, story, and reel entities.
- Image and video upload, metadata persistence, transcoding, thumbnails, object storage, and CDN delivery.
- Home feed for followed accounts plus Explore and Reels discovery surfaces.
- Engagement counters, fanout or ranking paths, moderation hooks, and notifications.

## Official source map

- [Scaling the Instagram Explore recommendations system](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/) - multi-stage recommendation flow for Explore retrieval and ranking.
- [Journey to 1000 models: Scaling Instagram's recommendation system](https://engineering.fb.com/2025/05/21/production-engineering/journey-to-1000-models-scaling-instagrams-recommendation-system/) - ranking funnel, model registry, release flow, and model health across Feed, Stories, and Reels.
- [Reducing Instagram's basic video compute time by 94 percent](https://engineering.fb.com/2022/11/04/video-engineering/instagram-video-processing-encoding-reduction/) - uploaded video processing cost and encoding decisions.
- [How Meta brought AV1 to Reels](https://engineering.fb.com/2023/02/21/video-engineering/av1-codec-facebook-instagram-reels/) - adaptive bitrate encoding and delivery for Reels.

## Reuse from this survey

- [Cloudflare Images Now Available to Everyone](cloudflare-images-pipeline.md) for generic image upload, variant, signing, and CDN concerns when Instagram-specific image architecture is not available.

## Focus for later analysis

- Draw the write path separately from the Home feed and discovery read paths.
- Treat followed-feed ranking and recommendation surfaces as different retrieval problems.
- Keep media bytes, post metadata, social graph edges, and engagement events in different storage domains.

## Diagram candidates

- Post upload path from client to metadata write, media processing, object storage, and CDN.
- Home feed path with candidate sourcing, ranking, cache, and pagination.
- Explore or Reels recommendation funnel with retrieval, early ranking, late ranking, and media playback.

## Coverage gaps

- The official sources above do not expose a complete Instagram Home feed fanout architecture.
- Use the source map as verified subsystem evidence and mark any full-product feed assumptions explicitly.

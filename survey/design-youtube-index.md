---
title: "Design YouTube"
source: "Product system design topic index"
source_type: "product_system_design_topic_index"
published: "2026-05-22"
reference_urls:
  - "https://cloud.google.com/blog/products/databases/youtube-runs-on-bigtable"
  - "https://cloud.google.com/blog/products/networking/live-streaming-with-media-cdn-and-google-cloud-load-balancer"
  - "https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/"
  - "https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/"
system_design_category: "video_sharing_streaming_platform"
tags:
  - "system-design"
  - "popular-product-topic"
  - "youtube"
  - "video-upload"
  - "transcoding"
  - "cdn"
  - "recommendation"
---

# Design YouTube

## Why this topic

YouTube is a high-value video platform topic because its design spans user-generated uploads, video processing, metadata and analytics, search and recommendation, view events, and global playback delivery.

## Product scope

- Video, channel, playlist, comment, like, subscription, view event, and ad or monetization metadata.
- Upload, virus or policy checks, transcoding, packaging, thumbnails, storage, and playback manifests.
- Home, watch-next, search, subscription feed, and recommendation surfaces.
- View count and analytics ingestion with privacy and deletion behavior.

## Official source map

- [How YouTube uses Bigtable to power one of the world's largest streaming services](https://cloud.google.com/blog/products/databases/youtube-runs-on-bigtable) - YouTube data warehouse stages and Bigtable-backed metadata consumption.
- [Live streaming with Media CDN and Google Cloud Load Balancer](https://cloud.google.com/blog/products/networking/live-streaming-with-media-cdn-and-google-cloud-load-balancer) - Google states Media CDN uses YouTube infrastructure for video delivery close to users.
- [On YouTube's recommendation system](https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/) - product signals and recommendation quality concerns.
- [Deep Neural Networks for YouTube Recommendations](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/) - candidate generation and ranking model split; this official Google research source is from 2016 and is included because it is still a direct YouTube architecture reference.

## Focus for later analysis

- Separate video ingestion and transcoding from read-heavy playback delivery.
- Keep operational metadata, analytics warehouse data, and recommendation features distinct.
- Decide whether the first design diagram targets video-on-demand upload/playback or live streaming.

## Diagram candidates

- Creator upload to processing queue, transcoding workers, packaged outputs, metadata, and CDN.
- Viewer playback path from watch page metadata to manifest and media segments.
- Recommendation path with candidate generation, ranking, watch history signals, and policy filters.

## Coverage gaps

- Recent official public sources expose YouTube analytics and delivery slices more clearly than a complete upload-to-playback architecture.
- The 2016 recommendation paper violates the preferred post-2020 date filter, so keep it tagged as a classic reference.

---
title: "Foundation Model for Personalized Recommendation"
source: "Netflix"
source_type: "official_company_engineering_blog"
published: "2025-03-21"
authors:
  - "Ko-Jen Hsiao"
  - "Yesu Feng"
  - "Sudarshan Lamkhede"
reference_url: "https://netflixtechblog.com/foundation-model-for-personalized-recommendation-1a0bd8e02d39"
system_design_category: "personalized_recommendation_system"
tags:
  - "system-design"
  - "recommendation"
  - "personalization"
  - "foundation-model"
  - "embeddings"
  - "batch-processing"
  - "online-serving"
---

# Foundation Model for Personalized Recommendation

## Why this source

Netflix describes a recommender-system direction that centralizes preference learning for multiple downstream use cases. It is useful for system designs that combine large-scale interaction data, offline training, embeddings, and latency-sensitive online consumers.

## Focus for later analysis

- Split interaction tokenization, model training, embedding production, and downstream serving.
- Track cold-start support and how metadata complements learned identifiers.
- Identify which recommendation consumers need direct predictions versus reusable embeddings.

## Diagram candidates

- Offline training and embedding publication pipeline.
- Online recommendation path using shared preference representations.
- Cold-start title path using metadata and incremental model updates.

## Reference

- [Original article](https://netflixtechblog.com/foundation-model-for-personalized-recommendation-1a0bd8e02d39)

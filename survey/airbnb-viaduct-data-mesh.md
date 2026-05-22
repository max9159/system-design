---
title: "Viaduct, Five Years On: Modernizing the Data-Oriented Service Mesh"
source: "Airbnb"
source_type: "official_company_engineering_blog"
published: "2025-09-17"
authors:
  - "Adam Miskiewicz"
  - "Raymie Stata"
reference_url: "https://airbnb.tech/infrastructure/viaduct-five-years-on-modernizing-the-data-oriented-service-mesh/"
system_design_category: "graphql_data_oriented_service_mesh"
tags:
  - "system-design"
  - "graphql"
  - "data-mesh"
  - "service-mesh"
  - "tenant-modules"
  - "api-composition"
  - "migration"
---

# Viaduct, Five Years On: Modernizing the Data-Oriented Service Mesh

## Why this source

Airbnb's Viaduct article covers a central schema, hosted business logic, re-entrant composition, tenant modules, and gradual migration between APIs. It is a useful source for GraphQL aggregation and service-boundary designs.

## Focus for later analysis

- Separate the GraphQL execution engine, tenant API, hosted application code, and owned data sources.
- Capture how tenant modules compose through queries instead of direct code dependencies.
- Model gradual migration with old and modern APIs sharing the new engine.

## Diagram candidates

- Request path from client query through central schema and tenant resolvers.
- Tenant module composition across domain teams.
- Classic and Modern tenant APIs over a shared execution engine.

## Reference

- [Original article](https://airbnb.tech/infrastructure/viaduct-five-years-on-modernizing-the-data-oriented-service-mesh/)

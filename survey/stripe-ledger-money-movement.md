---
title: "Ledger: Stripe's system for tracking and validating money movement"
source: "Stripe"
source_type: "official_company_engineering_blog"
published: "2024-02-16"
authors:
  - "Ilya Ganelin"
reference_url: "https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement"
system_design_category: "payment_ledger"
tags:
  - "system-design"
  - "payments"
  - "ledger"
  - "money-movement"
  - "immutability"
  - "state-machine"
  - "data-quality"
---

# Ledger: Stripe's system for tracking and validating money movement

## Why this source

Stripe describes a system that validates money movement across multiple producer systems. The article is useful for ledger, auditability, correctness, and payment lifecycle diagrams.

## Focus for later analysis

- Represent upstream payment systems as fund-flow producers and Ledger as a common semantic model.
- Track immutable transactions, account states, balances, and data completeness checks.
- Distinguish operational payment processing from validation and monitoring views.

## Diagram candidates

- Payment event lifecycle translated into Ledger state transitions.
- Fund flow crossing multiple producer systems with Ledger validation.
- Data quality alert path from ledger metrics back to owning teams.

## Reference

- [Original article](https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement)

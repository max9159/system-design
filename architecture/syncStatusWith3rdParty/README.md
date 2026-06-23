# Sync Status with 3rd Party <!-- omit from toc -->
- [📊 State Diagram - Notification Status Flow](#-state-diagram---notification-status-flow)
- [🔁 Sequence Diagram - Popup Notification (Send Process)](#-sequence-diagram---popup-notification-send-process)
- [🔁 Sequence Diagram - Popup Notification (Display Handling by Self)](#-sequence-diagram---popup-notification-display-handling-by-self)
- [🔁 Sequence Diagram - Popup Notification (Read Process)](#-sequence-diagram---popup-notification-read-process)
- [📊 Database Schema - PortalNotification System](#-database-schema---portalnotification-system)

### Overview
> This document describes the system design for syncing the status of a notification with a 3rd party.
> Using `state diagram`, `sequence diagram`, and `database schema` with `mermaid` to describe the system design.


### 📊 State Diagram - Notification Status Flow
```mermaid
stateDiagram-v2
    [*] --> New
    New --> Notified3rd_Party_New: Send notifRef,<br/>notifStatus=New, <br/>customerCode, notifMsgCode
    Notified3rd_Party_New --> Sent
    Sent --> Read
    Read --> Notified3rd_Party: Send notifRef,<br/>notifStatus=Read
    
    New: (New) Initial state when notification is created
    New: Created by Notify Integration API
    
    Notified3rd_Party_New: 3rd_Party API notified about New status
    Notified3rd_Party_New: Send from Notify Integration API

    Sent: (Sent) 3rd_Party API has received the notification
    Sent: Updated by Notify Integration API
    
    Read: (Read) User has viewed the notification
    Read: Updated by Portal_API
    
    Notified3rd_Party: 3rd_Party API notified about Read status
    Notified3rd_Party: Send from Notify
```


### 🔁 Sequence Diagram - Popup Notification (Send Process)
```mermaid
sequenceDiagram
    participant 3rd_Party_API as 3rd_Party API
    participant Notify_Int as Notify Consume Service
    participant Kafka as Kafka
    participant Notify_BG as Notify Integration API
    participant DB as Database
    
    Note over Notify_Int, DB: Company Service

    note over Notify_BG, DB: During transaction creation
    Notify_BG->>DB: Create notification status to "New"
    Notify_BG->>Kafka: Produce notification message
    
    Notify_Int->>Kafka: Listen to notification topic
    Kafka-->>Notify_Int: Consume notification message
    Notify_Int->>3rd_Party_API: Send notification API request
    note over 3rd_Party_API: Store the display state by itself. (e.g. Save to cache or database)
    3rd_Party_API-->>Notify_Int: Notification received
    Notify_Int->>DB: Update notification status to "Sent"
```
### 🔁 Sequence Diagram - Popup Notification (Display Handling by Self)
```mermaid	
sequenceDiagram
    participant Customer as Customer
    participant AP as 3rd_Party_Portal
    participant 3rd_Party_API as 3rd_Party_API

    Note over AP, 3rd_Party_API: 3rd Party Service
    Customer->>AP: Login
    AP->>3rd_Party_API: Request with customerCode
    note over 3rd_Party_API: The display state stored by itself. (e.g. Save to cache or database)
    3rd_Party_API-->>AP: Return notification flag
```


### 🔁 Sequence Diagram - Popup Notification (Read Process)
```mermaid
sequenceDiagram
    participant User as User
    participant AP_Crypto_Web as AP_Crypto_Web
    participant Portal_API as Portal_API
    participant DB as Database 
    participant Kafka as Kafka
    participant Notify_Int as Notify Consume Service
    participant 3rd_Party_API as 3rd_Party API
    
    note over 3rd_Party_API: 3rd Party Service
    note over AP_Crypto_Web, Kafka: Company Service
    User->>AP_Crypto_Web: Enter Txn Detail Page
    AP_Crypto_Web->>Portal_API: Invoke /api/txn/details
    Portal_API->>DB: Update notification status to "Read"
    Portal_API->>Kafka: Produce notification read message
    Notify_Int->>Kafka: Listen to notification topic
    Kafka-->>Notify_Int: Consume notification read message
    Notify_Int->>3rd_Party_API: Send notification read API request
    3rd_Party_API-->>Notify_Int: Notification read received
```

### 📊 Database Schema - PortalNotification System
```mermaid
erDiagram
    PortalNotification {
        string notifRef PK "Unique identifier"
        enum notifStatus "New, Sent, Read"
        string notifMsgCode "Message code reference. e.g. DPTX0001: You have a pending transaction."
        string CustomerCode "Associated CustomerCode"
        string TxnRef "Associated 3rd_Party txn reference"
        timestamp dateCreated "Creation timestamp"
        timestamp dateUpdated "Last update timestamp"
        timestamp sentAt "When notification was sent to notification manager(3rd_Party)"
        timestamp readAt "When notification was read by customer"
    }
    
    PortalNotificationLog {
        string id PK "Log identifier"
        string notifRef FK "Reference to notification"
        enum oldStatus "Previous notification status"
        enum newStatus "New notification status"
        timestamp changedAt "When status changed"
    }
  
    PortalNotification ||--o{ PortalNotificationLog : "has"
```
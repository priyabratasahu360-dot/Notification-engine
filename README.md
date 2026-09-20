# Notification Engine

```mermaid
graph TD;
    EVENT[Event Producers] --> ChatApp[Chat App];
    EVENT[Event Producers] --> PaymentApp[Payment App];
    EVENT[Event Producers] --> NotesApp[Notes App];
    ChatApp[Chat App] --> EventIngestion[Event Ingestion];
    PaymentApp[Payment App] --> EventIngestion[Event Ingestion];
    NotesApp[Notes App] --> EventIngestion[Event Ingestion];
    EventIngestion[Event Ingestion] --> Validator[Event Validator];
    Validator[Event Validator] --> Deduplication;
    Deduplication --> Processor[Event Processor]
    Processor[Event Processor] --> DecisionEngine[Notification Decision Engine]
    DecisionEngine[Notification Decision Engine] --> Email
    DecisionEngine[Notification Decision Engine] --> SMS
    DecisionEngine[Notification Decision Engine] --> In-App
    Email --> User
    SMS --> User
    In-App --> User
```


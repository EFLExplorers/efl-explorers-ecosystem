# Landing Page ERD

```mermaid
erDiagram
  USER ||--o{ ACCOUNT : has
  USER ||--o{ SESSION : has
  USER ||--o{ PASSWORD_RESET_TOKEN : has
  USER ||--o{ SSO_TOKEN : has

  PAGE ||--o{ PAGE_SECTION : contains
  PAGE ||--o{ CONTENT_ITEM : contains
  PAGE ||--o{ ROUTE_SECTION : defines

  CONTENT_ITEM ||--o{ CONTENT_RELATIONSHIP : parent
  CONTENT_ITEM ||--o{ CONTENT_RELATIONSHIP : child
```

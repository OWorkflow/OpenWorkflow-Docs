---
id: workflow-logic-nodes
title: Workflow Logic Nodes
sidebar_label: Workflow Logic Nodes
description: Workflow Logic Nodes specification
---
# Workflow Logic Nodes Specification

**Version:** 0.1.0
**Status:** Draft

## Overview

Logic nodes are first-class workflow step types that enable control flow, branching, iteration, error handling, and data transformation without requiring external connectors or agents. They are semantically minimal, portable across execution backends, and designed for day-1 availability.

### Design Principles

**Determinism:** Given the same inputs and state, logic nodes must produce the same routing decisions. Implementations should avoid non-deterministic behavior (randomness, timestamps in conditions) unless explicitly required.

**Observability:** All logic node executions emit span attributes for tracing:
- `node.type` — The logic node type (if, switch, forEach, etc.)
- `node.id` — The unique node identifier
- `node.branch` — The branch taken (for if/switch)
- `node.iterations` — Number of iterations (for forEach)
- `node.join_strategy` — Join semantics (for parallel)

## Node Types

OpenWorkflow workflows support 8 core logic node types:

1. **If / Condition** - Conditional branching based on expression evaluation
2. **Switch / Route** - Multi-way branching based on value matching
3. **For-Each / Loop** - Iterate over arrays with subgraph execution
4. **Parallel / Map** - Fan-out to multiple branches with join semantics
5. **Wait / Delay / Until** - Pause execution for duration or event
6. **Try / Catch / Retry** - Error handling with retry policies
7. **Transform** - Pure data transformation without side effects
8. **Handoff** - Agent switching at workflow level

## 1. If / Condition Node

Evaluate an expression and route to true or false branches.

### Schema

```yaml
nodes:
  - id: check_temperature
    type: if
    condition: "{{ nodes.fetch_weather.output.temperature > 30 }}"
    then:
      - id: send_heat_alert
        type: action
        connector: connector:community/slack@1.2.0
        action: sendMessage
        with:
          channel: "#alerts"
          text: "High temperature alert: {{ nodes.fetch_weather.output.temperature }}°C"
    else:
      - id: log_normal
        type: action
        connector: connector:community/logging@1.0.0
        action: info
        with:
          message: "Temperature is normal"
```

### Fields

```typescript
{
  "id": string,                    // Required: unique node ID
  "type": "if",                    // Required
  "condition": string,             // Required: expression to evaluate
  "then": Node[],                  // Required: nodes to execute if true
  "else": Node[]                   // Optional: nodes to execute if false
}
```

### Expression Syntax

Conditions support:
- Comparisons: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Logical: `&&`, `||`, `!`
- Template references: `{{ nodes.node_id.output.field }}`
- Functions: `length()`, `contains()`, `startsWith()`, `endsWith()`

**Examples:**
```yaml
# Simple comparison
condition: "{{ nodes.check_user.output.age >= 18 }}"

# Logical operators
condition: "{{ nodes.check_balance.output.amount > 100 && nodes.check_status.output.active }}"

# String matching
condition: "{{ nodes.classify.output.category == 'urgent' }}"

# Array length
condition: "{{ nodes.fetch_results.output.items | length > 0 }}"

# Contains check
condition: "{{ nodes.get_tags.output | contains('priority') }}"
```

### Output

If node produces:
```json
{
  "branch": "then" | "else",
  "conditionResult": true | false
}
```

## 2. Switch / Route Node

Match a value against multiple cases and route to the corresponding branch.

### Schema

```yaml
nodes:
  - id: route_by_priority
    type: switch
    value: "{{ nodes.classify_ticket.output.priority }}"
    cases:
      high:
        - id: notify_oncall
          type: action
          connector: connector:community/pagerduty@1.0.0
          action: createIncident
      medium:
        - id: create_ticket
          type: action
          connector: connector:community/jira@2.0.0
          action: createIssue
      low:
        - id: queue_for_review
          type: action
          connector: connector:community/queue@1.0.0
          action: enqueue
    default:
      - id: log_unknown
        type: action
        connector: connector:community/logging@1.0.0
        action: warn
```

### Fields

```typescript
{
  "id": string,
  "type": "switch",
  "value": string,                 // Required: value or expression to match
  "cases": {                       // Required: case-to-nodes mapping
    [key: string]: Node[]
  },
  "default": Node[]                // Optional: default case
}
```

### Output

```json
{
  "case": "high" | "medium" | "low" | "default",
  "matchedValue": "..."
}
```

## 3. For-Each / Loop Node

Iterate over an array and execute a subgraph for each item.

### Schema

```yaml
nodes:
  - id: process_users
    type: forEach
    items: "{{ nodes.fetch_users.output.users }}"
    maxConcurrency: 5
    ordered: false
    node:
      - id: send_welcome_email
        type: action
        connector: connector:community/sendgrid@1.0.0
        action: sendEmail
        with:
          to: "{{ item.email }}"
          template: "welcome"
      - id: create_profile
        type: action
        connector: connector:community/database@1.0.0
        action: insert
        with:
          table: "profiles"
          data: "{{ item }}"
```

### Fields

```typescript
{
  "id": string,
  "type": "forEach",
  "items": string,                 // Required: array expression
  "maxConcurrency": number,        // Optional: max parallel executions, default unlimited
  "ordered": boolean,              // Optional: preserve order, default false
  "continueOnError": boolean,      // Optional: continue if item fails, default false
  "node": Node[]                   // Required: subgraph to execute per item
}
```

### Item Context

Inside the loop, access the current item:
```yaml
with:
  value: "{{ item }}"              # Current item
  index: "{{ index }}"             # Current index (0-based)
  isFirst: "{{ isFirst }}"         # Boolean: first iteration
  isLast: "{{ isLast }}"           # Boolean: last iteration
```

### Output

```json
{
  "results": [                     // Array of results (if ordered: true)
    {"status": "success", "output": {...}},
    {"status": "error", "error": "..."}
  ],
  "successCount": 8,
  "errorCount": 2,
  "totalCount": 10
}
```

## 4. Parallel / Map Node

Execute multiple branches concurrently and join results.

### Schema

```yaml
nodes:
  - id: gather_data
    type: parallel
    join: all                      # all | any | count(n)
    timeout: 60
    branches:
      weather:
        - id: fetch_weather
          type: action
          connector: connector:community/weather@1.0.0
          action: getCurrentWeather
      news:
        - id: fetch_news
          type: action
          connector: connector:community/news@1.0.0
          action: getHeadlines
      stocks:
        - id: fetch_stocks
          type: action
          connector: connector:community/finance@1.0.0
          action: getQuotes
```

### Fields

```typescript
{
  "id": string,
  "type": "parallel",
  "join": "all" | "any" | {"count": number},  // Required: join strategy
  "timeout": number,               // Optional: max wait time in seconds
  "continueOnError": boolean,      // Optional: don't fail if one branch errors
  "branches": {                    // Required: named branches
    [name: string]: Node[]
  }
}
```

### Join Strategies

- **all**: Wait for all branches to complete (default)
- **any**: Return as soon as any branch completes
- **count(n)**: Return when N branches complete

### Output

```json
{
  "branches": {
    "weather": {"status": "success", "output": {...}},
    "news": {"status": "success", "output": {...}},
    "stocks": {"status": "error", "error": "..."}
  },
  "completedCount": 2,
  "errorCount": 1,
  "joinStrategy": "all"
}
```

## 5. Wait / Delay / Until Node

Pause execution for a duration or until an event occurs.

### Schema

**Duration-based wait:**
```yaml
nodes:
  - id: wait_before_retry
    type: wait
    duration: 30s                  # 30 seconds
```

**Event-based wait:**
```yaml
nodes:
  - id: wait_for_approval
    type: wait
    until:
      event: "approval.received"
      timeout: 86400               # 24 hours
      channel: "webhook"
```

**Scheduled wait:**
```yaml
nodes:
  - id: wait_until_time
    type: wait
    until:
      time: "2025-10-08T09:00:00Z"
```

### Fields

```typescript
{
  "id": string,
  "type": "wait",

  // Option 1: Duration
  "duration": string,              // e.g., "5s", "10m", "1h", "2d"

  // Option 2: Until event
  "until": {
    "event": string,               // Event name to wait for
    "timeout": number,             // Max wait time in seconds
    "channel": "webhook" | "kafka" | "pubsub",
    "filter": object               // Optional: event filter
  },

  // Option 3: Until timestamp
  "until": {
    "time": string                 // ISO 8601 timestamp
  }
}
```

### Output

```json
{
  "waitType": "duration" | "event" | "time",
  "waitedFor": 30,                 // seconds
  "eventReceived": {...},          // if event-based
  "timedOut": false
}
```

## 6. Try / Catch / Retry Node

Wrap a subgraph with error handling and retry logic.

### Schema

```yaml
nodes:
  - id: reliable_api_call
    type: try
    retry:
      maxAttempts: 3
      backoff: exponential
      backoffFactor: 2
      retryOn: ["timeout", "rate_limit"]
    node:
      - id: call_external_api
        type: action
        connector: connector:acme/external-api@1.0.0
        action: fetchData
    catch:
      - id: log_failure
        type: action
        connector: connector:community/logging@1.0.0
        action: error
        with:
          message: "API call failed: {{ error.message }}"
      - id: send_alert
        type: action
        connector: connector:community/slack@1.2.0
        action: sendMessage
        with:
          channel: "#ops"
          text: "External API failure"
```

### Fields

```typescript
{
  "id": string,
  "type": "try",
  "node": Node[],                  // Required: nodes to execute
  "retry": {                       // Optional: retry policy
    "maxAttempts": number,         // Max retry attempts
    "backoff": "fixed" | "linear" | "exponential",
    "backoffFactor": number,       // Multiplier for backoff
    "retryOn": string[]            // Error codes to retry on
  },
  "catch": Node[],                 // Optional: error handler nodes
  "finally": Node[]                // Optional: always execute
}
```

### Error Context

Inside `catch` and `finally` blocks:
```yaml
with:
  errorMessage: "{{ error.message }}"
  errorCode: "{{ error.code }}"
  errorDetails: "{{ error.details }}"
  attemptCount: "{{ error.attemptCount }}"
```

### Output

```json
{
  "status": "success" | "error",
  "attempts": 2,
  "output": {...},                 // if success
  "error": {...}                   // if error after all retries
}
```

## 7. Transform Node

Pure data transformation without side effects.

### Schema

```yaml
nodes:
  - id: format_response
    type: transform
    language: jq                   # jq | jsonpath | template | javascript
    expression: |
      {
        "summary": "\(.count) items found",
        "items": [.results[] | {id: .id, name: .name}],
        "total": (.results | length)
      }
```

**Template-based:**
```yaml
nodes:
  - id: build_message
    type: transform
    language: template
    expression: |
      Hello {{ nodes.fetch_user.output.name }},

      Your order #{{ nodes.create_order.output.id }} has been confirmed.
      Total: ${{ nodes.calculate_total.output.amount }}
```

**JavaScript sandbox:**
```yaml
nodes:
  - id: custom_transform
    type: transform
    language: javascript
    expression: |
      const input = context.nodes.fetch_data.output;
      return {
        processed: input.items.map(x => x.value * 2),
        count: input.items.length
      };
```

### Fields

```typescript
{
  "id": string,
  "type": "transform",
  "language": "jq" | "jsonpath" | "template" | "javascript" | "python",
  "expression": string,            // Required: transformation expression
  "timeout": number                // Optional: execution timeout
}
```

### Supported Languages

- **jq**: JSON query language (powerful, sandboxed)
- **jsonpath**: JSONPath expressions
- **template**: Template strings with `{{ }}` syntax
- **javascript**: Sandboxed JavaScript (limited APIs)
- **python**: Sandboxed Python (limited imports)

### Security

Sandboxed environments with:
- No file system access
- No network access
- Limited memory and CPU
- Timeout enforcement

### Output

```json
{
  "result": {...}                  // Transformed data
}
```

## 8. Handoff Node

Switch to a different agent and continue execution.

### Schema

```yaml
nodes:
  - id: escalate_to_human
    type: handoff
    agent: agent:openworkflow/human-support@1.0.0
    reason: "Customer requested human agent"
    context:
      conversationHistory: "{{ nodes.chat.output.history }}"
      userProfile: "{{ nodes.fetch_user.output }}"
    resumeAfter: true                # Continue workflow after handoff
```

**Agent selection by condition:**
```yaml
nodes:
  - id: intelligent_routing
    type: handoff
    selectAgent:
      - condition: "{{ nodes.classify.output.category == 'technical' }}"
        agent: agent:acme/technical-support@1.0.0
      - condition: "{{ nodes.classify.output.category == 'billing' }}"
        agent: agent:acme/billing-support@1.0.0
      - default: agent:acme/general-support@1.0.0
    context:
      ticket: "{{ nodes.create_ticket.output }}"
```

### Fields

```typescript
{
  "id": string,
  "type": "handoff",

  // Option 1: Direct agent reference
  "agent": string,                 // Agent ID

  // Option 2: Conditional selection
  "selectAgent": [
    {
      "condition": string,
      "agent": string
    }
  ],

  "reason": string,                // Optional: handoff reason
  "context": object,               // Optional: context to pass
  "resumeAfter": boolean,          // Optional: continue after handoff
  "timeout": number                // Optional: handoff timeout
}
```

### Output

```json
{
  "handoffTo": "agent:openworkflow/human-support@1.0.0",
  "reason": "Customer requested human agent",
  "agentResponse": {...},          // Response from new agent
  "conversationId": "conv_123"
}
```

## Complete Example: Order Processing Workflow

```yaml
workflows:
  - name: Order Processing Pipeline
    version: 1.0.0

    inputs:
      orderId:
        type: string
        required: true

    nodes:
      # 1. Try block with retry
      - id: fetch_order
        type: try
        retry:
          maxAttempts: 3
          backoff: exponential
        node:
          - id: get_order_details
            type: action
            connector: connector:acme/orders@1.0.0
            action: getOrder
            with:
              orderId: "{{ inputs.orderId }}"
        catch:
          - id: log_fetch_error
            type: action
            connector: connector:community/logging@1.0.0
            action: error

      # 2. Transform data
      - id: format_order
        type: transform
        language: jq
        expression: |
          {
            "id": .order_id,
            "items": [.line_items[] | {sku: .sku, qty: .quantity}],
            "total": .total_amount
          }

      # 3. Parallel processing
      - id: validate_and_process
        type: parallel
        join: all
        branches:
          inventory:
            - id: check_inventory
              type: action
              connector: connector:acme/inventory@1.0.0
              action: checkAvailability
          payment:
            - id: process_payment
              type: action
              connector: connector:acme/stripe@2.0.0
              action: capturePayment
          shipping:
            - id: calculate_shipping
              type: action
              connector: connector:acme/shippo@1.0.0
              action: getRates

      # 4. Conditional routing
      - id: check_inventory_status
        type: if
        condition: "{{ nodes.validate_and_process.branches.inventory.output.available }}"
        then:
          # 5. Loop through items
          - id: fulfill_items
            type: forEach
            items: "{{ nodes.format_order.result.items }}"
            maxConcurrency: 3
            node:
              - id: ship_item
                type: action
                connector: connector:acme/fulfillment@1.0.0
                action: shipItem
                with:
                  sku: "{{ item.sku }}"
                  quantity: "{{ item.qty }}"
        else:
          # 6. Switch routing by backorder policy
          - id: route_backorder
            type: switch
            value: "{{ nodes.fetch_order.output.backorderPolicy }}"
            cases:
              partial:
                - id: partial_fulfillment
                  type: action
                  connector: connector:acme/fulfillment@1.0.0
                  action: partialShip
              hold:
                - id: wait_for_stock
                  type: wait
                  duration: 7d
              cancel:
                - id: cancel_order
                  type: action
                  connector: connector:acme/orders@1.0.0
                  action: cancelOrder

      # 7. Wait for shipping confirmation
      - id: wait_for_shipment
        type: wait
        until:
          event: "shipment.confirmed"
          timeout: 86400
          channel: "webhook"

      # 8. Handoff for complex issues
      - id: check_if_escalation_needed
        type: if
        condition: "{{ nodes.wait_for_shipment.timedOut }}"
        then:
          - id: escalate_to_agent
            type: handoff
            agent: agent:acme/fulfillment-specialist@1.0.0
            reason: "Shipment delayed beyond SLA"
            context:
              order: "{{ nodes.fetch_order.output }}"
              shipmentStatus: "{{ nodes.wait_for_shipment.output }}"

    outputs:
      orderStatus:
        value: "{{ nodes.fulfill_items.output.status }}"
      trackingNumbers:
        value: "{{ nodes.fulfill_items.output.results }}"
```

## Best Practices

1. **Use If for simple branching**: Binary decisions
2. **Use Switch for multi-way routing**: Multiple distinct paths
3. **Limit loop concurrency**: Prevent resource exhaustion
4. **Set timeouts on waits**: Always have a timeout
5. **Retry idempotent operations only**: Ensure safe retries
6. **Transform close to data source**: Minimize data movement
7. **Handoff with full context**: Pass conversation history
8. **Error handling at boundaries**: Wrap external calls in try/catch

## Expression Language Reference

### Operators

- **Comparison**: `>`, `<`, `>=`, `&lt;=`, `==`, `!=`
- **Logical**: `&&`, `||`, `!`
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **String**: `+` (concatenation)

### Functions

- `length(array|string)`: Get length
- `contains(array|string, value)`: Check containment
- `startsWith(string, prefix)`: String starts with
- `endsWith(string, suffix)`: String ends with
- `upper(string)`: Convert to uppercase
- `lower(string)`: Convert to lowercase
- `trim(string)`: Remove whitespace
- `split(string, delimiter)`: Split string
- `join(array, delimiter)`: Join array
- `map(array, expression)`: Transform array
- `filter(array, condition)`: Filter array
- `sum(array)`: Sum numbers
- `avg(array)`: Average numbers
- `min(array)`: Minimum value
- `max(array)`: Maximum value

### Context Access

```yaml
{{ inputs.paramName }}                    # Workflow inputs
{{ steps.stepId.output.field }}           # Step outputs
{{ steps.stepId.status }}                 # Step status
{{ item }}                                # Current loop item
{{ index }}                               # Current loop index
{{ error.message }}                       # Error details (in catch)
{{ env.VARIABLE }}                        # Environment variable
{{ secrets.SECRET_NAME }}                 # Secret value (trusted context only)
```

## Validation Rules

1. **Node IDs must be unique** within a workflow
2. **Condition expressions must be valid** syntax
3. **Branch references must exist** in switch cases
4. **Loop items must be arrays** or array expressions
5. **Parallel branches must be named** uniquely
6. **Wait durations** must be valid time strings
7. **Transform expressions** must be valid for selected language
8. **Agent references** must be valid agent IDs

## Next Steps

- [Workflow Schema](./workflow-schema.md) - Core workflow specification
- [Agent Schema](./agent-schema.md) - Agent handoff targets
- [Execution Backends](./execution-backends.md) - Runtime behavior

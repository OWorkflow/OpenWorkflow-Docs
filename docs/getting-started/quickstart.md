---
id: quickstart
title: Quick Start
sidebar_label: Quick Start
sidebar_position: 1
description: Get started with OpenWorkflow in minutes
---

# Quick Start

Get up and running with OpenWorkflow in minutes.

## What is OpenWorkflow?

OpenWorkflow is an open standard for building portable AI workflows and automations. It provides:

- **Portable workflows** — Write once, run anywhere
- **Modular components** — Reusable connectors, agents, and workflows
- **Vendor-neutral** — Not tied to any specific platform
- **Open source** — Apache 2.0 licensed specification

## Your First Workflow

Here's a simple workflow that uses a connector to fetch weather data:

```yaml
id: weather-workflow
version: 1.0.0
name: Weather Report
description: Fetch current weather for a location

inputs:
  - id: location
    type: string
    required: true

steps:
  - id: fetch_weather
    type: connector_call
    connector: connector:openweather/weather@1.0.0
    operation: getCurrentWeather
    inputs:
      location: "{{ inputs.location }}"

  - id: format_response
    type: output
    value: "The weather in {{ inputs.location }} is {{ steps.fetch_weather.output.condition }} with a temperature of {{ steps.fetch_weather.output.temp }}°C"

outputs:
  - id: result
    value: "{{ steps.format_response.value }}"
```

## Core Concepts

### Connectors

Connectors provide external integrations (APIs, databases, MCP servers):

```yaml
id: connector:openweather/weather
version: 1.0.0
name: OpenWeather API
description: Weather data connector

operations:
  - id: getCurrentWeather
    name: Get Current Weather
    description: Fetch current weather for a location
    inputs:
      - id: location
        type: string
        required: true
    outputs:
      condition: string
      temp: number
      humidity: number
```

### Workflows

Workflows orchestrate multi-step automation logic with data flow between steps.

### Agents

Agents are autonomous AI executors that can use tools and make decisions:

```yaml
id: agent:research/assistant
version: 1.0.0
name: Research Assistant
description: AI agent for research tasks

capabilities:
  - search
  - analyze
  - summarize

execution:
  backend: native
  runtimeHint: any
```

### Bundles

Bundles package related resources together for distribution:

```yaml
id: bundle:automation/pack
version: 1.0.0
name: Automation Pack
description: Complete automation bundle

includes:
  - connector:slack/api@1.0.0
  - workflow:notifications/alert@1.0.0
  - agent:support/bot@1.0.0
```

## Next Steps

- [Explore the Specification Reference](/docs/reference/overview)
- [Browse Examples](/docs/examples)
- [Learn about Connectors](/docs/reference/connector-schema)
- [Understand Workflows](/docs/reference/workflow-schema)
- [Contribute to OpenWorkflow](/docs/contributing)

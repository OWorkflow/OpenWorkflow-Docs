---
id: changelog
title: Changelog
sidebar_label: Changelog
sidebar_position: 100
description: Version history and changes
---
# Changelog

All notable changes to the OpenWorkflow specification will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Renamed terminology: "OpenWorkflow Open Specification" → "OpenWorkflow"
- Standardized context model: use `steps.<id>.output` consistently (not `nodes.*`)
- Made agent schema framework-agnostic (moved LangChain specifics to adapter docs)
- Updated execution backends to focus on resolution order and telemetry requirements
- Improved connector schema with vendor-neutral auth descriptors
- Enhanced SDK contract with error taxonomy

### Added
- Scope section in README (In Scope / Not in Scope)
- Reference Implementation callout in README
- Status headers to all specification files
- Template Context Model section in workflow-schema.md
- Design Principles section in workflow-logic-steps.md (Determinism & Observability)
- Backend Overrides section in workflow-schema.md
- Security and capability hints in connector-schema.md
- Authentication section with vendor-neutral descriptors in connector-schema.md
- Telemetry Requirements section in execution-backends.md
- Error Taxonomy section in sdk-contract.md
- CHANGELOG.md (this file)

## [0.1.0] - 2025-10-11

### Added
- Initial draft specification release
- Core schemas: Connector, Workflow, Agent, Bundle
- Logic node catalog with 8 core types
- Registry taxonomy and naming conventions
- Security primitives (auth, RBAC, secrets, template sandboxing)
- Registry protocol for discovery and publishing
- SDK contract for language-agnostic integration
- Execution backends specification (Native, LangChain, Custom)
- Example implementations (Weather HTTP connector, Calculator SDK connector)

### Security
- Pre-release security notice added
- Template expression sandboxing documented
- SQL injection prevention guidance
- SSRF protection with URL validation
- Input validation best practices

## Version History Notes

**0.x.x versions** are pre-release and may include breaking changes between minor versions.

**1.0.0** will signify API stability and adherence to strict semantic versioning.

[Unreleased]: https://github.com/OWorkflow/OpenWorkflow-Specification/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/OWorkflow/OpenWorkflow-Specification/releases/tag/v0.1.0

# Gemini API Key Rotation

We decided to implement an in-memory round-robin API key pool for the Gemini API client to rotate keys and improve resiliency against rate limit errors (`429 RESOURCE_EXHAUSTED`) and temporary `5xx` errors.

Since Gemini rate limits are applied per Google Cloud/AI Studio project rather than per API key, developers must configure keys from separate projects to scale up effective quota.

Additionally, to ensure security, all raw API key values will be masked/redacted in logs and error reports. They will instead be referenced using unique generated identifiers (e.g., `gemini-key-1`, `gemini-key-2`).

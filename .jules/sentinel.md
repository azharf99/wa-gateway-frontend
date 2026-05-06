## 2025-05-05 - [Enhancement] Obscure API Key
**Vulnerability:** API key was displayed in plaintext on the settings page, risking shoulder-surfing or accidental leakage in screen shares.
**Learning:** Sensitive keys were rendered as plain `input type="text"` fields.
**Prevention:** Use `input type="password"` with a visibility toggle button for sensitive data by default.

# n8n-nodes-geosearchleads

This is an n8n community node. It lets you use [GEO Search Leads](https://geosearchleads.com) in your n8n workflows.

GEO Search Leads checks how well a website is prepared for generative engines such as ChatGPT, Claude and Gemini, and turns the result into a scored report.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation and install `n8n-nodes-geosearchleads`.

## Operations

| Operation | Cost | Input | Output |
| --- | --- | --- | --- |
| **Run Lite Scan** | Free | Website URL, language | The scan ID, the total GEO score and the score of every category — the same result as the Chrome extension and the website widget. |
| **Run Full Scan** | 1 credit | Website URL, language | The scan ID and the first full results of the report. Lead and AI sections are completed in the background and appear in the full report later. |
| **Get Full Report** | Free | Scan ID | The complete stored report of the scan, with its status and sync dates. |

A re-scan of the same website within 24 hours of a charged scan is free. Asking for a website that is still being scanned starts no second scan.

Language is English or Dutch. **Account Default** uses the language set on your GEO Search Leads profile.

## Credentials

You connect with a button. No API key or password is stored in n8n.

1. In n8n, create a **GEO Search Leads OAuth2 API** credential. Leave **App URL** at `https://app.geosearchleads.com/api`.
2. Click **Connect my account**. GEO Search Leads opens; sign in if needed and click **Allow access**.
3. The credential shows as connected.

You can see and disconnect the connection at any time in GEO Search Leads under **Settings → n8n connections**. A disconnected or expired connection stops the node until you connect again. Connections last 30 days.

Before every run, the node checks that the connection still works, so a revoked connection or a closed account stops the workflow before anything is scanned.

Connecting needs the Lite plan or higher, and full scans use your monthly credits.

## Compatibility

Built and tested with n8n 2.x (`n8n-workflow` 2.16). Requires n8n 1.0 or later.

## Usage

A typical flow: **Run Lite Scan** to see the scores of many websites for free, then **Run Full Scan** on the promising ones, and **Get Full Report** later with the scan ID to read the completed report.

A full scan waits for the website to be scanned and can take a minute or two.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [GEO Search Leads](https://geosearchleads.com)

## Development

```bash
npm install
npm run dev   # starts a local n8n at http://localhost:5678 with this node loaded
npm run lint
npm run build
```

To use a local GEO Search Leads backend, set **App URL** on the credential to `http://localhost:3000` (the backend's `MCP_OAUTH_ISSUER`).

Releases are published to npm with provenance by `.github/workflows/publish.yml` when a version tag is pushed (`npm run release`).

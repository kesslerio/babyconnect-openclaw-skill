# ActiveCampaign Skill for Moltbot

ActiveCampaign CRM integration for ShapeScale sales automation.

## Features

- **Contacts**: Create, sync, search, and tag leads
- **Deals**: Manage sales pipeline stages
- **Tags**: Segment and organize contacts
- **Automations**: Trigger email sequences

## Setup

### Option 1: Environment Variables (Recommended)
Add to your shell profile (`.bashrc`, `.zshrc`, or profile):
```bash
export ACTIVECAMPAIGN_URL="https://youraccount.api-us1.com"
export ACTIVECAMPAIGN_API_KEY="your-api-key"
```

Then reload:
```bash
source ~/.bashrc  # or your shell config
```

### Option 2: Config Files
```bash
mkdir -p ~/.config/activecampaign
echo "https://youraccount.api-us1.com" > ~/.config/activecampaign/url
echo "your-api-key" > ~/.config/activecampaign/api_key
```

## Get API Credentials

From your ActiveCampaign account:
1. Go to **Settings** → **Developer** → **API Access**
2. Copy the **API URL** (e.g., `https://yourname.api-us1.com`)
3. Copy the **API Key**

## Usage

```bash
# Contacts
activecampaign contacts list
activecampaign contacts sync "email@clinic.com" "Dr." "Smith"
activecampaign contacts add-tag <contact_id> <tag_id>

# Deals
activecampaign deals list
activecampaign deals create "Clinic Name" <stage_id> 5000

# Tags
activecampaign tags list
activecampaign tags create "Demo Requested"

# Automations
activecampaign automations list
activecampaign automations add-contact <contact_id> <automation_id>
```

## ShapeScale Integration

This skill integrates with:
- `shapescale-crm` - Attio CRM for source of truth
- `shapescale-sales` - Sales qualification workflows
- `campaign-orchestrator` - Multi-channel follow-up campaigns

## License

MIT

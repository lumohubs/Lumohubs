# Lumo Hubs App (v2)

We don't just teach AI. We put it to work.

## What's inside
- 20 live tracks and 6 Coming Soon previews, with Foundation (free) and Advanced (employer paid) levels
- Company software and a hands on example in every track
- Lumo coach: knows each learner by name, remembers goal, track, and progress on any device, speaks first, and guides the next step
- AI Mentor and photo checks on every week, powered by Ministral 8B (small open model)
- Find your track quiz, AI Business Builder, career help
- Lumo Talent Network: jobs, internships, live projects, AI candidate matching
- Employer dashboard, student tracking, hub booking, outcomes dashboard
- PlumberFix AI: train plumbers and hire them
- English and Arabic menus

## Settings in Vercel (Project > Settings > Environment Variables)
- ACCESS_CODE: the code people type to enter (optional; leave empty to keep the site open)
- CLAUDE_MODEL: optional, defaults to claude-sonnet-5-5
- Learner memory: in Vercel, Storage > Upstash Redis (free) > connect to this project. This adds KV_REST_API_URL and KV_REST_API_TOKEN.
- ADMIN_CODE: optional, lets hub staff list learners through /api/learner (action admin)
- AI_PROVIDER=claude: optional, switch the AI back to Claude (needs ANTHROPIC_API_KEY)

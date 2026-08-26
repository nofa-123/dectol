# Doctol on Vercel

This source package is ready to import into Vercel as a Vite project.

## Build settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No production environment variable has to be entered manually: the included
`.env.production` uses `/backend-api`, and `vercel.json` proxies that same-origin
path to the current Laravel staging API.

## Backend-driven mobile data

The mobile UI and desktop UI share the same Pinia stores and Laravel API client.
Services and their detail resources, offers, packages and their detail
resources, blog and article details, home content, FAQs, cities,
neighborhoods, availability, registration/token authentication, account,
booking quote/creation, gift cards, feedback, promo codes and rewards use the
Laravel v1 endpoints.

Local data and images are retained only as graceful visual fallbacks when the
API does not expose a section yet or when a remote image cannot load. Prices,
IDs, slugs and booking payloads are never replaced by image fallbacks.

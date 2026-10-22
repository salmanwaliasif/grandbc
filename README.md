# Grand Business Center — website prototype

Pitch prototype for **Grand Business Center LLC** (Building 4, 5th Floor, Tilal Offices, Muscat Grand Mall).
Static site — no framework, no build step needed to deploy.

## Deploy to Vercel
1. Import this repo in Vercel.
2. Leave the framework as **Other**. `vercel.json` already points Vercel at the `public/` folder.
3. Deploy.

## What's inside
| Page | What visitors can do |
|---|---|
| `index.html` | Hero booking bar, live meeting-room availability, setup service picker, location, gallery, FAQ |
| `spaces.html` | Filter all spaces (offices, rooms, desks, virtual), photo viewer, book |
| `meeting-rooms.html` | Pick a free hour on the availability board, room details |
| `book.html` | 5-step booking: space → time → extras → details (with account creation) → review. Live price with 5% VAT, half/full-day rates, free first day pass, deposit for offices, `.ics` calendar file, WhatsApp hand-off |
| `pricing.html` | Office plans, monthly cost calculator, pay-as-you-go rates, lease terms |
| `business-setup.html` | Company formation planner that sends a structured request |
| `contact.html` | Tour booking, map, directions |
| `signup.html` / `login.html` / `account.html` | Member accounts: upcoming bookings, cancel, rebook, pro-forma invoices, requests, profile |

## Editing content & prices
Everything lives in **`public/assets/js/data.js`** — spaces, prices, add-ons, amenities, phone numbers and the WhatsApp number.

> Office prices (OMR 300 / 350 / 450 / 500) come from the current grand-bc.com pricing page.
> Meeting room, desk, virtual office and add-on prices are **placeholders** — confirm with GBC.

## Shared header/footer
Header, footer and `<head>` tags are shared across pages. After editing them in `build.py`, run:

```
python3 build.py
```

This also regenerates `public/assets/vendor/icons.js` (only the Lucide icons the site uses; needs Node).

## Prototype limits
Accounts, bookings and requests are stored in the visitor's browser (`localStorage`) and every confirmation
can be sent to GBC on WhatsApp (+968 9158 0111). Going live needs a small backend (e.g. Supabase or a Laravel API)
for real accounts, shared availability, email notifications and online payment.

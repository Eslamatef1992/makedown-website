# Make Down Website

React (Vite) + Tailwind frontend for the Make Down platform.

## Stack
- React 18 + Vite
- React Router
- Axios (with silent access-token refresh)
- Tailwind CSS, themed from the Figma design system (Carissma / Saffron /
  Carnation / Espresso / Linen palettes, Fredoka font)

## Local setup
```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your makedown-api instance
npm run dev
```

## Status
Auth flow (register, OTP verification, login, forgot/reset password) is
wired up to the real API. Every other route from the Figma flow (shop,
cart/checkout, packages, play, profile, static pages) is scaffolded as a
placeholder page so navigation is real — see `src/pages/ComingSoon.jsx` and
`docs/PROJECT_PLAN.md` in the project root for what's next.

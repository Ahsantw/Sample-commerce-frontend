# Sample Commerce Frontend

A React + TypeScript e-commerce storefront and admin dashboard, built with Vite, Tailwind CSS, and shadcn/ui. Designed to work against the companion [Sample-commerce-backend](https://github.com/Ahsantw/Sample-commerce-backend) REST API.

## Features

- **Storefront** — home page (with promotional sliders), product listing, product detail, categories, about/contact pages.
- **Auth** — login/signup, with an `AuthContext` managing the logged-in user and JWT token.
- **Cart & Checkout** — a `CartContext`-backed shopping cart, checkout flow, and order placement.
- **Order tracking** — buyers can view their own order history (`/orders`).
- **Live chat / support** — a floating chat button available site-wide for customer support, plus a dedicated admin chat inbox.
- **Admin dashboard** — a separate `/admin/*` section for managing products, categories, users, orders, sliders, and chat conversations.
- **UI system** — built on [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives + Tailwind), including forms, dialogs, tables, toasts, carousels, and more.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build tool**: Vite (with SWC for fast refresh)
- **Styling**: Tailwind CSS + `tailwindcss-animate`
- **UI components**: shadcn/ui (Radix UI primitives), `lucide-react` icons
- **Routing**: React Router v6
- **Data/state**: TanStack Query (`@tanstack/react-query`), React Context (`AuthContext`, `CartContext`)
- **Forms & validation**: `react-hook-form` + `zod`
- **Notifications**: `sonner` + shadcn toast
- **Charts**: `recharts` (used in the admin dashboard)

## Project Structure

```
Sample-commerce-frontend/
├── src/
│   ├── App.tsx                    # Route definitions (public, buyer, and admin routes)
│   ├── main.tsx                   # App entry point
│   ├── lib/
│   │   ├── api.ts                 # Central API client — wraps fetch calls to the backend, handles JWT token storage
│   │   ├── orderService.ts        # Order-related API helpers
│   │   └── utils.ts               # Shared utility functions
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Current user/auth state, login/logout/signup logic
│   │   └── CartContext.tsx        # Shopping cart state
│   ├── components/
│   │   ├── Navbar.tsx, Footer.tsx # Site layout
│   │   ├── ProductCard.tsx        # Product grid item
│   │   ├── FloatingChatButton.tsx # Site-wide support chat trigger
│   │   ├── AdminLayout.tsx        # Shared layout/sidebar for admin pages
│   │   └── ui/                     # shadcn/ui component library (buttons, dialogs, tables, forms, etc.)
│   ├── pages/
│   │   ├── Home.tsx, Products.tsx, ProductDetail.tsx, Categories.tsx
│   │   ├── Login.tsx, Signup.tsx
│   │   ├── Cart.tsx, Checkout.tsx, Orders.tsx
│   │   ├── About.tsx, Contact.tsx, NotFound.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx, Products.tsx, Categories.tsx
│   │       ├── Users.tsx, Orders.tsx, Chat.tsx, Sliders.tsx
│   └── types/index.ts             # Shared TypeScript types (User, Product, Order, Cart, etc.)
├── public/                        # Static assets (favicon, robots.txt, placeholder image)
├── components.json                # shadcn/ui configuration
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/login`, `/signup` | Auth |
| `/products`, `/product/:id` | Product listing & detail |
| `/categories` | Category browsing |
| `/about`, `/contact` | Static/info pages |
| `/cart`, `/checkout`, `/orders` | Buyer flow |
| `/admin`, `/admin/products`, `/admin/categories`, `/admin/users`, `/admin/orders`, `/admin/chat`, `/admin/sliders` | Admin dashboard |
| `*` | 404 Not Found |

> Note: admin routes are not currently gated behind a role check in `App.tsx` — access control for `/admin/*` should be enforced (e.g., a route guard checking `AuthContext`'s user role) before deploying this publicly.

## Requirements

- Node.js (LTS recommended)
- The [Sample-commerce-backend](https://github.com/Ahsantw/Sample-commerce-backend) API running and reachable (for data/auth to work)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure the API base URL. The app reads `import.meta.env.VITE_API_URL` (falling back to `http://localhost:5000/api` if unset). Create/update a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   > ⚠️ The repository's included `.env` currently defines `REACT_APP_API_URL` instead of `VITE_API_URL` — since this is a Vite project (not Create React App), that variable name is **not read** by the app, and it silently falls back to the default `http://localhost:5000/api`. Rename it to `VITE_API_URL` to actually point at a custom backend URL.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
   or a development-mode build:
   ```bash
   npm run build:dev
   ```
5. Preview a production build locally:
   ```bash
   npm run preview
   ```
6. Lint the project:
   ```bash
   npm run lint
   ```

## Backend Integration

This frontend expects the API contract provided by [Sample-commerce-backend](https://github.com/Ahsantw/Sample-commerce-backend) — it consumes endpoints for auth, products, categories, cart, orders, chat, and sliders, and stores the JWT in `localStorage` (`authToken`) via `src/lib/api.ts`.

## License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

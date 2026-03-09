# Satyasaar

A premium e-commerce checkout experience with elegant styling and integrated payment solutions.

## Features

- **Responsive Checkout Page** — Multi-step checkout with clean, modern UI
- **Payment Methods**
  - Razorpay integration (Card, UPI, NetBanking, Wallets, EMI)
  - Cash on Delivery (COD) option
- **Shipping Integration**
  - Delhivery delivery estimates based on PIN code
  - Multiple shipping options (Standard & Express)
- **Order Management**
  - Real-time cart management
  - Coupon/discount system
  - Order tracking
- **Data Persistence**
  - Local storage for cart and orders
  - Supabase integration (optional)
- **AI Chatbot** — Integrated support chatbot

## Project Structure

```
├── index.html              # Home page
├── checkout.html           # Checkout page
├── about.html              # About page
├── blog-classic.html       # Blog pages
├── contact_form.php        # Contact form handler
├── style.css               # Global styles
├── api/
│   └── delhivery.js        # Delhivery API integration
├── css/
│   ├── normalize.css
│   ├── swiper-bundle.min.css
│   └── vendor.css
├── js/
│   ├── jquery.min.js
│   ├── modernizr.js
│   ├── plugins.js
│   ├── script.js
│   └── SmoothScroll.js
└── images/
```

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/bhavishya2324/Satyasaar.git
   cd Satyasaar
   ```

2. Open in a web server (required for localStorage and API calls)
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

3. Visit `http://localhost:8000`

## Configuration

### Razorpay Setup
- Get your Key ID from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
- Enter test key (`rzp_test_...`) in checkout page, or configure for production (`rzp_live_...`)
- Key is saved to browser localStorage

### Supabase (Optional)
- Set `ss_url` and `ss_key` in localStorage to enable cloud order storage
- Orders are always saved locally

### Delhivery Integration
- Configured via proxy at `https://sthii.vercel.app/api/delhivery`
- Provides PIN code verification and delivery estimates

## License

All rights reserved © Satyasaar

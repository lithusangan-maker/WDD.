# Database Setup (XAMPP)

This project now stores backend state in MySQL instead of JSON files.

## 1) Start services

In XAMPP Control Panel, start:
- Apache
- MySQL

## 2) Create DB/table

Open `http://localhost/phpmyadmin`, go to SQL tab, and run:
- `backend/database/schema.sql`

It will create these tables:
- `users`
- `profiles`
- `admin_products`
- `catalog_products`
- `removed_base_products`
- `orders`
- `order_items`
- `cart_items`
- `wishlist_items`
- `messages`
- `app_meta`

## 3) Update DB config (optional)

`backend/api.php` uses these environment variables if provided:
- `WDD_DB_HOST` (default: `127.0.0.1`)
- `WDD_DB_PORT` (default: `3306`)
- `WDD_DB_NAME` (default: `wdd_store`)
- `WDD_DB_USER` (default: `root`)
- `WDD_DB_PASS` (default: empty)
- `WDD_DB_CHARSET` (default: `utf8mb4`)

If you use default XAMPP MySQL settings, no extra config is required.

## 4) Open the app

Serve the project through Apache, then open the site pages.  
API requests to `backend/api.php` will read/write data in the tables above.

## Optional: migrate old saved data

If you used the older `app_state`/JSON storage before, run:

```powershell
C:\xampp\php\php.exe backend/database/migrate_legacy_to_tables.php
```

This migrates existing legacy data into the new tables.

## Optional: seed web catalog products

To push the product data defined in `assets/js/app.js` into MySQL table `catalog_products`, run:

```powershell
C:\xampp\php\php.exe backend/database/seed_web_catalog.php
```

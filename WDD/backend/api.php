<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const AUTH_ADMIN_USER = 'Admin1';
const AUTH_ADMIN_PASS = '123';
const AUTH_PM_USER = 'promanager';
const AUTH_PM_PASS = '456';

const DATA_DIR = __DIR__ . '/data';
const USERS_FILE = DATA_DIR . '/users.json';
const PROFILES_FILE = DATA_DIR . '/profiles.json';
const ADMIN_PRODUCTS_FILE = DATA_DIR . '/admin_products.json';
const REMOVED_BASE_FILE = DATA_DIR . '/removed_base_products.json';
const ORDERS_FILE = DATA_DIR . '/orders.json';
const CARTS_FILE = DATA_DIR . '/carts.json';
const ORDER_SEQ_FILE = DATA_DIR . '/order_seq.txt';
const WISHLISTS_FILE = DATA_DIR . '/wishlists.json';
const MESSAGES_FILE = DATA_DIR . '/messages.json';

const DB_DEFAULT_HOST = '127.0.0.1';
const DB_DEFAULT_PORT = 3306;
const DB_DEFAULT_NAME = 'wdd_store';
const DB_DEFAULT_USER = 'root';
const DB_DEFAULT_PASS = '';
const DB_DEFAULT_CHARSET = 'utf8mb4';
const DB_TABLE_USERS = 'users';
const DB_TABLE_PROFILES = 'profiles';
const DB_TABLE_ADMIN_PRODUCTS = 'admin_products';
const DB_TABLE_CATALOG_PRODUCTS = 'catalog_products';
const DB_TABLE_REMOVED_BASE = 'removed_base_products';
const DB_TABLE_ORDERS = 'orders';
const DB_TABLE_ORDER_ITEMS = 'order_items';
const DB_TABLE_CARTS = 'cart_items';
const DB_TABLE_WISHLISTS = 'wishlist_items';
const DB_TABLE_MESSAGES = 'messages';
const DB_TABLE_META = 'app_meta';
const DB_META_ORDER_SEQ = 'order_seq';

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function ensure_data_dir(): void {
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0777, true) && !is_dir(DATA_DIR)) {
        json_response(['ok' => false, 'error' => 'Failed to create data directory'], 500);
    }
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if (($raw === false || $raw === '') && PHP_SAPI === 'cli') {
        $raw = file_get_contents('php://stdin');
    }
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function db_config(): array {
    $host = trim((string)(getenv('WDD_DB_HOST') ?: DB_DEFAULT_HOST));
    $port = (int)(getenv('WDD_DB_PORT') ?: DB_DEFAULT_PORT);
    $name = trim((string)(getenv('WDD_DB_NAME') ?: DB_DEFAULT_NAME));
    $user = (string)(getenv('WDD_DB_USER') ?: DB_DEFAULT_USER);
    $pass = (string)(getenv('WDD_DB_PASS') ?: DB_DEFAULT_PASS);
    $charset = trim((string)(getenv('WDD_DB_CHARSET') ?: DB_DEFAULT_CHARSET));

    if ($host === '') $host = DB_DEFAULT_HOST;
    if ($port <= 0) $port = DB_DEFAULT_PORT;
    if ($name === '') $name = DB_DEFAULT_NAME;
    if ($charset === '') $charset = DB_DEFAULT_CHARSET;

    return [
        'host' => $host,
        'port' => $port,
        'name' => $name,
        'user' => $user,
        'pass' => $pass,
        'charset' => $charset
    ];
}

function db_quote_identifier(string $identifier): string {
    return '`' . str_replace('`', '``', $identifier) . '`';
}

function db_to_datetime(string $value): string {
    $value = trim($value);
    if ($value === '') return date('Y-m-d H:i:s');
    try {
        return (new DateTime($value))->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        return date('Y-m-d H:i:s');
    }
}

function db_to_iso($value): string {
    $raw = trim((string)$value);
    if ($raw === '') return date('c');
    try {
        return (new DateTime($raw))->format('c');
    } catch (Throwable $e) {
        return date('c');
    }
}

function db_json_encode($value): ?string {
    $encoded = json_encode($value, JSON_UNESCAPED_SLASHES);
    return $encoded === false ? null : $encoded;
}

function db_json_decode(string $value, $default) {
    $decoded = json_decode($value, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) return $default;
    return $decoded;
}

function db_column_exists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = :column_name'
    );
    $stmt->execute([
        ':table_name' => $table,
        ':column_name' => $column
    ]);
    return ((int)$stmt->fetchColumn()) > 0;
}

function db_add_column_if_missing(PDO $pdo, string $table, string $column, string $definition): void {
    if (db_column_exists($pdo, $table, $column)) return;
    $tableName = db_quote_identifier($table);
    $pdo->exec("ALTER TABLE {$tableName} ADD COLUMN {$definition}");
}

function db_drop_column_if_exists(PDO $pdo, string $table, string $column): void {
    if (!db_column_exists($pdo, $table, $column)) return;
    $tableName = db_quote_identifier($table);
    $columnName = db_quote_identifier($column);
    $pdo->exec("ALTER TABLE {$tableName} DROP COLUMN {$columnName}");
}

function db_create_tables(PDO $pdo): void {
    $users = db_quote_identifier(DB_TABLE_USERS);
    $profiles = db_quote_identifier(DB_TABLE_PROFILES);
    $products = db_quote_identifier(DB_TABLE_ADMIN_PRODUCTS);
    $catalogProducts = db_quote_identifier(DB_TABLE_CATALOG_PRODUCTS);
    $removed = db_quote_identifier(DB_TABLE_REMOVED_BASE);
    $orders = db_quote_identifier(DB_TABLE_ORDERS);
    $orderItems = db_quote_identifier(DB_TABLE_ORDER_ITEMS);
    $carts = db_quote_identifier(DB_TABLE_CARTS);
    $wishlists = db_quote_identifier(DB_TABLE_WISHLISTS);
    $messages = db_quote_identifier(DB_TABLE_MESSAGES);
    $meta = db_quote_identifier(DB_TABLE_META);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$users} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            username_key VARCHAR(191) NOT NULL,
            username VARCHAR(191) NOT NULL,
            name VARCHAR(191) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(60) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(40) NOT NULL DEFAULT 'customer',
            address VARCHAR(255) NOT NULL DEFAULT '',
            city VARCHAR(120) NOT NULL DEFAULT '',
            zip_code VARCHAR(40) NOT NULL DEFAULT '',
            added_by VARCHAR(191) NOT NULL DEFAULT '',
            registered_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_users_username_key (username_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$profiles} (
            username_key VARCHAR(191) NOT NULL,
            username VARCHAR(191) NOT NULL,
            name VARCHAR(191) NOT NULL DEFAULT '',
            email VARCHAR(255) NOT NULL DEFAULT '',
            phone VARCHAR(60) NOT NULL DEFAULT '',
            address VARCHAR(255) NOT NULL DEFAULT '',
            city VARCHAR(120) NOT NULL DEFAULT '',
            zip_code VARCHAR(40) NOT NULL DEFAULT '',
            image TEXT NOT NULL,
            role VARCHAR(40) NOT NULL DEFAULT '',
            updated_at DATETIME NOT NULL,
            row_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (username_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$products} (
            product_id VARCHAR(191) NOT NULL,
            product_json LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$catalogProducts} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            product_id VARCHAR(191) NOT NULL,
            source_group VARCHAR(80) NOT NULL,
            name VARCHAR(255) NOT NULL DEFAULT '',
            gender VARCHAR(60) NOT NULL DEFAULT '',
            type VARCHAR(80) NOT NULL DEFAULT '',
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            product_json LONGTEXT NOT NULL,
            seeded_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_catalog_product_id (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$removed} (
            product_id VARCHAR(191) NOT NULL,
            removed_at DATETIME NOT NULL,
            PRIMARY KEY (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$orders} (
            order_id VARCHAR(40) NOT NULL,
            order_seq INT UNSIGNED NOT NULL,
            role VARCHAR(40) NOT NULL DEFAULT 'customer',
            username VARCHAR(191) NOT NULL DEFAULT '',
            status VARCHAR(40) NOT NULL DEFAULT 'Pending',
            customer_name VARCHAR(191) NOT NULL DEFAULT '',
            customer_email VARCHAR(255) NOT NULL DEFAULT '',
            customer_phone VARCHAR(60) NOT NULL DEFAULT '',
            customer_address VARCHAR(255) NOT NULL DEFAULT '',
            customer_city VARCHAR(120) NOT NULL DEFAULT '',
            customer_zip_code VARCHAR(40) NOT NULL DEFAULT '',
            subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            item_count INT UNSIGNED NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (order_id),
            UNIQUE KEY uq_orders_seq (order_seq)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$orderItems} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            order_id VARCHAR(40) NOT NULL,
            line_no INT UNSIGNED NOT NULL DEFAULT 1,
            product_id VARCHAR(191) NOT NULL DEFAULT '',
            product_name VARCHAR(255) NOT NULL DEFAULT '',
            product_brand VARCHAR(120) NOT NULL DEFAULT '',
            size VARCHAR(60) NOT NULL DEFAULT '',
            color VARCHAR(60) NOT NULL DEFAULT '',
            qty INT UNSIGNED NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
            line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_order_items_order_id (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$carts} (
            username_key VARCHAR(191) NOT NULL,
            item_key VARCHAR(255) NOT NULL,
            product_id VARCHAR(191) NOT NULL,
            qty INT UNSIGNED NOT NULL DEFAULT 1,
            size VARCHAR(60) NOT NULL DEFAULT '',
            color VARCHAR(60) NOT NULL DEFAULT '',
            added_at DATETIME NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (username_key, item_key),
            KEY idx_cart_items_product_id (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$wishlists} (
            username_key VARCHAR(191) NOT NULL,
            product_id VARCHAR(191) NOT NULL,
            added_at DATETIME NOT NULL,
            PRIMARY KEY (username_key, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$messages} (
            message_id VARCHAR(80) NOT NULL,
            name VARCHAR(191) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (message_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$meta} (
            meta_key VARCHAR(120) NOT NULL,
            meta_value LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (meta_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    // Ensure existing installations get newly introduced columns.
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_name', "customer_name VARCHAR(191) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_email', "customer_email VARCHAR(255) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_phone', "customer_phone VARCHAR(60) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_address', "customer_address VARCHAR(255) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_city', "customer_city VARCHAR(120) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'customer_zip_code', "customer_zip_code VARCHAR(40) NOT NULL DEFAULT ''");
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'subtotal_amount', 'subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'shipping_amount', 'shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'total_amount', 'total_amount DECIMAL(10,2) NOT NULL DEFAULT 0');
    db_add_column_if_missing($pdo, DB_TABLE_ORDERS, 'item_count', 'item_count INT UNSIGNED NOT NULL DEFAULT 0');

    // Remove legacy JSON blob columns once normalized columns exist.
    db_drop_column_if_exists($pdo, DB_TABLE_ORDERS, 'customer_json');
    db_drop_column_if_exists($pdo, DB_TABLE_ORDERS, 'items_json');
    db_drop_column_if_exists($pdo, DB_TABLE_ORDERS, 'summary_json');
    db_drop_column_if_exists($pdo, DB_TABLE_ORDERS, 'order_json');
    db_drop_column_if_exists($pdo, DB_TABLE_ORDER_ITEMS, 'item_json');
    db_drop_column_if_exists($pdo, DB_TABLE_CARTS, 'item_json');
}

function db_connection(): PDO {
    static $pdo = null;
    static $initialized = false;
    if ($pdo instanceof PDO) return $pdo;

    if (!extension_loaded('pdo_mysql')) {
        json_response(['ok' => false, 'error' => 'PDO MySQL extension is not enabled in PHP'], 500);
    }

    $cfg = db_config();

    try {
        $serverDsn = sprintf('mysql:host=%s;port=%d;charset=%s', $cfg['host'], $cfg['port'], $cfg['charset']);
        $pdo = new PDO($serverDsn, $cfg['user'], $cfg['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);

        $dbName = db_quote_identifier($cfg['name']);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS {$dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE {$dbName}");
        if (!$initialized) {
            db_create_tables($pdo);
            $initialized = true;
        }
    } catch (Throwable $e) {
        json_response([
            'ok' => false,
            'error' => 'Database connection failed',
            'details' => $e->getMessage()
        ], 500);
    }

    return $pdo;
}

function db_read_meta(string $key, $default = null) {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_META);
        $stmt = $pdo->prepare("SELECT meta_value FROM {$table} WHERE meta_key = :meta_key LIMIT 1");
        $stmt->execute([':meta_key' => $key]);
        $raw = $stmt->fetchColumn();
        if ($raw === false) return $default;
        $decoded = db_json_decode((string)$raw, $default);
        return $decoded;
    } catch (Throwable $e) {
        return $default;
    }
}

function db_write_meta(string $key, $value): bool {
    $encoded = db_json_encode($value);
    if ($encoded === null) return false;

    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_META);
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (meta_key, meta_value)
             VALUES (:meta_key, :meta_value)
             ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), updated_at = CURRENT_TIMESTAMP"
        );
        return $stmt->execute([
            ':meta_key' => $key,
            ':meta_value' => $encoded
        ]);
    } catch (Throwable $e) {
        return false;
    }
}

function normalize_username(string $username): string {
    return strtolower(trim($username));
}

function normalize_cart_user_key(string $raw): string {
    $key = strtolower(trim($raw));
    if ($key === '') return '';

    if (strpos($key, ':') === false) {
        $username = normalize_username($key);
        return $username === '' ? '' : ('customer:' . $username);
    }

    $parts = explode(':', $key, 2);
    $role = trim((string)($parts[0] ?? ''));
    $username = normalize_username((string)($parts[1] ?? ''));
    if ($role === '' || $username === '') return '';
    return $role . ':' . $username;
}

function parse_order_seq(string $id): ?int {
    $id = trim($id);
    if ($id === '') return null;

    if (preg_match('/^#(\d+)$/i', $id, $m) === 1) return (int)$m[1];
    if (preg_match('/^ORDER-(\d+)$/i', $id, $m) === 1) return (int)$m[1];
    return null;
}

function format_order_id(int $seq): string {
    return '#' . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);
}

function sanitize_profile(array $input): array {
    return [
        'name' => trim((string)($input['name'] ?? '')),
        'email' => trim((string)($input['email'] ?? '')),
        'phone' => trim((string)($input['phone'] ?? '')),
        'address' => trim((string)($input['address'] ?? '')),
        'city' => trim((string)($input['city'] ?? '')),
        'zipCode' => trim((string)($input['zipCode'] ?? '')),
        'image' => trim((string)($input['image'] ?? '')),
    ];
}

function db_max_order_seq(): int {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_ORDERS);
        $value = $pdo->query("SELECT COALESCE(MAX(order_seq), 0) FROM {$table}")->fetchColumn();
        $seq = is_numeric($value) ? (int)$value : 0;
        return $seq > 0 ? $seq : 0;
    } catch (Throwable $e) {
        return 0;
    }
}

function db_read_users(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_USERS);
        $rows = $pdo->query(
            "SELECT username, name, email, phone, password, role, address, city, zip_code, added_by, registered_at
             FROM {$table} ORDER BY id ASC"
        )->fetchAll();

        $users = [];
        foreach ($rows as $row) {
            $entry = [
                'name' => (string)($row['name'] ?? ''),
                'username' => (string)($row['username'] ?? ''),
                'email' => (string)($row['email'] ?? ''),
                'phone' => (string)($row['phone'] ?? ''),
                'password' => (string)($row['password'] ?? ''),
                'role' => (string)($row['role'] ?? 'customer'),
                'registeredAt' => db_to_iso($row['registered_at'] ?? '')
            ];
            $address = trim((string)($row['address'] ?? ''));
            $city = trim((string)($row['city'] ?? ''));
            $zipCode = trim((string)($row['zip_code'] ?? ''));
            $addedBy = trim((string)($row['added_by'] ?? ''));
            if ($address !== '') $entry['address'] = $address;
            if ($city !== '') $entry['city'] = $city;
            if ($zipCode !== '') $entry['zipCode'] = $zipCode;
            if ($addedBy !== '') $entry['addedBy'] = $addedBy;
            $users[] = $entry;
        }
        return $users;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_users(array $users): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_USERS);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (username_key, username, name, email, phone, password, role, address, city, zip_code, added_by, registered_at)
            VALUES
            (:username_key, :username, :name, :email, :phone, :password, :role, :address, :city, :zip_code, :added_by, :registered_at)"
        );

        foreach ($users as $user) {
            if (!is_array($user)) continue;
            $username = trim((string)($user['username'] ?? ''));
            if ($username === '') continue;
            $stmt->execute([
                ':username_key' => normalize_username($username),
                ':username' => $username,
                ':name' => trim((string)($user['name'] ?? '')),
                ':email' => trim((string)($user['email'] ?? '')),
                ':phone' => trim((string)($user['phone'] ?? '')),
                ':password' => (string)($user['password'] ?? ''),
                ':role' => trim((string)($user['role'] ?? 'customer')) ?: 'customer',
                ':address' => trim((string)($user['address'] ?? '')),
                ':city' => trim((string)($user['city'] ?? '')),
                ':zip_code' => trim((string)($user['zipCode'] ?? '')),
                ':added_by' => trim((string)($user['addedBy'] ?? '')),
                ':registered_at' => db_to_datetime((string)($user['registeredAt'] ?? ''))
            ]);
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_profiles(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_PROFILES);
        $rows = $pdo->query(
            "SELECT username_key, username, name, email, phone, address, city, zip_code, image, role, updated_at
             FROM {$table} ORDER BY username_key ASC"
        )->fetchAll();

        $profiles = [];
        foreach ($rows as $row) {
            $key = normalize_username((string)($row['username_key'] ?? ''));
            if ($key === '') continue;
            $profiles[$key] = [
                'name' => (string)($row['name'] ?? ''),
                'email' => (string)($row['email'] ?? ''),
                'phone' => (string)($row['phone'] ?? ''),
                'address' => (string)($row['address'] ?? ''),
                'city' => (string)($row['city'] ?? ''),
                'zipCode' => (string)($row['zip_code'] ?? ''),
                'image' => (string)($row['image'] ?? ''),
                'role' => (string)($row['role'] ?? ''),
                'updatedAt' => db_to_iso($row['updated_at'] ?? '')
            ];
            if (($profiles[$key]['name'] ?? '') === '') {
                $profiles[$key]['name'] = (string)($row['username'] ?? $key);
            }
        }

        return $profiles;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_profiles(array $profiles): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_PROFILES);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (username_key, username, name, email, phone, address, city, zip_code, image, role, updated_at)
            VALUES
            (:username_key, :username, :name, :email, :phone, :address, :city, :zip_code, :image, :role, :updated_at)"
        );

        foreach ($profiles as $index => $profile) {
            if (!is_array($profile)) continue;
            $fallback = is_string($index) ? $index : '';
            $username = trim((string)($profile['username'] ?? $fallback));
            if ($username === '') continue;
            $stmt->execute([
                ':username_key' => normalize_username($username),
                ':username' => $username,
                ':name' => trim((string)($profile['name'] ?? $username)),
                ':email' => trim((string)($profile['email'] ?? '')),
                ':phone' => trim((string)($profile['phone'] ?? '')),
                ':address' => trim((string)($profile['address'] ?? '')),
                ':city' => trim((string)($profile['city'] ?? '')),
                ':zip_code' => trim((string)($profile['zipCode'] ?? '')),
                ':image' => trim((string)($profile['image'] ?? '')),
                ':role' => trim((string)($profile['role'] ?? '')),
                ':updated_at' => db_to_datetime((string)($profile['updatedAt'] ?? ''))
            ]);
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_admin_products(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_ADMIN_PRODUCTS);
        $rows = $pdo->query("SELECT product_id, product_json FROM {$table} ORDER BY created_at ASC")->fetchAll();
        $items = [];
        foreach ($rows as $row) {
            $decoded = db_json_decode((string)($row['product_json'] ?? ''), []);
            if (!is_array($decoded)) $decoded = [];
            if ((string)($decoded['id'] ?? '') === '') $decoded['id'] = (string)($row['product_id'] ?? '');
            $items[] = $decoded;
        }
        return $items;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_admin_products(array $products): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_ADMIN_PRODUCTS);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (product_id, product_json, created_at)
             VALUES (:product_id, :product_json, :created_at)"
        );

        foreach ($products as $product) {
            if (!is_array($product)) continue;
            $id = trim((string)($product['id'] ?? ''));
            if ($id === '') continue;
            $encoded = db_json_encode($product);
            if ($encoded === null) continue;
            $stmt->execute([
                ':product_id' => $id,
                ':product_json' => $encoded,
                ':created_at' => db_to_datetime((string)($product['createdAt'] ?? ''))
            ]);
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_removed_base_ids(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_REMOVED_BASE);
        $rows = $pdo->query("SELECT product_id FROM {$table} ORDER BY removed_at ASC")->fetchAll();
        $ids = [];
        foreach ($rows as $row) {
            $id = trim((string)($row['product_id'] ?? ''));
            if ($id !== '') $ids[] = $id;
        }
        return $ids;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_removed_base_ids(array $ids): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_REMOVED_BASE);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare("INSERT INTO {$table} (product_id, removed_at) VALUES (:product_id, :removed_at)");
        $seen = [];

        foreach ($ids as $id) {
            $productId = trim((string)$id);
            if ($productId === '' || isset($seen[$productId])) continue;
            $seen[$productId] = true;
            $stmt->execute([
                ':product_id' => $productId,
                ':removed_at' => date('Y-m-d H:i:s')
            ]);
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_orders(): array {
    try {
        $pdo = db_connection();
        $ordersTable = db_quote_identifier(DB_TABLE_ORDERS);
        $itemsTable = db_quote_identifier(DB_TABLE_ORDER_ITEMS);
        $orderRows = $pdo->query(
            "SELECT order_id, order_seq, role, username, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip_code, subtotal_amount, shipping_amount, total_amount, item_count, created_at
             FROM {$ordersTable}
             ORDER BY order_seq DESC"
        )->fetchAll();
        $itemRows = $pdo->query(
            "SELECT order_id, line_no, product_id, product_name, product_brand, size, color, qty, unit_price, line_total
             FROM {$itemsTable}
             ORDER BY order_id ASC, line_no ASC, id ASC"
        )->fetchAll();

        $itemsByOrder = [];
        foreach ($itemRows as $row) {
            $orderId = trim((string)($row['order_id'] ?? ''));
            if ($orderId === '') continue;
            if (!isset($itemsByOrder[$orderId]) || !is_array($itemsByOrder[$orderId])) $itemsByOrder[$orderId] = [];

            $qtyRaw = $row['qty'] ?? 1;
            $qty = is_numeric($qtyRaw) ? (int)$qtyRaw : 1;
            if ($qty <= 0) $qty = 1;

            $unitRaw = $row['unit_price'] ?? 0;
            $unitPrice = is_numeric($unitRaw) ? (float)$unitRaw : 0.0;
            if ($unitPrice < 0) $unitPrice = 0.0;

            $lineRaw = $row['line_total'] ?? null;
            $lineTotal = is_numeric($lineRaw) ? (float)$lineRaw : ($unitPrice * $qty);
            if ($lineTotal < 0) $lineTotal = 0.0;

            $itemsByOrder[$orderId][] = [
                'productId' => trim((string)($row['product_id'] ?? '')),
                'productName' => trim((string)($row['product_name'] ?? '')),
                'productBrand' => trim((string)($row['product_brand'] ?? '')),
                'qty' => $qty,
                'size' => trim((string)($row['size'] ?? '')),
                'color' => trim((string)($row['color'] ?? '')),
                'unitPrice' => round($unitPrice, 2),
                'lineTotal' => round($lineTotal, 2)
            ];
        }

        $orders = [];
        foreach ($orderRows as $row) {
            $orderId = trim((string)($row['order_id'] ?? ''));
            if ($orderId === '') continue;

            $role = trim((string)($row['role'] ?? 'customer'));
            if ($role === '') $role = 'customer';

            $status = trim((string)($row['status'] ?? 'Pending'));
            if ($status === '') $status = 'Pending';

            $subtotalRaw = $row['subtotal_amount'] ?? 0;
            $shippingRaw = $row['shipping_amount'] ?? 0;
            $totalRaw = $row['total_amount'] ?? 0;
            $subtotal = is_numeric($subtotalRaw) ? (float)$subtotalRaw : 0.0;
            $shipping = is_numeric($shippingRaw) ? (float)$shippingRaw : 0.0;
            $total = is_numeric($totalRaw) ? (float)$totalRaw : ($subtotal + $shipping);
            if ($subtotal < 0) $subtotal = 0.0;
            if ($shipping < 0) $shipping = 0.0;
            if ($total < 0) $total = 0.0;

            $orders[] = [
                'id' => $orderId,
                'role' => $role,
                'username' => trim((string)($row['username'] ?? '')),
                'customer' => [
                    'fullName' => trim((string)($row['customer_name'] ?? '')),
                    'email' => trim((string)($row['customer_email'] ?? '')),
                    'phone' => trim((string)($row['customer_phone'] ?? '')),
                    'address' => trim((string)($row['customer_address'] ?? '')),
                    'city' => trim((string)($row['customer_city'] ?? '')),
                    'zipCode' => trim((string)($row['customer_zip_code'] ?? ''))
                ],
                'items' => isset($itemsByOrder[$orderId]) && is_array($itemsByOrder[$orderId]) ? $itemsByOrder[$orderId] : [],
                'summary' => [
                    'subtotal' => round($subtotal, 2),
                    'shipping' => round($shipping, 2),
                    'total' => round($total, 2)
                ],
                'status' => $status,
                'createdAt' => db_to_iso($row['created_at'] ?? '')
            ];
        }
        return $orders;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_orders(array $orders): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_ORDERS);
        $itemsTable = db_quote_identifier(DB_TABLE_ORDER_ITEMS);
        $metaTable = db_quote_identifier(DB_TABLE_META);

        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $pdo->exec("DELETE FROM {$itemsTable}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (order_id, order_seq, role, username, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip_code, subtotal_amount, shipping_amount, total_amount, item_count, created_at)
            VALUES
            (:order_id, :order_seq, :role, :username, :status, :customer_name, :customer_email, :customer_phone, :customer_address, :customer_city, :customer_zip_code, :subtotal_amount, :shipping_amount, :total_amount, :item_count, :created_at)"
        );
        $itemsStmt = $pdo->prepare(
            "INSERT INTO {$itemsTable}
            (order_id, line_no, product_id, product_name, product_brand, size, color, qty, unit_price, line_total, created_at)
            VALUES
            (:order_id, :line_no, :product_id, :product_name, :product_brand, :size, :color, :qty, :unit_price, :line_total, :created_at)"
        );

        $usedIds = [];
        $usedSeq = [];
        $maxSeq = 0;

        foreach ($orders as $rawOrder) {
            if (!is_array($rawOrder)) continue;
            $order = $rawOrder;
            $orderId = trim((string)($order['id'] ?? ''));
            $seq = parse_order_seq($orderId);

            if ($seq === null || $seq <= 0 || isset($usedSeq[$seq]) || ($orderId !== '' && isset($usedIds[$orderId]))) {
                do {
                    $maxSeq += 1;
                    $seq = $maxSeq;
                    $orderId = format_order_id($seq);
                } while (isset($usedSeq[$seq]) || isset($usedIds[$orderId]));
                $order['id'] = $orderId;
            } else {
                if ($seq > $maxSeq) $maxSeq = $seq;
            }

            $usedSeq[$seq] = true;
            $usedIds[$orderId] = true;

            $status = trim((string)($order['status'] ?? 'Pending'));
            if ($status === '') $status = 'Pending';
            $order['status'] = $status;

            $createdAt = trim((string)($order['createdAt'] ?? ''));
            if ($createdAt === '') $createdAt = date('c');
            $order['createdAt'] = $createdAt;

            $customer = isset($order['customer']) && is_array($order['customer']) ? $order['customer'] : [];
            $items = isset($order['items']) && is_array($order['items']) ? $order['items'] : [];
            $summary = isset($order['summary']) && is_array($order['summary']) ? $order['summary'] : [];

            $customerName = trim((string)($customer['fullName'] ?? $customer['name'] ?? ''));
            if ($customerName === '') {
                $customerName = trim((string)($order['username'] ?? ''));
            }
            $customerEmail = trim((string)($customer['email'] ?? ''));
            $customerPhone = trim((string)($customer['phone'] ?? ''));
            $customerAddress = trim((string)($customer['address'] ?? ''));
            $customerCity = trim((string)($customer['city'] ?? ''));
            $customerZip = trim((string)($customer['zipCode'] ?? $customer['zip_code'] ?? ''));

            $computedSubtotal = 0.0;
            $lineNo = 0;
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                $lineNo += 1;

                $qtyRaw = $item['qty'] ?? $item['quantity'] ?? 1;
                $qty = is_numeric($qtyRaw) ? (int)$qtyRaw : 1;
                if ($qty <= 0) $qty = 1;

                $unitRaw = $item['unitPrice'] ?? $item['price'] ?? 0;
                $unitPrice = is_numeric($unitRaw) ? (float)$unitRaw : 0.0;
                if ($unitPrice < 0) $unitPrice = 0.0;

                $lineRaw = $item['lineTotal'] ?? $item['total'] ?? null;
                $lineTotal = is_numeric($lineRaw) ? (float)$lineRaw : ($unitPrice * $qty);
                if ($lineTotal < 0) $lineTotal = 0.0;

                $computedSubtotal += $lineTotal;

                $itemsStmt->execute([
                    ':order_id' => $orderId,
                    ':line_no' => $lineNo,
                    ':product_id' => trim((string)($item['productId'] ?? $item['id'] ?? '')),
                    ':product_name' => trim((string)($item['productName'] ?? $item['name'] ?? '')),
                    ':product_brand' => trim((string)($item['productBrand'] ?? $item['brand'] ?? '')),
                    ':size' => trim((string)($item['size'] ?? '')),
                    ':color' => trim((string)($item['color'] ?? '')),
                    ':qty' => $qty,
                    ':unit_price' => round($unitPrice, 2),
                    ':line_total' => round($lineTotal, 2),
                    ':created_at' => db_to_datetime($createdAt)
                ]);
            }

            $summarySubtotalRaw = $summary['subtotal'] ?? null;
            $summaryShippingRaw = $summary['shipping'] ?? null;
            $summaryTotalRaw = $summary['total'] ?? null;

            $subtotalAmount = is_numeric($summarySubtotalRaw) ? (float)$summarySubtotalRaw : $computedSubtotal;
            $shippingAmount = is_numeric($summaryShippingRaw) ? (float)$summaryShippingRaw : 0.0;
            $totalAmount = is_numeric($summaryTotalRaw) ? (float)$summaryTotalRaw : ($subtotalAmount + $shippingAmount);
            if ($subtotalAmount < 0) $subtotalAmount = 0.0;
            if ($shippingAmount < 0) $shippingAmount = 0.0;
            if ($totalAmount < 0) $totalAmount = 0.0;
            $itemCount = count($items);

            $stmt->execute([
                ':order_id' => $orderId,
                ':order_seq' => $seq,
                ':role' => trim((string)($order['role'] ?? 'customer')) ?: 'customer',
                ':username' => trim((string)($order['username'] ?? '')),
                ':status' => $status,
                ':customer_name' => $customerName,
                ':customer_email' => $customerEmail,
                ':customer_phone' => $customerPhone,
                ':customer_address' => $customerAddress,
                ':customer_city' => $customerCity,
                ':customer_zip_code' => $customerZip,
                ':subtotal_amount' => round($subtotalAmount, 2),
                ':shipping_amount' => round($shippingAmount, 2),
                ':total_amount' => round($totalAmount, 2),
                ':item_count' => $itemCount > 0 ? $itemCount : 0,
                ':created_at' => db_to_datetime($createdAt)
            ]);
        }

        $metaStmt = $pdo->prepare(
            "INSERT INTO {$metaTable} (meta_key, meta_value)
             VALUES (:meta_key, :meta_value)
             ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), updated_at = CURRENT_TIMESTAMP"
        );
        $metaStmt->execute([
            ':meta_key' => DB_META_ORDER_SEQ,
            ':meta_value' => json_encode(max(0, $maxSeq))
        ]);

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_cart_map(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_CARTS);
        $rows = $pdo->query(
            "SELECT username_key, item_key, product_id, qty, size, color
             FROM {$table}
             ORDER BY username_key ASC, added_at ASC"
        )->fetchAll();
        $map = [];
        $seen = [];

        foreach ($rows as $row) {
            $usernameKey = normalize_cart_user_key((string)($row['username_key'] ?? ''));
            if ($usernameKey === '') continue;

            $productId = trim((string)($row['product_id'] ?? ''));
            if ($productId === '') continue;

            $size = trim((string)($row['size'] ?? ''));
            $color = trim((string)($row['color'] ?? ''));
            $itemKey = trim((string)($row['item_key'] ?? ''));
            if ($itemKey === '') $itemKey = $productId . '|' . $size . '|' . $color;
            if ($itemKey === '') continue;

            $rawQty = $row['qty'] ?? 1;
            $qty = is_numeric($rawQty) ? (int)$rawQty : 1;
            if ($qty <= 0) $qty = 1;

            $item = [
                'key' => $itemKey,
                'productId' => $productId,
                'qty' => $qty,
                'size' => $size,
                'color' => $color
            ];

            if (!isset($map[$usernameKey]) || !is_array($map[$usernameKey])) $map[$usernameKey] = [];
            if (!isset($seen[$usernameKey]) || !is_array($seen[$usernameKey])) $seen[$usernameKey] = [];
            if (isset($seen[$usernameKey][$itemKey])) continue;
            $seen[$usernameKey][$itemKey] = true;
            $map[$usernameKey][] = $item;
        }

        return $map;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_cart_map(array $map): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_CARTS);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (username_key, item_key, product_id, qty, size, color, added_at)
             VALUES (:username_key, :item_key, :product_id, :qty, :size, :color, :added_at)"
        );

        foreach ($map as $username => $items) {
            $usernameKey = normalize_cart_user_key((string)$username);
            if ($usernameKey === '' || !is_array($items)) continue;

            $seen = [];
            foreach ($items as $rawItem) {
                if (!is_array($rawItem)) continue;

                $productId = trim((string)($rawItem['productId'] ?? ''));
                if ($productId === '') continue;

                $size = trim((string)($rawItem['size'] ?? ''));
                $color = trim((string)($rawItem['color'] ?? ''));
                $itemKey = trim((string)($rawItem['key'] ?? ''));
                if ($itemKey === '') $itemKey = $productId . '|' . $size . '|' . $color;
                if ($itemKey === '' || isset($seen[$itemKey])) continue;
                $seen[$itemKey] = true;

                $rawQty = $rawItem['qty'] ?? 1;
                $qty = is_numeric($rawQty) ? (int)$rawQty : 1;
                if ($qty <= 0) $qty = 1;

                $stmt->execute([
                    ':username_key' => $usernameKey,
                    ':item_key' => $itemKey,
                    ':product_id' => $productId,
                    ':qty' => $qty,
                    ':size' => $size,
                    ':color' => $color,
                    ':added_at' => date('Y-m-d H:i:s')
                ]);
            }
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_wishlist_map(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_WISHLISTS);
        $rows = $pdo->query(
            "SELECT username_key, product_id FROM {$table} ORDER BY username_key ASC, added_at ASC"
        )->fetchAll();
        $map = [];
        foreach ($rows as $row) {
            $username = normalize_username((string)($row['username_key'] ?? ''));
            $productId = trim((string)($row['product_id'] ?? ''));
            if ($username === '' || $productId === '') continue;
            if (!isset($map[$username]) || !is_array($map[$username])) $map[$username] = [];
            if (!in_array($productId, $map[$username], true)) $map[$username][] = $productId;
        }
        return $map;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_wishlist_map(array $map): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_WISHLISTS);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (username_key, product_id, added_at) VALUES (:username_key, :product_id, :added_at)"
        );

        foreach ($map as $username => $items) {
            $key = normalize_username((string)$username);
            if ($key === '' || !is_array($items)) continue;
            $seen = [];
            foreach ($items as $item) {
                $productId = trim((string)$item);
                if ($productId === '' || isset($seen[$productId])) continue;
                $seen[$productId] = true;
                $stmt->execute([
                    ':username_key' => $key,
                    ':product_id' => $productId,
                    ':added_at' => date('Y-m-d H:i:s')
                ]);
            }
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function db_read_messages(): array {
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_MESSAGES);
        $rows = $pdo->query(
            "SELECT message_id, name, email, message, created_at FROM {$table} ORDER BY created_at DESC"
        )->fetchAll();
        $messages = [];
        foreach ($rows as $row) {
            $messages[] = [
                'id' => (string)($row['message_id'] ?? ''),
                'name' => (string)($row['name'] ?? ''),
                'email' => (string)($row['email'] ?? ''),
                'message' => (string)($row['message'] ?? ''),
                'createdAt' => db_to_iso($row['created_at'] ?? '')
            ];
        }
        return $messages;
    } catch (Throwable $e) {
        return [];
    }
}

function db_write_messages(array $messages): bool {
    $pdo = null;
    try {
        $pdo = db_connection();
        $table = db_quote_identifier(DB_TABLE_MESSAGES);
        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (message_id, name, email, message, created_at)
             VALUES (:message_id, :name, :email, :message, :created_at)"
        );

        foreach ($messages as $msg) {
            if (!is_array($msg)) continue;
            $id = trim((string)($msg['id'] ?? ''));
            if ($id === '') $id = uniqid('msg_', true);
            $stmt->execute([
                ':message_id' => $id,
                ':name' => trim((string)($msg['name'] ?? '')),
                ':email' => trim((string)($msg['email'] ?? '')),
                ':message' => trim((string)($msg['message'] ?? '')),
                ':created_at' => db_to_datetime((string)($msg['createdAt'] ?? ''))
            ]);
        }

        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();
        return false;
    }
}

function read_json_file(string $file, $default) {
    if ($file === USERS_FILE) return db_read_users();
    if ($file === PROFILES_FILE) return db_read_profiles();
    if ($file === ADMIN_PRODUCTS_FILE) return db_read_admin_products();
    if ($file === REMOVED_BASE_FILE) return db_read_removed_base_ids();
    if ($file === ORDERS_FILE) return db_read_orders();
    if ($file === CARTS_FILE) return db_read_cart_map();
    if ($file === WISHLISTS_FILE) return db_read_wishlist_map();
    if ($file === MESSAGES_FILE) return db_read_messages();
    return $default;
}

function write_json_file(string $file, $data): bool {
    if ($file === USERS_FILE) return db_write_users(is_array($data) ? array_values($data) : []);
    if ($file === PROFILES_FILE) return db_write_profiles(is_array($data) ? $data : []);
    if ($file === ADMIN_PRODUCTS_FILE) return db_write_admin_products(is_array($data) ? array_values($data) : []);
    if ($file === REMOVED_BASE_FILE) return db_write_removed_base_ids(is_array($data) ? $data : []);
    if ($file === ORDERS_FILE) return db_write_orders(is_array($data) ? array_values($data) : []);
    if ($file === CARTS_FILE) return db_write_cart_map(is_array($data) ? $data : []);
    if ($file === WISHLISTS_FILE) return db_write_wishlist_map(is_array($data) ? $data : []);
    if ($file === MESSAGES_FILE) return db_write_messages(is_array($data) ? array_values($data) : []);
    return false;
}

function read_order_seq(): int {
    $metaSeq = (int)db_read_meta(DB_META_ORDER_SEQ, 0);
    $maxSeq = db_max_order_seq();
    $seq = max($metaSeq, $maxSeq);
    return $seq > 0 ? $seq : 0;
}

function write_order_seq(int $seq): bool {
    $target = max(0, $seq, db_max_order_seq());
    return db_write_meta(DB_META_ORDER_SEQ, $target);
}

function get_users(): array {
    $users = read_json_file(USERS_FILE, []);
    return is_array($users) ? $users : [];
}

function save_users(array $users): bool {
    return write_json_file(USERS_FILE, array_values($users));
}

function get_profiles(): array {
    $profiles = read_json_file(PROFILES_FILE, []);
    return is_array($profiles) ? $profiles : [];
}

function save_profiles(array $profiles): bool {
    return write_json_file(PROFILES_FILE, $profiles);
}

function get_admin_products(): array {
    $items = read_json_file(ADMIN_PRODUCTS_FILE, []);
    return is_array($items) ? $items : [];
}

function save_admin_products(array $products): bool {
    return write_json_file(ADMIN_PRODUCTS_FILE, array_values($products));
}

function get_removed_base_ids(): array {
    $ids = read_json_file(REMOVED_BASE_FILE, []);
    if (!is_array($ids)) return [];
    return array_values(array_unique(array_filter(array_map('strval', $ids))));
}

function save_removed_base_ids(array $ids): bool {
    $clean = array_values(array_unique(array_filter(array_map('strval', $ids))));
    return write_json_file(REMOVED_BASE_FILE, $clean);
}

function get_orders(): array {
    $orders = read_json_file(ORDERS_FILE, []);
    return is_array($orders) ? $orders : [];
}

function save_orders(array $orders): bool {
    return write_json_file(ORDERS_FILE, array_values($orders));
}

function get_cart_map(): array {
    $map = read_json_file(CARTS_FILE, []);
    return is_array($map) ? $map : [];
}

function save_cart_map(array $map): bool {
    return write_json_file(CARTS_FILE, $map);
}

function get_wishlist_map(): array {
    $map = read_json_file(WISHLISTS_FILE, []);
    return is_array($map) ? $map : [];
}

function save_wishlist_map(array $map): bool {
    return write_json_file(WISHLISTS_FILE, $map);
}

function with_updated_order_seq_from_orders(array $orders): int {
    $seq = read_order_seq();
    foreach ($orders as $order) {
        $found = parse_order_seq((string)($order['id'] ?? ''));
        if ($found !== null && $found > $seq) $seq = $found;
    }
    return $seq;
}

function ensure_role_profile(array &$profiles, string $role, string $username): array {
    $key = normalize_username($username);
    $existing = isset($profiles[$key]) && is_array($profiles[$key]) ? $profiles[$key] : [];

    $defaults = [];
    if ($role === 'admin') {
        $defaults = [
            'name' => 'Admin',
            'email' => 'admin@velvetvogue.com',
            'phone' => '011-000-0001',
            'address' => 'Velvet Vogue Head Office',
            'city' => 'Colombo',
            'zipCode' => '00100',
            'image' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80'
        ];
    } elseif ($role === 'productManager') {
        $defaults = [
            'name' => 'Product Manager',
            'email' => 'manager@velvetvogue.com',
            'phone' => '011-000-0002',
            'address' => 'Velvet Vogue Operations',
            'city' => 'Colombo',
            'zipCode' => '00200',
            'image' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
        ];
    }

    $next = array_merge($defaults, $existing);
    if (($next['name'] ?? '') === '') $next['name'] = $username;
    $next['role'] = $role;
    $next['updatedAt'] = date('c');
    $profiles[$key] = $next;
    return $next;
}

$action = (string)($_GET['action'] ?? $_POST['action'] ?? 'health');
$method = (string)($_SERVER['REQUEST_METHOD'] ?? 'GET');
$body = read_json_body();

if ($action === 'health') {
    json_response([
        'ok' => true,
        'message' => 'PHP API is running',
        'timestamp' => date('c')
    ]);
}

if ($action === 'bootstrap') {
    json_response([
        'ok' => true,
        'data' => [
            'registeredUsers' => get_users(),
            'profiles' => get_profiles(),
            'adminProducts' => get_admin_products(),
            'removedBaseProducts' => get_removed_base_ids(),
            'orders' => get_orders(),
            'orderSeq' => with_updated_order_seq_from_orders(get_orders()),
            'cartMap' => (object)get_cart_map(),
            'wishlistMap' => (object)get_wishlist_map()
        ]
    ]);
}

if ($method !== 'POST' && !in_array($action, ['get_cart', 'get_wishlist', 'get_orders', 'get_users'], true)) {
    json_response(['ok' => false, 'error' => 'Only POST allowed for this action'], 405);
}

if ($action === 'contact') {
    $name = trim((string)($body['name'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $message = trim((string)($body['message'] ?? ''));

    if ($name === '' || $email === '' || $message === '') {
        json_response(['ok' => false, 'error' => 'Missing required fields'], 422);
    }

    $messages = read_json_file(MESSAGES_FILE, []);
    if (!is_array($messages)) $messages = [];

    $messages[] = [
        'id' => uniqid('msg_', true),
        'name' => $name,
        'email' => $email,
        'message' => $message,
        'createdAt' => date('c')
    ];

    if (!write_json_file(MESSAGES_FILE, $messages)) {
        json_response(['ok' => false, 'error' => 'Failed to save message'], 500);
    }

    json_response(['ok' => true, 'message' => 'Message saved']);
}

if ($action === 'register' || $action === 'add_customer') {
    $name = trim((string)($body['name'] ?? ''));
    $username = trim((string)($body['username'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $phone = trim((string)($body['phone'] ?? ''));
    $password = trim((string)($body['password'] ?? ''));
    $role = (string)($body['role'] ?? 'customer');
    if ($role !== 'customer') $role = 'customer';

    if ($name === '' || $username === '' || $email === '' || $phone === '' || $password === '') {
        json_response(['ok' => false, 'error' => 'Missing required fields'], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'error' => 'Invalid email'], 422);
    }

    if (strlen($password) < 3) {
        json_response(['ok' => false, 'error' => 'Password must be at least 3 characters'], 422);
    }

    $usernameKey = normalize_username($username);
    if ($usernameKey === normalize_username(AUTH_ADMIN_USER) || $usernameKey === normalize_username(AUTH_PM_USER)) {
        json_response(['ok' => false, 'error' => 'This username is reserved'], 409);
    }

    $users = get_users();
    foreach ($users as $user) {
      if (normalize_username((string)($user['username'] ?? '')) === $usernameKey) {
          json_response(['ok' => false, 'error' => 'Username already exists'], 409);
      }
    }

    $newUser = [
        'name' => $name,
        'username' => $username,
        'email' => $email,
        'phone' => $phone,
        'password' => $password,
        'role' => 'customer',
        'registeredAt' => date('c')
    ];

    $addedBy = trim((string)($body['addedBy'] ?? ''));
    if ($addedBy !== '') $newUser['addedBy'] = $addedBy;

    $users[] = $newUser;
    if (!save_users($users)) {
        json_response(['ok' => false, 'error' => 'Failed to save user'], 500);
    }

    $profiles = get_profiles();
    $current = isset($profiles[$usernameKey]) && is_array($profiles[$usernameKey]) ? $profiles[$usernameKey] : [];
    $profiles[$usernameKey] = array_merge($current, [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'address' => (string)($body['address'] ?? ''),
        'city' => (string)($body['city'] ?? ''),
        'zipCode' => (string)($body['zipCode'] ?? ''),
        'role' => 'customer',
        'updatedAt' => date('c')
    ]);

    if (!save_profiles($profiles)) {
        json_response(['ok' => false, 'error' => 'Failed to save profile'], 500);
    }

    json_response([
        'ok' => true,
        'message' => 'Customer saved',
        'user' => $newUser,
        'profile' => $profiles[$usernameKey]
    ]);
}

if ($action === 'login') {
    $role = (string)($body['role'] ?? 'customer');
    $username = trim((string)($body['username'] ?? ''));
    $password = trim((string)($body['password'] ?? ''));

    if ($username === '' || $password === '') {
        json_response(['ok' => false, 'error' => 'Username and password are required'], 422);
    }

    $profiles = get_profiles();

    if ($role === 'admin') {
        if ($username !== AUTH_ADMIN_USER || $password !== AUTH_ADMIN_PASS) {
            json_response(['ok' => false, 'error' => 'Invalid credentials'], 401);
        }
        $profile = ensure_role_profile($profiles, 'admin', $username);
        save_profiles($profiles);
        json_response(['ok' => true, 'auth' => ['role' => 'admin', 'username' => $username, 'loggedInAt' => date('c')], 'profile' => $profile]);
    }

    if ($role === 'productManager') {
        if ($username !== AUTH_PM_USER || $password !== AUTH_PM_PASS) {
            json_response(['ok' => false, 'error' => 'Invalid credentials'], 401);
        }
        $profile = ensure_role_profile($profiles, 'productManager', $username);
        save_profiles($profiles);
        json_response(['ok' => true, 'auth' => ['role' => 'productManager', 'username' => $username, 'loggedInAt' => date('c')], 'profile' => $profile]);
    }

    $users = get_users();
    $matched = null;
    foreach ($users as $user) {
        if ((string)($user['role'] ?? 'customer') !== 'customer') continue;
        if (normalize_username((string)($user['username'] ?? '')) !== normalize_username($username)) continue;
        if ((string)($user['password'] ?? '') !== $password) continue;
        $matched = $user;
        break;
    }

    if (!$matched) {
        json_response(['ok' => false, 'error' => 'Invalid credentials'], 401);
    }

    $key = normalize_username((string)$matched['username']);
    $profile = isset($profiles[$key]) && is_array($profiles[$key]) ? $profiles[$key] : [];
    if (!$profile) {
        $profile = [
            'name' => (string)($matched['name'] ?? $matched['username'] ?? ''),
            'email' => (string)($matched['email'] ?? ''),
            'phone' => (string)($matched['phone'] ?? ''),
            'address' => '',
            'city' => '',
            'zipCode' => '',
            'role' => 'customer',
            'updatedAt' => date('c')
        ];
        $profiles[$key] = $profile;
        save_profiles($profiles);
    }

    json_response([
        'ok' => true,
        'auth' => [
            'role' => 'customer',
            'username' => (string)($matched['username'] ?? $username),
            'loggedInAt' => date('c')
        ],
        'user' => $matched,
        'profile' => $profile
    ]);
}

if ($action === 'save_profile') {
    $username = trim((string)($body['username'] ?? ''));
    if ($username === '') {
        json_response(['ok' => false, 'error' => 'Username is required'], 422);
    }

    $role = trim((string)($body['role'] ?? ''));
    $profileData = isset($body['profile']) && is_array($body['profile']) ? $body['profile'] : $body;
    $profile = sanitize_profile($profileData);

    $key = normalize_username($username);
    $profiles = get_profiles();
    $current = isset($profiles[$key]) && is_array($profiles[$key]) ? $profiles[$key] : [];

    $next = array_merge($current, $profile);
    if (($next['name'] ?? '') === '') $next['name'] = $username;
    if ($role !== '') $next['role'] = $role;
    $next['updatedAt'] = date('c');
    $profiles[$key] = $next;

    if (!save_profiles($profiles)) {
        json_response(['ok' => false, 'error' => 'Failed to save profile'], 500);
    }

    $users = get_users();
    $usersChanged = false;
    foreach ($users as &$user) {
        if (normalize_username((string)($user['username'] ?? '')) !== $key) continue;
        if ((string)($user['role'] ?? 'customer') !== 'customer') continue;
        $user['name'] = (string)($next['name'] ?? $user['name'] ?? '');
        $user['email'] = (string)($next['email'] ?? $user['email'] ?? '');
        $user['phone'] = (string)($next['phone'] ?? $user['phone'] ?? '');
        if (isset($next['address'])) $user['address'] = (string)$next['address'];
        if (isset($next['city'])) $user['city'] = (string)$next['city'];
        if (isset($next['zipCode'])) $user['zipCode'] = (string)$next['zipCode'];
        $usersChanged = true;
        break;
    }
    unset($user);

    if ($usersChanged && !save_users($users)) {
        json_response(['ok' => false, 'error' => 'Profile saved but user sync failed'], 500);
    }

    json_response(['ok' => true, 'profile' => $next]);
}

if ($action === 'add_product') {
    $product = isset($body['product']) && is_array($body['product']) ? $body['product'] : [];
    $id = trim((string)($product['id'] ?? ''));
    if ($id === '') {
        json_response(['ok' => false, 'error' => 'Product id is required'], 422);
    }

    $products = get_admin_products();
    foreach ($products as $item) {
        if ((string)($item['id'] ?? '') === $id) {
            json_response(['ok' => false, 'error' => 'Product id already exists'], 409);
        }
    }

    $products[] = $product;
    if (!save_admin_products($products)) {
        json_response(['ok' => false, 'error' => 'Failed to save product'], 500);
    }

    json_response(['ok' => true, 'product' => $product]);
}

if ($action === 'remove_product') {
    $id = trim((string)($body['id'] ?? ''));
    if ($id === '') {
        json_response(['ok' => false, 'error' => 'Product id is required'], 422);
    }

    $products = get_admin_products();
    $nextProducts = array_values(array_filter($products, static function ($item) use ($id) {
        return (string)($item['id'] ?? '') !== $id;
    }));

    if (count($nextProducts) !== count($products)) {
        if (!save_admin_products($nextProducts)) {
            json_response(['ok' => false, 'error' => 'Failed to update products'], 500);
        }
    }

    $removedBase = get_removed_base_ids();
    if (!in_array($id, $removedBase, true)) {
        $removedBase[] = $id;
        if (!save_removed_base_ids($removedBase)) {
            json_response(['ok' => false, 'error' => 'Failed to update removed products'], 500);
        }
    }

    $cartMap = get_cart_map();
    $cartChanged = false;
    foreach ($cartMap as $userKey => $items) {
        if (!is_array($items)) continue;
        $next = array_values(array_filter($items, static function ($item) use ($id) {
            if (!is_array($item)) return false;
            return (string)($item['productId'] ?? '') !== $id;
        }));
        if (count($next) !== count($items)) {
            $cartMap[$userKey] = $next;
            $cartChanged = true;
        }
    }
    if ($cartChanged && !save_cart_map($cartMap)) {
        json_response(['ok' => false, 'error' => 'Failed to update cart map'], 500);
    }

    $wishMap = get_wishlist_map();
    $wishChanged = false;
    foreach ($wishMap as $userKey => $ids) {
        if (!is_array($ids)) continue;
        $next = array_values(array_filter(array_map('strval', $ids), static function ($v) use ($id) {
            return $v !== $id && trim($v) !== '';
        }));
        if (count($next) !== count($ids)) {
            $wishMap[$userKey] = $next;
            $wishChanged = true;
        }
    }
    if ($wishChanged && !save_wishlist_map($wishMap)) {
        json_response(['ok' => false, 'error' => 'Failed to update wishlist map'], 500);
    }

    json_response(['ok' => true, 'removedId' => $id]);
}

if ($action === 'order' || $action === 'place_order') {
    $orders = get_orders();
    $seq = with_updated_order_seq_from_orders($orders);

    $order = isset($body['order']) && is_array($body['order']) ? $body['order'] : [];
    if (!$order) {
        $order = [
            'id' => '',
            'role' => (string)($body['role'] ?? 'customer'),
            'username' => (string)($body['username'] ?? 'guest'),
            'customer' => isset($body['customer']) && is_array($body['customer']) ? $body['customer'] : [],
            'items' => isset($body['items']) && is_array($body['items']) ? $body['items'] : [],
            'summary' => isset($body['summary']) && is_array($body['summary']) ? $body['summary'] : [],
            'status' => (string)($body['status'] ?? 'Pending'),
            'createdAt' => (string)($body['createdAt'] ?? date('c'))
        ];
    }

    if (!isset($order['items']) || !is_array($order['items']) || count($order['items']) === 0) {
        json_response(['ok' => false, 'error' => 'Order items are required'], 422);
    }

    $incomingId = trim((string)($order['id'] ?? ''));
    $incomingSeq = parse_order_seq($incomingId);
    $existingIds = [];
    foreach ($orders as $savedOrder) {
        $savedId = (string)($savedOrder['id'] ?? '');
        if ($savedId !== '') $existingIds[$savedId] = true;
    }

    $targetSeq = $incomingSeq !== null ? $incomingSeq : ($seq + 1);
    if ($targetSeq > $seq) $seq = $targetSeq;

    $orderId = format_order_id($targetSeq);
    while (isset($existingIds[$orderId])) {
        $seq += 1;
        $orderId = format_order_id($seq);
    }
    $order['id'] = $orderId;

    if (!isset($order['createdAt']) || trim((string)$order['createdAt']) === '') {
        $order['createdAt'] = date('c');
    }
    if (!isset($order['status']) || trim((string)$order['status']) === '') {
        $order['status'] = 'Pending';
    }

    array_unshift($orders, $order);

    if (!save_orders($orders) || !write_order_seq($seq)) {
        json_response(['ok' => false, 'error' => 'Failed to save order'], 500);
    }

    json_response(['ok' => true, 'message' => 'Order saved', 'order' => $order, 'orderSeq' => $seq]);
}

if ($action === 'update_order_status') {
    $id = trim((string)($body['id'] ?? ''));
    $status = trim((string)($body['status'] ?? 'Pending'));
    if ($id === '') {
        json_response(['ok' => false, 'error' => 'Order id is required'], 422);
    }

    $allowed = ['Pending', 'Shipped', 'Delivered'];
    if (!in_array($status, $allowed, true)) $status = 'Pending';

    $orders = get_orders();
    $found = false;
    foreach ($orders as &$order) {
        if ((string)($order['id'] ?? '') !== $id) continue;
        $order['status'] = $status;
        $found = true;
        break;
    }
    unset($order);

    if (!$found) {
        json_response(['ok' => false, 'error' => 'Order not found'], 404);
    }

    if (!save_orders($orders)) {
        json_response(['ok' => false, 'error' => 'Failed to update order'], 500);
    }

    json_response(['ok' => true, 'id' => $id, 'status' => $status]);
}

if ($action === 'set_cart') {
    $userKeyRaw = trim((string)($body['userKey'] ?? $body['username'] ?? ''));
    $userKey = normalize_cart_user_key($userKeyRaw);
    if ($userKey === '') {
        json_response(['ok' => false, 'error' => 'Valid userKey is required'], 422);
    }

    $items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
    $bucket = [];
    foreach ($items as $rawItem) {
        if (!is_array($rawItem)) continue;
        $productId = trim((string)($rawItem['productId'] ?? ''));
        if ($productId === '') continue;

        $size = trim((string)($rawItem['size'] ?? ''));
        $color = trim((string)($rawItem['color'] ?? ''));
        $itemKey = trim((string)($rawItem['key'] ?? ''));
        if ($itemKey === '') $itemKey = $productId . '|' . $size . '|' . $color;
        if ($itemKey === '') continue;

        $rawQty = $rawItem['qty'] ?? 1;
        $qty = is_numeric($rawQty) ? (int)$rawQty : 1;
        if ($qty <= 0) $qty = 1;

        if (!isset($bucket[$itemKey])) {
            $bucket[$itemKey] = [
                'key' => $itemKey,
                'productId' => $productId,
                'qty' => $qty,
                'size' => $size,
                'color' => $color
            ];
            continue;
        }
        $bucket[$itemKey]['qty'] += $qty;
    }
    $cleanItems = array_values($bucket);

    $map = get_cart_map();
    $map[$userKey] = $cleanItems;
    if (!save_cart_map($map)) {
        json_response(['ok' => false, 'error' => 'Failed to save cart'], 500);
    }

    json_response(['ok' => true, 'userKey' => $userKey, 'items' => $cleanItems]);
}

if ($action === 'get_cart') {
    $userKeyRaw = trim((string)($body['userKey'] ?? $body['username'] ?? ($_GET['userKey'] ?? $_GET['username'] ?? '')));
    $userKey = normalize_cart_user_key($userKeyRaw);
    if ($userKey === '') {
        json_response(['ok' => false, 'error' => 'Valid userKey is required'], 422);
    }
    $map = get_cart_map();
    $items = isset($map[$userKey]) && is_array($map[$userKey]) ? array_values($map[$userKey]) : [];
    json_response(['ok' => true, 'userKey' => $userKey, 'items' => $items]);
}

if ($action === 'set_wishlist') {
    $username = trim((string)($body['username'] ?? ''));
    if ($username === '') {
        json_response(['ok' => false, 'error' => 'Username is required'], 422);
    }

    $items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
    $cleanItems = array_values(array_unique(array_filter(array_map('strval', $items), static function ($v) {
        return trim($v) !== '';
    })));

    $map = get_wishlist_map();
    $map[normalize_username($username)] = $cleanItems;

    if (!save_wishlist_map($map)) {
        json_response(['ok' => false, 'error' => 'Failed to save wishlist'], 500);
    }

    json_response(['ok' => true, 'username' => $username, 'items' => $cleanItems]);
}

if ($action === 'toggle_wishlist') {
    $username = trim((string)($body['username'] ?? ''));
    $productId = trim((string)($body['productId'] ?? ''));
    if ($username === '' || $productId === '') {
        json_response(['ok' => false, 'error' => 'Username and productId are required'], 422);
    }

    $key = normalize_username($username);
    $map = get_wishlist_map();
    $items = isset($map[$key]) && is_array($map[$key]) ? array_values(array_map('strval', $map[$key])) : [];

    $active = false;
    if (in_array($productId, $items, true)) {
        $items = array_values(array_filter($items, static function ($v) use ($productId) {
            return $v !== $productId;
        }));
        $active = false;
    } else {
        $items[] = $productId;
        $items = array_values(array_unique($items));
        $active = true;
    }

    $map[$key] = $items;
    if (!save_wishlist_map($map)) {
        json_response(['ok' => false, 'error' => 'Failed to toggle wishlist'], 500);
    }

    json_response(['ok' => true, 'active' => $active, 'items' => $items]);
}

if ($action === 'get_wishlist') {
    $username = trim((string)($body['username'] ?? ($_GET['username'] ?? '')));
    if ($username === '') {
        json_response(['ok' => false, 'error' => 'Username is required'], 422);
    }
    $map = get_wishlist_map();
    $items = isset($map[normalize_username($username)]) && is_array($map[normalize_username($username)]) ? $map[normalize_username($username)] : [];
    json_response(['ok' => true, 'items' => array_values(array_unique(array_map('strval', $items)))]);
}

if ($action === 'get_orders') {
    json_response(['ok' => true, 'orders' => get_orders(), 'orderSeq' => with_updated_order_seq_from_orders(get_orders())]);
}

if ($action === 'get_users') {
    json_response(['ok' => true, 'users' => get_users()]);
}

if ($action === 'sync_state') {
    $saved = true;

    if (isset($body['registeredUsers']) && is_array($body['registeredUsers'])) {
        $saved = $saved && save_users($body['registeredUsers']);
    }
    if (isset($body['profiles']) && is_array($body['profiles'])) {
        $saved = $saved && save_profiles($body['profiles']);
    }
    if (isset($body['adminProducts']) && is_array($body['adminProducts'])) {
        $saved = $saved && save_admin_products($body['adminProducts']);
    }
    if (isset($body['removedBaseProducts']) && is_array($body['removedBaseProducts'])) {
        $saved = $saved && save_removed_base_ids($body['removedBaseProducts']);
    }
    if (isset($body['orders']) && is_array($body['orders'])) {
        $saved = $saved && save_orders($body['orders']);
        $seq = with_updated_order_seq_from_orders($body['orders']);
        $saved = $saved && write_order_seq($seq);
    }
    if (isset($body['cartMap']) && is_array($body['cartMap'])) {
        $saved = $saved && save_cart_map($body['cartMap']);
    }
    if (isset($body['wishlistMap']) && is_array($body['wishlistMap'])) {
        $saved = $saved && save_wishlist_map($body['wishlistMap']);
    }

    if (!$saved) {
        json_response(['ok' => false, 'error' => 'Failed to sync state'], 500);
    }

    json_response(['ok' => true, 'message' => 'State synced']);
}

json_response(['ok' => false, 'error' => 'Unknown action'], 404);

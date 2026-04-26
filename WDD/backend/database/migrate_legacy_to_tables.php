<?php
declare(strict_types=1);

const DB_DEFAULT_HOST = '127.0.0.1';
const DB_DEFAULT_PORT = 3306;
const DB_DEFAULT_NAME = 'wdd_store';
const DB_DEFAULT_USER = 'root';
const DB_DEFAULT_PASS = '';
const DB_DEFAULT_CHARSET = 'utf8mb4';

const LEGACY_STATE_TABLE = 'app_state';
const TABLE_USERS = 'users';
const TABLE_PROFILES = 'profiles';
const TABLE_ADMIN_PRODUCTS = 'admin_products';
const TABLE_REMOVED_BASE = 'removed_base_products';
const TABLE_ORDERS = 'orders';
const TABLE_ORDER_ITEMS = 'order_items';
const TABLE_WISHLIST = 'wishlist_items';
const TABLE_MESSAGES = 'messages';
const TABLE_META = 'app_meta';
const META_ORDER_SEQ = 'order_seq';

const LEGACY_KEYS = [
    'users' => 'users',
    'profiles' => 'profiles',
    'admin_products' => 'admin_products',
    'removed_base_products' => 'removed_base_products',
    'orders' => 'orders',
    'wishlists' => 'wishlists',
    'messages' => 'messages',
    'order_seq' => 'order_seq'
];

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

function qid(string $name): string {
    return '`' . str_replace('`', '``', $name) . '`';
}

function connect_db(): PDO {
    $cfg = db_config();
    $serverDsn = sprintf('mysql:host=%s;port=%d;charset=%s', $cfg['host'], $cfg['port'], $cfg['charset']);
    $pdo = new PDO($serverDsn, $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    $dbName = qid($cfg['name']);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS {$dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE {$dbName}");
    return $pdo;
}

function table_exists(PDO $pdo, string $table): bool {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table_name');
    $stmt->execute([':table_name' => $table]);
    return ((int)$stmt->fetchColumn()) > 0;
}

function normalize_username(string $username): string {
    return strtolower(trim($username));
}

function to_datetime(string $value): string {
    $value = trim($value);
    if ($value === '') return date('Y-m-d H:i:s');
    try {
        return (new DateTime($value))->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        return date('Y-m-d H:i:s');
    }
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

function decode_json_mixed(string $raw, $default) {
    $decoded = json_decode($raw, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) return $default;
    return $decoded;
}

function encode_json_mixed($value): string {
    $encoded = json_encode($value, JSON_UNESCAPED_SLASHES);
    return $encoded === false ? '[]' : $encoded;
}

function read_legacy_json_file(string $file, $default) {
    if (!is_file($file)) return $default;
    $raw = file_get_contents($file);
    if ($raw === false || trim($raw) === '') return $default;
    return decode_json_mixed($raw, $default);
}

function read_legacy_order_seq_file(string $file): int {
    if (!is_file($file)) return 0;
    $raw = trim((string)file_get_contents($file));
    $seq = (int)$raw;
    return $seq > 0 ? $seq : 0;
}

function read_legacy_state(PDO $pdo): array {
    if (!table_exists($pdo, LEGACY_STATE_TABLE)) return [];

    $table = qid(LEGACY_STATE_TABLE);
    $rows = $pdo->query("SELECT state_key, state_value FROM {$table}")->fetchAll();
    $state = [];
    foreach ($rows as $row) {
        $key = (string)($row['state_key'] ?? '');
        if ($key === '') continue;
        $state[$key] = decode_json_mixed((string)($row['state_value'] ?? ''), null);
    }
    return $state;
}

function pick_legacy_value(array $state, string $key, $fileValue, $default) {
    if (array_key_exists($key, $state) && $state[$key] !== null) return $state[$key];
    if ($fileValue !== null) return $fileValue;
    return $default;
}

function ensure_list($value): array {
    if (!is_array($value)) return [];
    return array_values($value);
}

function migrate_users(PDO $pdo, array $users): int {
    if (count($users) === 0) return 0;
    $table = qid(TABLE_USERS);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (username_key, username, name, email, phone, password, role, address, city, zip_code, added_by, registered_at)
            VALUES
            (:username_key, :username, :name, :email, :phone, :password, :role, :address, :city, :zip_code, :added_by, :registered_at)"
        );

        $count = 0;
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
                ':registered_at' => to_datetime((string)($user['registeredAt'] ?? ''))
            ]);
            $count++;
        }

        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function normalize_profiles($profiles): array {
    if (!is_array($profiles)) return [];
    $map = [];
    foreach ($profiles as $key => $profile) {
        if (!is_array($profile)) continue;
        $fallback = is_string($key) ? $key : '';
        $username = trim((string)($profile['username'] ?? $fallback));
        if ($username === '') continue;
        $map[normalize_username($username)] = array_merge($profile, ['username' => $username]);
    }
    return $map;
}

function migrate_profiles(PDO $pdo, array $profiles): int {
    if (count($profiles) === 0) return 0;
    $table = qid(TABLE_PROFILES);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (username_key, username, name, email, phone, address, city, zip_code, image, role, updated_at)
            VALUES
            (:username_key, :username, :name, :email, :phone, :address, :city, :zip_code, :image, :role, :updated_at)"
        );

        $count = 0;
        foreach ($profiles as $profile) {
            if (!is_array($profile)) continue;
            $username = trim((string)($profile['username'] ?? ''));
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
                ':updated_at' => to_datetime((string)($profile['updatedAt'] ?? ''))
            ]);
            $count++;
        }

        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function migrate_admin_products(PDO $pdo, array $products): int {
    if (count($products) === 0) return 0;
    $table = qid(TABLE_ADMIN_PRODUCTS);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (product_id, product_json, created_at)
             VALUES (:product_id, :product_json, :created_at)"
        );
        $count = 0;
        foreach ($products as $product) {
            if (!is_array($product)) continue;
            $id = trim((string)($product['id'] ?? ''));
            if ($id === '') continue;
            $stmt->execute([
                ':product_id' => $id,
                ':product_json' => encode_json_mixed($product),
                ':created_at' => to_datetime((string)($product['createdAt'] ?? ''))
            ]);
            $count++;
        }
        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function migrate_removed_base(PDO $pdo, array $ids): int {
    if (count($ids) === 0) return 0;
    $table = qid(TABLE_REMOVED_BASE);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare("INSERT INTO {$table} (product_id, removed_at) VALUES (:product_id, :removed_at)");
        $seen = [];
        $count = 0;
        foreach ($ids as $id) {
            $value = trim((string)$id);
            if ($value === '' || isset($seen[$value])) continue;
            $seen[$value] = true;
            $stmt->execute([
                ':product_id' => $value,
                ':removed_at' => date('Y-m-d H:i:s')
            ]);
            $count++;
        }
        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function migrate_orders(PDO $pdo, array $orders): array {
    if (count($orders) === 0) return ['count' => 0, 'maxSeq' => 0];
    $table = qid(TABLE_ORDERS);
    $itemsTable = qid(TABLE_ORDER_ITEMS);
    $pdo->beginTransaction();
    try {
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

        $usedSeq = [];
        $usedIds = [];
        $maxSeq = 0;
        $count = 0;

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
            if ($customerName === '') $customerName = trim((string)($order['username'] ?? ''));
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
                    ':created_at' => to_datetime($createdAt)
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
                ':created_at' => to_datetime($createdAt)
            ]);
            $count++;
        }

        $pdo->commit();
        return ['count' => $count, 'maxSeq' => $maxSeq];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function migrate_wishlists(PDO $pdo, array $wishlistMap): int {
    if (count($wishlistMap) === 0) return 0;
    $table = qid(TABLE_WISHLIST);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (username_key, product_id, added_at) VALUES (:username_key, :product_id, :added_at)"
        );

        $count = 0;
        foreach ($wishlistMap as $username => $items) {
            if (!is_array($items)) continue;
            $key = normalize_username((string)$username);
            if ($key === '') continue;
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
                $count++;
            }
        }

        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function migrate_messages(PDO $pdo, array $messages): int {
    if (count($messages) === 0) return 0;
    $table = qid(TABLE_MESSAGES);
    $pdo->beginTransaction();
    try {
        $pdo->exec("DELETE FROM {$table}");
        $stmt = $pdo->prepare(
            "INSERT INTO {$table} (message_id, name, email, message, created_at)
             VALUES (:message_id, :name, :email, :message, :created_at)"
        );

        $count = 0;
        foreach ($messages as $msg) {
            if (!is_array($msg)) continue;
            $id = trim((string)($msg['id'] ?? ''));
            if ($id === '') $id = uniqid('msg_', true);
            $stmt->execute([
                ':message_id' => $id,
                ':name' => trim((string)($msg['name'] ?? '')),
                ':email' => trim((string)($msg['email'] ?? '')),
                ':message' => trim((string)($msg['message'] ?? '')),
                ':created_at' => to_datetime((string)($msg['createdAt'] ?? ''))
            ]);
            $count++;
        }

        $pdo->commit();
        return $count;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function write_order_seq_meta(PDO $pdo, int $seq): void {
    $table = qid(TABLE_META);
    $stmt = $pdo->prepare(
        "INSERT INTO {$table} (meta_key, meta_value)
         VALUES (:meta_key, :meta_value)
         ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), updated_at = CURRENT_TIMESTAMP"
    );
    $stmt->execute([
        ':meta_key' => META_ORDER_SEQ,
        ':meta_value' => json_encode(max(0, $seq))
    ]);
}

$backendDir = dirname(__DIR__);
$dataDir = $backendDir . DIRECTORY_SEPARATOR . 'data';

$usersFile = $dataDir . DIRECTORY_SEPARATOR . 'users.json';
$profilesFile = $dataDir . DIRECTORY_SEPARATOR . 'profiles.json';
$adminProductsFile = $dataDir . DIRECTORY_SEPARATOR . 'admin_products.json';
$removedBaseFile = $dataDir . DIRECTORY_SEPARATOR . 'removed_base_products.json';
$ordersFile = $dataDir . DIRECTORY_SEPARATOR . 'orders.json';
$orderSeqFile = $dataDir . DIRECTORY_SEPARATOR . 'order_seq.txt';
$wishlistsFile = $dataDir . DIRECTORY_SEPARATOR . 'wishlists.json';
$messagesFile = $dataDir . DIRECTORY_SEPARATOR . 'messages.json';

try {
    $pdo = connect_db();
    $legacyState = read_legacy_state($pdo);

    $users = pick_legacy_value($legacyState, LEGACY_KEYS['users'], read_legacy_json_file($usersFile, []), []);
    $profiles = pick_legacy_value($legacyState, LEGACY_KEYS['profiles'], read_legacy_json_file($profilesFile, []), []);
    $adminProducts = pick_legacy_value($legacyState, LEGACY_KEYS['admin_products'], read_legacy_json_file($adminProductsFile, []), []);
    $removedBase = pick_legacy_value($legacyState, LEGACY_KEYS['removed_base_products'], read_legacy_json_file($removedBaseFile, []), []);
    $orders = pick_legacy_value($legacyState, LEGACY_KEYS['orders'], read_legacy_json_file($ordersFile, []), []);
    $wishlistMap = pick_legacy_value($legacyState, LEGACY_KEYS['wishlists'], read_legacy_json_file($wishlistsFile, []), []);
    $messages = pick_legacy_value($legacyState, LEGACY_KEYS['messages'], read_legacy_json_file($messagesFile, []), []);

    $legacyOrderSeqValue = pick_legacy_value($legacyState, LEGACY_KEYS['order_seq'], read_legacy_order_seq_file($orderSeqFile), 0);
    $legacyOrderSeq = is_numeric($legacyOrderSeqValue) ? (int)$legacyOrderSeqValue : 0;
    if ($legacyOrderSeq < 0) $legacyOrderSeq = 0;

    $users = ensure_list(is_array($users) ? $users : []);
    $profiles = normalize_profiles($profiles);
    $adminProducts = ensure_list(is_array($adminProducts) ? $adminProducts : []);
    $removedBase = ensure_list(is_array($removedBase) ? $removedBase : []);
    $orders = ensure_list(is_array($orders) ? $orders : []);
    $wishlistMap = is_array($wishlistMap) ? $wishlistMap : [];
    $messages = ensure_list(is_array($messages) ? $messages : []);

    $summary = [
        'source' => [
            'legacyStateKeys' => array_values(array_keys($legacyState)),
            'users' => count($users),
            'profiles' => count($profiles),
            'adminProducts' => count($adminProducts),
            'removedBaseProducts' => count($removedBase),
            'orders' => count($orders),
            'wishlistUsers' => count($wishlistMap),
            'messages' => count($messages),
            'orderSeq' => $legacyOrderSeq
        ]
    ];

    $migratedUsers = migrate_users($pdo, $users);
    $migratedProfiles = migrate_profiles($pdo, $profiles);
    $migratedProducts = migrate_admin_products($pdo, $adminProducts);
    $migratedRemoved = migrate_removed_base($pdo, $removedBase);
    $migratedOrders = migrate_orders($pdo, $orders);
    $migratedWishlists = migrate_wishlists($pdo, $wishlistMap);
    $migratedMessages = migrate_messages($pdo, $messages);

    $finalOrderSeq = max($legacyOrderSeq, (int)$migratedOrders['maxSeq']);
    write_order_seq_meta($pdo, $finalOrderSeq);

    $summary['migrated'] = [
        'users' => $migratedUsers,
        'profiles' => $migratedProfiles,
        'adminProducts' => $migratedProducts,
        'removedBaseProducts' => $migratedRemoved,
        'orders' => (int)$migratedOrders['count'],
        'wishlistItems' => $migratedWishlists,
        'messages' => $migratedMessages,
        'orderSeq' => $finalOrderSeq
    ];

    echo json_encode(['ok' => true, 'summary' => $summary], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
} catch (Throwable $e) {
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    exit(1);
}

<?php
declare(strict_types=1);

const DB_DEFAULT_HOST = '127.0.0.1';
const DB_DEFAULT_PORT = 3306;
const DB_DEFAULT_NAME = 'wdd_store';
const DB_DEFAULT_USER = 'root';
const DB_DEFAULT_PASS = '';
const DB_DEFAULT_CHARSET = 'utf8mb4';
const DB_TABLE_CATALOG_PRODUCTS = 'catalog_products';

const SOURCE_ARRAYS = [
    'SEED_PRODUCTS',
    'EXTRA_PRODUCTS',
    'TAMIL_TRADITIONAL_PRODUCTS',
    'MODERN_COLLECTION_PRODUCTS'
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

function qid(string $identifier): string {
    return '`' . str_replace('`', '``', $identifier) . '`';
}

function connect_db(): PDO {
    $cfg = db_config();
    $dsn = sprintf('mysql:host=%s;port=%d;charset=%s', $cfg['host'], $cfg['port'], $cfg['charset']);
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    $dbName = qid($cfg['name']);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS {$dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE {$dbName}");
    return $pdo;
}

function ensure_catalog_table(PDO $pdo): void {
    $table = qid(DB_TABLE_CATALOG_PRODUCTS);
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS {$table} (
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
}

function extract_array_literal(string $source, string $constName): string {
    $needle = 'const ' . $constName;
    $start = strpos($source, $needle);
    if ($start === false) {
        throw new RuntimeException("Array {$constName} not found in app.js");
    }

    $arrayStart = strpos($source, '[', $start);
    if ($arrayStart === false) {
        throw new RuntimeException("Array start not found for {$constName}");
    }

    $len = strlen($source);
    $depth = 0;
    $inSingle = false;
    $inDouble = false;
    $inTemplate = false;
    $escape = false;

    for ($i = $arrayStart; $i < $len; $i++) {
        $ch = $source[$i];
        if ($escape) {
            $escape = false;
            continue;
        }

        if ($inSingle) {
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === "'") {
                $inSingle = false;
            }
            continue;
        }

        if ($inDouble) {
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === '"') {
                $inDouble = false;
            }
            continue;
        }

        if ($inTemplate) {
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === '`') {
                $inTemplate = false;
            }
            continue;
        }

        if ($ch === "'") {
            $inSingle = true;
            continue;
        }
        if ($ch === '"') {
            $inDouble = true;
            continue;
        }
        if ($ch === '`') {
            $inTemplate = true;
            continue;
        }

        if ($ch === '[') {
            $depth++;
            continue;
        }

        if ($ch === ']') {
            $depth--;
            if ($depth === 0) {
                return substr($source, $arrayStart, ($i - $arrayStart + 1));
            }
        }
    }

    throw new RuntimeException("Array end not found for {$constName}");
}

function strip_js_comments(string $input): string {
    $out = '';
    $len = strlen($input);
    $inSingle = false;
    $inDouble = false;
    $inTemplate = false;
    $escape = false;

    for ($i = 0; $i < $len; $i++) {
        $ch = $input[$i];
        $next = ($i + 1 < $len) ? $input[$i + 1] : '';

        if ($escape) {
            $out .= $ch;
            $escape = false;
            continue;
        }

        if ($inSingle) {
            $out .= $ch;
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === "'") {
                $inSingle = false;
            }
            continue;
        }

        if ($inDouble) {
            $out .= $ch;
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === '"') {
                $inDouble = false;
            }
            continue;
        }

        if ($inTemplate) {
            $out .= $ch;
            if ($ch === '\\') {
                $escape = true;
            } elseif ($ch === '`') {
                $inTemplate = false;
            }
            continue;
        }

        if ($ch === "'") {
            $inSingle = true;
            $out .= $ch;
            continue;
        }
        if ($ch === '"') {
            $inDouble = true;
            $out .= $ch;
            continue;
        }
        if ($ch === '`') {
            $inTemplate = true;
            $out .= $ch;
            continue;
        }

        if ($ch === '/' && $next === '/') {
            while ($i < $len && $input[$i] !== "\n") $i++;
            $out .= "\n";
            continue;
        }

        if ($ch === '/' && $next === '*') {
            $i += 2;
            while ($i < $len - 1 && !($input[$i] === '*' && $input[$i + 1] === '/')) $i++;
            $i++;
            continue;
        }

        $out .= $ch;
    }

    return $out;
}

function js_literal_to_php_array(string $literal): array {
    $withoutComments = strip_js_comments($literal);
    $withDoubleStrings = preg_replace_callback(
        "/'((?:\\\\.|[^'\\\\])*)'/s",
        static function (array $m): string {
            $value = stripcslashes($m[1]);
            return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        },
        $withoutComments
    );

    if (!is_string($withDoubleStrings)) {
        throw new RuntimeException('Failed converting single-quoted strings.');
    }

    $quotedKeys = preg_replace('/([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/', '$1"$2":', $withDoubleStrings);
    if (!is_string($quotedKeys)) {
        throw new RuntimeException('Failed quoting object keys.');
    }

    $noTrailingCommas = preg_replace('/,(\s*[\]}])/', '$1', $quotedKeys);
    if (!is_string($noTrailingCommas)) {
        throw new RuntimeException('Failed removing trailing commas.');
    }

    $decoded = json_decode($noTrailingCommas, true);
    if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException('JSON decode failed for JS literal: ' . json_last_error_msg());
    }
    return $decoded;
}

function seed_catalog(PDO $pdo, array $productsById): int {
    $table = qid(DB_TABLE_CATALOG_PRODUCTS);
    $pdo->exec("DELETE FROM {$table}");
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO {$table}
            (product_id, source_group, name, gender, type, price, product_json, seeded_at)
            VALUES
            (:product_id, :source_group, :name, :gender, :type, :price, :product_json, :seeded_at)"
        );

        $count = 0;
        foreach ($productsById as $id => $payload) {
            $product = $payload['product'];
            $encoded = json_encode($product, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if ($encoded === false) continue;

            $priceRaw = $product['price'] ?? 0;
            $price = is_numeric($priceRaw) ? (float)$priceRaw : 0.0;

            $stmt->execute([
                ':product_id' => (string)$id,
                ':source_group' => (string)$payload['source'],
                ':name' => trim((string)($product['name'] ?? '')),
                ':gender' => trim((string)($product['gender'] ?? '')),
                ':type' => trim((string)($product['type'] ?? '')),
                ':price' => $price,
                ':product_json' => $encoded,
                ':seeded_at' => date('Y-m-d H:i:s')
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

try {
    $appJsPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'app.js';
    if (!is_file($appJsPath)) {
        throw new RuntimeException('assets/js/app.js not found.');
    }

    $source = file_get_contents($appJsPath);
    if ($source === false || trim($source) === '') {
        throw new RuntimeException('Failed reading assets/js/app.js');
    }

    $productsById = [];
    $sourceCounts = [];
    foreach (SOURCE_ARRAYS as $arrayName) {
        $literal = extract_array_literal($source, $arrayName);
        $products = js_literal_to_php_array($literal);
        $sourceCounts[$arrayName] = count($products);
        foreach ($products as $product) {
            if (!is_array($product)) continue;
            $id = trim((string)($product['id'] ?? ''));
            if ($id === '') continue;
            $productsById[$id] = [
                'source' => strtolower($arrayName),
                'product' => $product
            ];
        }
    }

    $pdo = connect_db();
    ensure_catalog_table($pdo);
    $inserted = seed_catalog($pdo, $productsById);

    $summary = [
        'ok' => true,
        'appJsPath' => $appJsPath,
        'sourceCounts' => $sourceCounts,
        'uniqueProductCount' => count($productsById),
        'insertedRows' => $inserted
    ];
    echo json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
} catch (Throwable $e) {
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    exit(1);
}

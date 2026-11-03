"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: database/db.py
Database: SQLite with persistent file storage and auto-seeding

Description:
------------
Handles database creation, table schemas (products, sales, sale_items),
automatic category-based SKU generation, and realistic agricultural sample data initialization.
"""

import os
import re
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agristock.db")

CATEGORY_PREFIXES = {
    "Fertilizers": "FERT",
    "Seeds": "SEED",
    "Feeds": "FEED",
    "Agrochemicals": "AGRO",
}


def get_db_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Create and return a database connection with dict-like row access."""
    target_path = db_path or DB_FILE
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: Optional[str] = None, seed_data: bool = True) -> None:
    """Initialize database schemas and populate sample agricultural data."""
    target_path = db_path or DB_FILE
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    conn = get_db_connection(target_path)
    cursor = conn.cursor()

    # Create products table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            cost_price REAL NOT NULL CHECK(cost_price >= 0),
            selling_price REAL NOT NULL CHECK(selling_price > 0),
            stock_quantity INTEGER NOT NULL CHECK(stock_quantity >= 0),
            reorder_threshold INTEGER NOT NULL DEFAULT 15,
            unit TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # Create sales transactions ledger table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            cost_total REAL NOT NULL,
            profit REAL NOT NULL,
            items_count INTEGER NOT NULL,
            timestamp TEXT NOT NULL
        );
        """
    )

    # Create sale line items table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            sku TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id)
        );
        """
    )

    conn.commit()

    if seed_data:
        cursor.execute("SELECT COUNT(*) AS count FROM products;")
        row = cursor.fetchone()
        if row and row["count"] == 0:
            seed_sample_data(conn)
        else:
            cursor.execute("SELECT COUNT(*) AS count FROM sale_items;")
            s_row = cursor.fetchone()
            if s_row and s_row["count"] == 0:
                seed_sample_sale_items(cursor)
                conn.commit()

    conn.close()


def generate_next_sku(category: str, db_path: Optional[str] = None) -> str:
    """
    Automatically generate a unique SKU based on the product category.
    - Fertilizers  -> FERT-001, FERT-002, ...
    - Seeds        -> SEED-001, SEED-002, ...
    - Feeds        -> FEED-001, FEED-002, ...
    - Agrochemicals -> AGRO-001, AGRO-002, ...
    """
    prefix = CATEGORY_PREFIXES.get(category, "AGRI")
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT sku FROM products WHERE sku LIKE ?;",
        (f"{prefix}-%",),
    )
    rows = cursor.fetchall()
    conn.close()

    max_num = 0
    pattern = re.compile(rf"^{prefix}-(\d+)$", re.IGNORECASE)
    for r in rows:
        match = pattern.match(r["sku"].strip())
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    next_num = max_num + 1
    return f"{prefix}-{next_num:03d}"


def seed_sample_data(conn: sqlite3.Connection) -> None:
    """Populate authentic agricultural products with category-specific SKUs."""
    cursor = conn.cursor()

    sample_products = [
        # (sku, name, category, cost_price, selling_price, stock_quantity, reorder_threshold, unit)
        (
            "FERT-001",
            "Urea Fertilizer 46-0-0",
            "Fertilizers",
            1950.00,
            2350.00,
            8,
            20,
            "50kg sack",
        ),
        (
            "FERT-002",
            "Complete Fertilizer 14-14-14",
            "Fertilizers",
            1850.00,
            2200.00,
            34,
            20,
            "50kg sack",
        ),
        (
            "FERT-003",
            "Ammonium Sulfate 21-0-0",
            "Fertilizers",
            950.00,
            1200.00,
            5,
            15,
            "50kg sack",
        ),
        (
            "FERT-004",
            "Muriate of Potash 0-0-60",
            "Fertilizers",
            2100.00,
            2600.00,
            14,
            15,
            "50kg sack",
        ),
        (
            "FERT-005",
            "Organic Vermicast Soil Conditioner",
            "Fertilizers",
            280.00,
            420.00,
            90,
            30,
            "40kg sack",
        ),
        (
            "SEED-001",
            "Pioneer 30Y87 Hybrid Corn Seeds",
            "Seeds",
            4200.00,
            4950.00,
            3,
            10,
            "5kg bag",
        ),
        (
            "SEED-002",
            "NSIC Rc222 Inbred Palay Seeds",
            "Seeds",
            1400.00,
            1750.00,
            42,
            15,
            "40kg sack",
        ),
        (
            "SEED-003",
            "East-West Eggplant Dumaguete Long",
            "Seeds",
            320.00,
            450.00,
            65,
            25,
            "100g pouch",
        ),
        (
            "SEED-004",
            "Condor F1 Hybrid Tomato Seeds",
            "Seeds",
            480.00,
            650.00,
            19,
            20,
            "50g tin",
        ),
        (
            "FEED-001",
            "B-Meg Hog Starter Pellets",
            "Feeds",
            1520.00,
            1780.00,
            28,
            25,
            "50kg sack",
        ),
        (
            "FEED-002",
            "B-Meg Hog Grower Mash",
            "Feeds",
            1450.00,
            1690.00,
            4,
            20,
            "50kg sack",
        ),
        (
            "FEED-003",
            "Purina Broiler Starter Crumble",
            "Feeds",
            1680.00,
            1980.00,
            52,
            30,
            "50kg sack",
        ),
        (
            "FEED-004",
            "Tateh Tilapia Sinking Pellets",
            "Feeds",
            1100.00,
            1350.00,
            12,
            20,
            "25kg sack",
        ),
        (
            "AGRO-001",
            "Glyphosate Systemic Herbicide 480SL",
            "Agrochemicals",
            720.00,
            950.00,
            18,
            15,
            "1 Liter",
        ),
        (
            "AGRO-002",
            "Cypermethrin 5EC Broad Insecticide",
            "Agrochemicals",
            450.00,
            620.00,
            2,
            10,
            "1 Liter",
        ),
        (
            "AGRO-003",
            "Mancozeb 80WP Protectant Fungicide",
            "Agrochemicals",
            580.00,
            780.00,
            25,
            15,
            "1kg box",
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO products (sku, name, category, cost_price, selling_price, stock_quantity, reorder_threshold, unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """,
        sample_products,
    )

    now = datetime.now()
    sample_sales = [
        (
            "REC-202611-001",
            "Mang Tomas Farm - San Fabian",
            9400.00,
            7800.00,
            1600.00,
            4,
            (now - timedelta(days=5, hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "REC-202611-002",
            "Dagupan Agri-Coop Cluster 4",
            17850.00,
            14800.00,
            3050.00,
            10,
            (now - timedelta(days=4, hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "REC-202611-003",
            "Ka Pedro Piggery - Calasiao",
            6760.00,
            5800.00,
            960.00,
            4,
            (now - timedelta(days=3, hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "REC-202611-004",
            "Elena Santos Rice Fields - Mangaldan",
            8750.00,
            7000.00,
            1750.00,
            5,
            (now - timedelta(days=2, hours=4)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "REC-202611-005",
            "Bonuan Tilapia Hatchery",
            4050.00,
            3300.00,
            750.00,
            3,
            (now - timedelta(days=1, hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
        (
            "REC-202611-006",
            "Juan Dela Cruz (Walk-in Farmer)",
            1900.00,
            1440.00,
            460.00,
            2,
            (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO sales (receipt_number, customer_name, total_amount, cost_total, profit, items_count, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        sample_sales,
    )

    seed_sample_sale_items(cursor)
    conn.commit()


def seed_sample_sale_items(cursor: sqlite3.Cursor) -> None:
    """Populate itemized product lines for sample historical sales receipts."""
    sample_sale_items = [
        # (sale_id, product_id, product_name, sku, quantity, unit_price, subtotal)
        # Sale 1: Mang Tomas Farm (REC-202611-001) - 4 sacks Urea
        (1, 1, "Urea Fertilizer 46-0-0", "FERT-001", 4, 2350.00, 9400.00),
        # Sale 2: Dagupan Agri-Coop Cluster 4 (REC-202611-002) - 5 Complete + 3 Palay Seeds + 2 Glyphosate
        (2, 2, "Complete Fertilizer 14-14-14", "FERT-002", 5, 2200.00, 11000.00),
        (2, 7, "NSIC Rc222 Inbred Palay Seeds", "SEED-002", 3, 1750.00, 5250.00),
        (2, 14, "Glyphosate Systemic Herbicide 480SL", "AGRO-001", 2, 950.00, 1900.00),
        # Sale 3: Ka Pedro Piggery (REC-202611-003) - 4 sacks Hog Grower
        (3, 11, "B-Meg Hog Grower Mash", "FEED-002", 4, 1690.00, 6760.00),
        # Sale 4: Elena Santos Rice Fields (REC-202611-004) - 5 sacks Palay Seeds
        (4, 7, "NSIC Rc222 Inbred Palay Seeds", "SEED-002", 5, 1750.00, 8750.00),
        # Sale 5: Bonuan Tilapia Hatchery (REC-202611-005) - 3 sacks Tilapia Pellets
        (5, 13, "Tateh Tilapia Sinking Pellets", "FEED-004", 3, 1350.00, 4050.00),
        # Sale 6: Juan Dela Cruz (REC-202611-006) - 2 bottles Glyphosate
        (6, 14, "Glyphosate Systemic Herbicide 480SL", "AGRO-001", 2, 950.00, 1900.00),
    ]

    cursor.executemany(
        """
        INSERT INTO sale_items (sale_id, product_id, product_name, sku, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        sample_sale_items,
    )


def fetch_all_products(db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all products as Python dictionaries without SQL ordering."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, sku, name, category, cost_price, selling_price, stock_quantity, reorder_threshold, unit, created_at FROM products;"
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def fetch_all_sales(db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all sales ledger records with their itemized products as Python dictionaries."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, receipt_number, customer_name, total_amount, cost_total, profit, items_count, timestamp FROM sales;"
    )
    sales = [dict(row) for row in cursor.fetchall()]

    # Fetch all sale items grouped by sale_id
    try:
        cursor.execute(
            "SELECT id, sale_id, product_id, product_name, sku, quantity, unit_price, subtotal FROM sale_items;"
        )
        items_rows = [dict(r) for r in cursor.fetchall()]
    except Exception:
        items_rows = []
    conn.close()

    items_by_sale: Dict[int, List[Dict[str, Any]]] = {}
    for item in items_rows:
        sid = item.get("sale_id")
        if sid not in items_by_sale:
            items_by_sale[sid] = []
        items_by_sale[sid].append(item)

    for s in sales:
        s["items"] = items_by_sale.get(s["id"], [])

    return sales


def fetch_sale_items(sale_id: int, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all line items for a specific sale receipt."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, sale_id, product_id, product_name, sku, quantity, unit_price, subtotal FROM sale_items WHERE sale_id = ?;",
        (sale_id,),
    )
    items = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return items


if __name__ == "__main__":
    import sys

    reset_flags = {"--reset", "-r", "--force"}
    has_reset_flag = any(flag in sys.argv for flag in reset_flags)

    if os.path.exists(DB_FILE):
        if has_reset_flag:
            os.remove(DB_FILE)
            print(f"Initializing database at: {DB_FILE}")
            init_db(seed_data=True)
        else:
            try:
                choice = input("WARNING: Database already exists. Reset and overwrite all data? [y/N]: ").strip().lower()
            except (KeyboardInterrupt, EOFError):
                print("\nOperation aborted by user.")
                choice = "n"

            if choice in ("y", "yes"):
                os.remove(DB_FILE)
                print(f"Initializing database at: {DB_FILE}")
                init_db(seed_data=True)
            else:
                products = fetch_all_products()
                sales = fetch_all_sales()
                print(f"Database preserved without changes ({len(products)} products, {len(sales)} sales records).")
                sys.exit(0)
    else:
        print(f"Initializing database at: {DB_FILE}")
        init_db(seed_data=True)

    products = fetch_all_products()
    sales = fetch_all_sales()
    print(f"Database initialized with {len(products)} products and {len(sales)} sales records.")
    print("Testing category-based SKU generation:")
    for cat in ["Fertilizers", "Seeds", "Feeds", "Agrochemicals"]:
        print(f"Next SKU for {cat}: {generate_next_sku(cat)}")

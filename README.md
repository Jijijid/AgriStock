# AgriStock &mdash; Agricultural Inventory & DSA Management System

**Course:** ITECC04: Data Structures & Algorithms (Final Project)  
**Institution:** Universidad de Dagupan &mdash; School of Information Technology  
**Architecture:** Python 3 Flask &bull; SQLite Persistent Database &bull; Jinja2 Templates &bull; Tailwind CSS  

---

## 🌾 Project Overview

AgriStock is an agricultural inventory management, Point-of-Sale (POS), and revenue ledger application designed for agricultural farm supply hubs.

To fulfill strict algorithmic requirements without relying on built-in library shortcuts (such as `list.sort()`, `sorted()`, `heapq`, or SQL `ORDER BY / WHERE` clauses for algorithms), the core business logic is powered by **4 standalone Data Structures & Algorithms**:

| # | Data Structure / Algorithm | Dedicated Module | Real-World Agricultural Application | Time Complexity | Auxiliary Space |
|---|---|---|---|---|---|
| 1 | **Binary Min-Heap** | `dsa/min_heap.py` | **Critical Restock Priority Alert:** Immediately alerts inventory managers to depleted fertilizers, seeds, and feeds at or below reorder thresholds. Root holds the most critical item. | Insert: $O(\log n)$<br>Extract Min: $O(\log n)$<br>Peek: $O(1)$ | $O(n)$ |
| 2 | **Binary Search** | `dsa/binary_search.py` | **Fast Barcode / SKU Product Lookup:** Instant cashier barcode lookup across thousands of agricultural SKUs without scanning linearly. | Average/Worst: $O(\log n)$<br>Best: $O(1)$ | $O(1)$ Iterative |
| 3 | **FIFO Queue** | `dsa/queue.py` | **Checkout & Warehouse Dispatch Queue:** Ensures fair, first-in-first-out order staging during peak morning planting season before committing atomic stock deductions. | Enqueue: $O(1)$<br>Dequeue: $O(1)$<br>Peek: $O(1)$ | $O(n)$ |
| 4 | **Merge Sort** | `dsa/merge_sort.py` | **Sales & Revenue Ledger Sorting:** Stable divide-and-conquer sorting for financial transactions by gross revenue, profit margin, or date. | All Cases: $O(n \log n)$ | $O(n)$ |

---

## 🎨 Earthy Farm-Like Color Palette

The interface is styled using a farm-inspired color system via Tailwind CSS:

* **Crop Green** (`#2D5A27`): Navbar, primary action buttons, branding
* **Harvest Gold** (`#E09F3E`): Accent badges, priority callouts, warning indicators
* **Farmhouse Cream** (`#F9F7F1`): Main background layout
* **Rich Soil** (`#2B2118`): Typography, primary text, dark footers
* **Terracotta Rust** (`#BF4327`): Critical low-stock warning badges
* **Sprout Green** (`#4E8752`): Healthy stock indicators, profit margins
* **Field Sage** (`#D5DCD0`): Card outlines, table borders, dividers

---

## 📂 Project Directory Structure

```text
├── app.py                  # Main Flask application with 4 core routes
├── requirements.txt        # Python dependency manifest (Flask)
├── test_dsa.py             # Comprehensive test runner verifying all 4 DSA modules
├── README.md               # Project documentation and complexity proof
│
├── dsa/                    # Standalone DSA Python Modules (NO BUILT-IN SHORTCUTS)
│   ├── __init__.py         # Package exports
│   ├── min_heap.py         # MinHeap class (insert, extract_min, heapify up/down)
│   ├── merge_sort.py       # Recursive merge_sort() and two-pointer merge()
│   ├── binary_search.py    # Iterative O(log n) binary_search_by_sku() + pointer tracer
│   └── queue.py            # FIFO OrderQueue class (enqueue, dequeue, peek, size)
│
├── database/
│   ├── db.py               # SQLite schema setup and realistic agricultural seed data
│   └── agristock.db        # Persistent SQLite database file
│
└── templates/              # Semantic Jinja2 HTML5 Templates
    ├── base.html           # Farm layout, top academic banner, navigation, footer
    ├── dashboard.html      # Critical Restock Alert (Min-Heap) & Financial KPIs
    ├── inventory.html      # Inventory CRUD & Barcode Search with O(log n) Trace
    ├── pos.html            # Cashier Order Staging & FIFO Dispatch Queue
    └── reports.html        # Sales Ledger & Merge Sort Multi-Criteria Sorting
```

---

## 🚀 How to Run on a Local Server

You can run AgriStock locally in two ways:

---

### Option 1: Python 3 + Flask Web Server (Academic Project Deliverable)

This runs the native Python Flask server with Jinja2 templates, SQLite database, and the pure Python DSA modules in `dsa/`.

#### Step 1: Clone / Navigate to the Project Directory
```bash
cd agristock
```

#### Step 2: (Recommended) Create & Activate a Python Virtual Environment
- **On macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **On Windows (Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate
  ```
- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

#### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```
*(Only requires Flask `>=3.0.0` since `sqlite3` and standard libraries are built into Python).*

#### Step 4: Initialize the SQLite Database & Seed Data
```bash
python3 database/db.py
```
*(On Windows, you can type `python database/db.py`). This creates `database/agristock.db` with authentic agricultural supplies.*

#### Step 5: (Optional) Run the DSA Verification Suite
```bash
python3 test_dsa.py
```
*(Confirms that `MinHeap`, `Merge Sort`, `Binary Search`, and `OrderQueue` pass all unit tests).*

#### Step 6: Start the Flask Web Server
```bash
python3 app.py
```
Open your browser and navigate to:
👉 **`http://127.0.0.1:5000`** (or `http://localhost:5000`)

---

### Option 2: Node.js / React Development Server (Interactive UI Workbench)

This runs the React + Tailwind live interactive preview workbench:

#### Step 1: Install Node Dependencies
```bash
npm install
```

#### Step 2: Start the Vite Dev Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**


export const PYTHON_FILES: Record<string, { path: string; title: string; dsa: string; code: string }> = {
  'min_heap': {
    path: 'dsa/min_heap.py',
    title: 'MinHeap Class (Priority Queue)',
    dsa: 'Min-Heap (O(log n) insert/extract, O(1) peek)',
    code: `"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/min_heap.py
Application: Critical Restock Priority Alert
"""

from typing import List, Dict, Any, Optional

class MinHeap:
    def __init__(self) -> None:
        self.heap: List[Dict[str, Any]] = []

    def is_empty(self) -> bool:
        return len(self.heap) == 0

    def size(self) -> int:
        return len(self.heap)

    def peek(self) -> Optional[Dict[str, Any]]:
        if self.is_empty():
            return None
        return self.heap[0]

    def insert(self, product: Dict[str, Any]) -> None:
        self.heap.append(product)
        self._heapify_up(len(self.heap) - 1)

    def extract_min(self) -> Optional[Dict[str, Any]]:
        if self.is_empty():
            return None
        min_item = self.heap[0]
        last_item = self.heap.pop()
        if not self.is_empty():
            self.heap[0] = last_item
            self._heapify_down(0)
        return min_item

    def _heapify_up(self, index: int) -> None:
        while index > 0:
            parent_idx = (index - 1) // 2
            curr_stock = self.heap[index].get("stock_quantity", 0)
            parent_stock = self.heap[parent_idx].get("stock_quantity", 0)
            if curr_stock < parent_stock:
                self.heap[index], self.heap[parent_idx] = self.heap[parent_idx], self.heap[index]
                index = parent_idx
            else:
                break

    def _heapify_down(self, index: int) -> None:
        size = len(self.heap)
        while True:
            smallest = index
            left_child = 2 * index + 1
            right_child = 2 * index + 2

            if left_child < size and self.heap[left_child].get("stock_quantity", 0) < self.heap[smallest].get("stock_quantity", 0):
                smallest = left_child
            if right_child < size and self.heap[right_child].get("stock_quantity", 0) < self.heap[smallest].get("stock_quantity", 0):
                smallest = right_child

            if smallest != index:
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break
`
  },
  'merge_sort': {
    path: 'dsa/merge_sort.py',
    title: 'Merge Sort Function (Divide & Conquer)',
    dsa: 'Merge Sort (O(n log n) Guaranteed Time, Stable)',
    code: `"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/merge_sort.py
Application: Sales & Revenue Ledger Sorting
"""

from typing import List, Dict, Any

def merge(left: List[Dict[str, Any]], right: List[Dict[str, Any]], key: str, reverse: bool = False) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []
    i = 0
    j = 0
    len_left = len(left)
    len_right = len(right)

    while i < len_left and j < len_right:
        val_left = left[i].get(key, 0)
        val_right = right[j].get(key, 0)
        if val_left is None: val_left = 0
        if val_right is None: val_right = 0

        condition = (val_left >= val_right) if reverse else (val_left <= val_right)
        if condition:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    while i < len_left:
        merged.append(left[i])
        i += 1
    while j < len_right:
        merged.append(right[j])
        j += 1

    return merged

def merge_sort(records: List[Dict[str, Any]], key: str, reverse: bool = False) -> List[Dict[str, Any]]:
    if len(records) <= 1:
        return list(records)

    mid = len(records) // 2
    left_half = records[:mid]
    right_half = records[mid:]

    sorted_left = merge_sort(left_half, key, reverse)
    sorted_right = merge_sort(right_half, key, reverse)

    return merge(sorted_left, sorted_right, key, reverse)
`
  },
  'binary_search': {
    path: 'dsa/binary_search.py',
    title: 'Binary Search by SKU',
    dsa: 'Binary Search (O(log n) Time, O(1) Iterative Space)',
    code: `"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/binary_search.py
Application: Fast Barcode / SKU Product Lookup
"""

from typing import List, Dict, Any, Optional, Tuple

def binary_search_by_sku(sorted_products: List[Dict[str, Any]], target_sku: str) -> Optional[Dict[str, Any]]:
    if not sorted_products or not target_sku:
        return None

    target = target_sku.strip().upper()
    low = 0
    high = len(sorted_products) - 1

    while low <= high:
        mid = low + (high - low) // 2
        current_sku = str(sorted_products[mid].get("sku", "")).strip().upper()

        if current_sku == target:
            return sorted_products[mid]
        elif current_sku < target:
            low = mid + 1
        else:
            high = mid - 1

    return None
`
  },
  'queue': {
    path: 'dsa/queue.py',
    title: 'OrderQueue Class (FIFO Queue)',
    dsa: 'OrderQueue (O(1) Enqueue/Dequeue/Peek, FIFO)',
    code: `\"\"\"
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/queue.py
Application: Checkout & Warehouse Dispatch Queue

Implementation: hand-written singly linked list with a head pointer (front of the
queue) and a tail pointer (back of the queue). No built-in queue container
(collections.deque, queue.Queue, or a list used as a queue) is used.

    head -> [order A] -> [order B] -> [order C] <- tail

Complexity:
- enqueue: O(1)   dequeue: O(1)   peek: O(1)   is_empty: O(1)   size: O(1)
- to_list: O(n)   Space: O(n)
\"\"\"

from typing import Dict, Any, Optional, List


class _Node:
    \"\"\"A single link in the queue: one order plus a pointer to the next node.\"\"\"

    __slots__ = ("order", "next")

    def __init__(self, order: Dict[str, Any]) -> None:
        self.order = order
        self.next: Optional["_Node"] = None


class OrderQueue:
    \"\"\"Pure FIFO queue implemented as a singly linked list.\"\"\"

    def __init__(self) -> None:
        self._head: Optional[_Node] = None
        self._tail: Optional[_Node] = None
        self._size: int = 0

    def enqueue(self, order: Dict[str, Any]) -> None:
        if not isinstance(order, dict):
            raise TypeError("Order must be a valid dictionary structure.")
        new_node = _Node(order)
        if self._tail is None:
            self._head = new_node
            self._tail = new_node
        else:
            self._tail.next = new_node
            self._tail = new_node
        self._size += 1

    def dequeue(self) -> Optional[Dict[str, Any]]:
        if self._head is None:
            return None
        removed = self._head
        self._head = removed.next
        if self._head is None:
            self._tail = None
        self._size -= 1
        return removed.order

    def peek(self) -> Optional[Dict[str, Any]]:
        if self._head is None:
            return None
        return self._head.order

    def is_empty(self) -> bool:
        return self._size == 0

    def size(self) -> int:
        return self._size

    def to_list(self) -> List[Dict[str, Any]]:
        orders: List[Dict[str, Any]] = []
        current = self._head
        while current is not None:
            orders.append(current.order)
            current = current.next
        return orders

    def clear(self) -> None:
        self._head = None
        self._tail = None
        self._size = 0
`
  },
  'db': {
    path: 'database/db.py',
    title: 'Database Setup & SQLite Schemas',
    dsa: 'SQLite Storage (Raw dictionary retrieval for pure DSA processing)',
    code: `"""
AgriStock - Database Setup & Agricultural Seed Script
Module: database/db.py
"""
import os, sqlite3
from datetime import datetime, timedelta

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agristock.db")

def init_db(db_path=None, seed_data=True):
    conn = sqlite3.connect(db_path or DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            cost_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            stock_quantity INTEGER NOT NULL,
            reorder_threshold INTEGER NOT NULL DEFAULT 15,
            unit TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("""
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
    """)
    conn.commit()
    conn.close()
`
  },
  'app': {
    path: 'app.py',
    title: 'Main Flask Web Application',
    dsa: 'Flask Routes: /, /inventory (Binary Search O(log n)), /pos, /reports',
    code: `"""
AgriStock - Main Flask Application
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
"""
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from database.db import init_db, fetch_all_products, fetch_all_sales, generate_next_sku, CATEGORY_PREFIXES
from dsa.min_heap import MinHeap
from dsa.merge_sort import merge_sort
from dsa.binary_search import binary_search_by_sku, binary_search_with_trace
from dsa.queue import OrderQueue

app = Flask(__name__)
dispatch_queue = OrderQueue()

@app.route("/inventory", methods=["GET"])
def inventory():
    raw_products = fetch_all_products()
    search_query = request.args.get("q", "").strip()
    search_type = request.args.get("type", "auto").strip().lower()

    # Precondition: Sort catalog by SKU in O(n log n)
    sorted_products = merge_sort(raw_products, key="sku", reverse=False)

    # Detect SKU search
    is_sku_search = search_type == "sku" or ("-" in search_query) or any(search_query.upper().startswith(p) for p in CATEGORY_PREFIXES.values())
    
    trace, matched_prod, display_products = [], None, []
    if search_query:
        if is_sku_search:
            # Actively execute Binary Search with step-by-step trace
            matched_prod, trace = binary_search_with_trace(sorted_products, search_query)
            display_products = [matched_prod] if matched_prod else []
        else:
            display_products = [p for p in sorted_products if search_query.lower() in p["name"].lower()]
    else:
        display_products = sorted_products

    return render_template("inventory.html", products=display_products, trace=trace, is_sku_search=is_sku_search)

@app.route("/pos/lookup_sku", methods=["GET", "POST"])
def pos_lookup_sku():
    target_sku = (request.args.get("sku") or "").strip()
    sorted_products = merge_sort(fetch_all_products(), key="sku")
    found, trace = binary_search_with_trace(sorted_products, target_sku)
    return jsonify({"found": bool(found), "product": found, "trace": trace})
`
  }
};

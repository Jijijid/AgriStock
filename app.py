"""
AgriStock - Agricultural Inventory & Farm Supply Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Main Application: app.py
"""

import json
import os
import sqlite3
import sys
from datetime import datetime
from typing import Dict, Any, List

# Add workspace directory to python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database.db import (
    init_db,
    get_db_connection,
    fetch_all_products,
    fetch_all_sales,
    generate_next_sku,
    CATEGORY_PREFIXES,
)
from dsa.min_heap import MinHeap
from dsa.merge_sort import merge_sort
from dsa.binary_search import binary_search_by_sku, binary_search_with_trace
from dsa.queue import OrderQueue

# In-memory FIFO queue instance for cashier and warehouse dispatch
dispatch_queue = OrderQueue()

try:
    from flask import (
        Flask,
        render_template,
        request,
        redirect,
        url_for,
        flash,
        jsonify,
    )

    flask_available = True
except ImportError:
    flask_available = False

if flask_available:
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, "templates"),
        static_folder=os.path.join(BASE_DIR, "static"),
    )
    app.secret_key = "agristock-itecc04-secret-key-dagupan"

    # Ensure database is initialized on boot
    init_db(seed_data=True)

    # -------------------------------------------------------------
    # ROUTE 1: DASHBOARD ('/')
    # -------------------------------------------------------------
    @app.route("/")
    def dashboard():
        raw_products = fetch_all_products()
        raw_sales = fetch_all_sales()

        # MinHeap Restock Alert
        heap = MinHeap()
        for prod in raw_products:
            heap.insert(prod)

        critical_alerts = []
        while not heap.is_empty():
            item = heap.extract_min()
            if item and item.get("stock_quantity", 0) <= item.get("reorder_threshold", 15):
                critical_alerts.append(item)

        # Financial KPIs
        total_revenue = sum(s.get("total_amount", 0) for s in raw_sales)
        total_profit = sum(s.get("profit", 0) for s in raw_sales)
        total_stock_items = sum(p.get("stock_quantity", 0) for p in raw_products)

        # Recent transactions sorted chronologically using custom Merge Sort
        sorted_recent_sales = merge_sort(raw_sales, key="timestamp", reverse=True)[:5]

        return render_template(
            "dashboard.html",
            critical_alerts=critical_alerts,
            critical_count=len(critical_alerts),
            total_products=len(raw_products),
            total_stock_items=total_stock_items,
            total_revenue=total_revenue,
            total_profit=total_profit,
            recent_sales=sorted_recent_sales,
            queue_size=dispatch_queue.size(),
        )

    # -------------------------------------------------------------
    # ROUTE 2: INVENTORY ('/inventory')
    # Search by Product Name or Binary Search by SKU with O(log n) Execution Trace
    # -------------------------------------------------------------
    @app.route("/inventory", methods=["GET"])
    def inventory():
        raw_products = fetch_all_products()
        search_query = request.args.get("q", "").strip()
        search_type = request.args.get("type", "auto").strip().lower()
        selected_category = request.args.get("category", "All").strip()

        # PRECONDITION FOR BINARY SEARCH:
        # Sort catalog by SKU in ascending lexicographical order using custom Merge Sort O(n log n)
        sorted_products = merge_sort(raw_products, key="sku", reverse=False)

        # Detect if this is an SKU search (contains hyphen, starts with category prefix, or matches an SKU in catalog)
        is_sku_search = (
            search_type == "sku"
            or ("-" in search_query)
            or any(search_query.upper().startswith(p) for p in CATEGORY_PREFIXES.values())
            or any(p.get("sku", "").upper() == search_query.upper() for p in raw_products)
        )

        trace = []
        matched_prod = None
        products_to_display = []

        if search_query:
            if is_sku_search:
                # Actively execute custom Binary Search O(log n) with step-by-step trace
                matched_prod, trace = binary_search_with_trace(sorted_products, search_query)
                if matched_prod:
                    products_to_display = [matched_prod]
                else:
                    products_to_display = []
            else:
                # Fallback to linear scan by product name
                q_lower = search_query.lower()
                products_to_display = [
                    p for p in sorted_products
                    if q_lower in p.get("name", "").lower()
                ]
        else:
            products_to_display = sorted_products
            is_sku_search = False

        # Apply category filter if selected
        if selected_category and selected_category != "All":
            products_to_display = [
                p for p in products_to_display
                if p.get("category") == selected_category
            ]

        # Precalculate next SKU for each category for automatic modal generation
        next_skus = {cat: generate_next_sku(cat) for cat in CATEGORY_PREFIXES.keys()}

        return render_template(
            "inventory.html",
            products=products_to_display,
            all_products=sorted_products,
            search_query=search_query,
            search_type="sku" if is_sku_search else "name",
            is_sku_search=is_sku_search,
            trace=trace,
            matched_prod=matched_prod,
            selected_category=selected_category,
            next_skus=next_skus,
            queue_size=dispatch_queue.size(),
        )

    @app.route("/inventory/add", methods=["POST"])
    def add_product():
        """Add a new product with category-based automatic SKU generation."""
        category = request.form.get("category", "Fertilizers").strip()
        sku = request.form.get("sku", "").strip().upper()
        if not sku:
            sku = generate_next_sku(category)

        name = request.form.get("name", "").strip()
        unit = request.form.get("unit", "").strip() or "Unit"

        conn = None
        try:
            cost_price = float(request.form.get("cost_price", 0))
            selling_price = float(request.form.get("selling_price", 0))
            stock_quantity = int(request.form.get("stock_quantity", 0))
            reorder_threshold = int(request.form.get("reorder_threshold", 15))

            if not name:
                flash("Product Name is required.", "danger")
                return redirect(url_for("inventory"))

            if selling_price <= 0:
                flash("Selling price must be greater than zero.", "danger")
                return redirect(url_for("inventory"))

            if cost_price < 0 or stock_quantity < 0:
                flash("Cost and quantity cannot be negative.", "danger")
                return redirect(url_for("inventory"))

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO products (sku, name, category, cost_price, selling_price, stock_quantity, reorder_threshold, unit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    sku,
                    name,
                    category,
                    cost_price,
                    selling_price,
                    stock_quantity,
                    reorder_threshold,
                    unit,
                ),
            )
            conn.commit()
            flash(f"Product '{name}' added with SKU [{sku}]!", "success")
        except Exception as e:
            flash(f"Error adding product: {str(e)}", "danger")
        finally:
            if conn is not None:
                conn.close()

        return redirect(url_for("inventory"))

    @app.route("/inventory/update/<int:product_id>", methods=["POST"])
    def update_product(product_id: int):
        """Update stock quantity and prices for a product."""
        conn = None
        try:
            cost_price = float(request.form.get("cost_price", 0))
            selling_price = float(request.form.get("selling_price", 0))
            stock_quantity = int(request.form.get("stock_quantity", 0))
            reorder_threshold = int(request.form.get("reorder_threshold", 15))

            if selling_price <= 0 or stock_quantity < 0:
                flash("Invalid price or stock quantity.", "danger")
                return redirect(url_for("inventory"))

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE products
                SET cost_price = ?, selling_price = ?, stock_quantity = ?, reorder_threshold = ?
                WHERE id = ?;
                """,
                (
                    cost_price,
                    selling_price,
                    stock_quantity,
                    reorder_threshold,
                    product_id,
                ),
            )
            conn.commit()
            flash("Product inventory updated successfully.", "success")
        except Exception as e:
            flash(f"Failed to update product: {str(e)}", "danger")
        finally:
            if conn is not None:
                conn.close()

        return redirect(url_for("inventory"))

    @app.route("/inventory/delete/<int:product_id>", methods=["POST"])
    def delete_product(product_id: int):
        """Delete a product from the database."""
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM products WHERE id = ?;", (product_id,))
            conn.commit()
            flash("Product removed from catalog.", "info")
        except sqlite3.IntegrityError:
            flash("Cannot remove this product because it appears in past sales records. Set its stock to 0 instead to retire it.", "warning")
        except Exception as e:
            flash(f"Delete failed: {str(e)}", "danger")
        finally:
            if conn is not None:
                conn.close()

        return redirect(url_for("inventory"))

    # -------------------------------------------------------------
    # ROUTE 3: POS & MULTI-ITEM ORDER QUEUE ('/pos')
    # -------------------------------------------------------------
    @app.route("/pos", methods=["GET"])
    def pos():
        """POS Cashier & Dispatch Queue Interface with Multi-Item Checkout."""
        products = fetch_all_products()
        sorted_products = merge_sort(products, key="name", reverse=False)

        queued_orders = dispatch_queue.to_list()
        peek_order = dispatch_queue.peek()

        return render_template(
            "pos.html",
            products=sorted_products,
            queued_orders=queued_orders,
            peek_order=peek_order,
            queue_size=dispatch_queue.size(),
        )

    @app.route("/pos/lookup_sku", methods=["GET", "POST"])
    def pos_lookup_sku():
        """
        Instant Barcode / SKU Scanner Endpoint.
        Actively executes binary_search_with_trace() in O(log n) time.
        """
        if request.is_json:
            data = request.get_json() or {}
            target_sku = data.get("sku", "").strip()
        else:
            target_sku = (request.args.get("sku") or request.form.get("sku") or "").strip()

        if not target_sku:
            return jsonify({"success": False, "message": "SKU cannot be empty."}), 400

        products = fetch_all_products()
        # Precondition for Binary Search
        sorted_products = merge_sort(products, key="sku", reverse=False)

        # Execute Binary Search with trace
        found_product, trace = binary_search_with_trace(sorted_products, target_sku)

        if found_product:
            return jsonify({
                "success": True,
                "found": True,
                "product": found_product,
                "trace": trace,
                "message": f"Product '{found_product['name']}' located via Binary Search in {len(trace)} comparison(s)."
            })
        else:
            return jsonify({
                "success": False,
                "found": False,
                "trace": trace,
                "message": f"SKU '{target_sku}' not found in catalog after {len(trace)} comparison(s)."
            }), 404

    @app.route("/pos/enqueue", methods=["POST"])
    def pos_enqueue():
        """Enqueue a multi-item customer order into the dispatch queue."""
        customer_name = request.form.get("customer_name", "").strip() or "Walk-in Farmer"
        items_json = request.form.get("order_items_json", "").strip()

        if not items_json:
            flash("No items in order.", "warning")
            return redirect(url_for("pos"))

        try:
            raw_cart_items = json.loads(items_json)
            if not raw_cart_items:
                flash("Order must contain at least one product.", "warning")
                return redirect(url_for("pos"))

            # Enrich items with authoritative product names and SKUs from SQLite
            conn = get_db_connection()
            cursor = conn.cursor()
            cart_items = []
            for raw_item in raw_cart_items:
                pid = raw_item.get("product_id") or raw_item.get("id")
                cursor.execute(
                    "SELECT id, sku, name, unit, selling_price FROM products WHERE id = ?;",
                    (pid,),
                )
                prod_row = cursor.fetchone()
                p_name = raw_item.get("product_name") or raw_item.get("name")
                if (not p_name or p_name == "undefined") and prod_row:
                    p_name = prod_row["name"]
                elif not p_name:
                    p_name = f"Product #{pid}"

                p_sku = raw_item.get("sku") or (prod_row["sku"] if prod_row else "")
                p_unit = raw_item.get("unit") or (prod_row["unit"] if prod_row else "unit")
                p_price = float(raw_item.get("unit_price") or (prod_row["selling_price"] if prod_row else 0.0))
                qty = int(raw_item.get("quantity", 1))
                if qty <= 0:
                    qty = 1
                subtotal = float(raw_item.get("subtotal") or round(qty * p_price, 2))

                cart_items.append({
                    "product_id": pid,
                    "product_name": p_name,
                    "name": p_name,
                    "sku": p_sku,
                    "unit": p_unit,
                    "quantity": qty,
                    "unit_price": p_price,
                    "subtotal": round(subtotal, 2),
                })
            conn.close()

            total_amount = sum(float(i.get("subtotal", 0)) for i in cart_items)
            total_items = sum(int(i.get("quantity", 0)) for i in cart_items)

            order_payload = {
                "order_id": f"ORD-{int(datetime.now().timestamp() * 1000)}",
                "customer_name": customer_name,
                "items": cart_items,
                "line_items": cart_items,
                "total_items_count": total_items,
                "total_amount": round(total_amount, 2),
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }

            dispatch_queue.enqueue(order_payload)
            flash(
                f"Order {order_payload['order_id']} for {customer_name} added to dispatch queue with {len(cart_items)} item(s)!",
                "success",
            )
        except Exception as e:
            flash(f"Error queueing order: {str(e)}", "danger")

        return redirect(url_for("pos"))

    @app.route("/pos/dequeue_edit", methods=["POST"])
    def pos_dequeue_edit():
        """
        Dequeues the next order from the head of the FIFO queue
        and passes its items back to the cashier staging interface for modification.
        """
        if dispatch_queue.is_empty():
            flash("Dispatch Queue is currently empty.", "info")
            return redirect(url_for("pos"))

        recalled = dispatch_queue.dequeue()
        if not recalled:
            return redirect(url_for("pos"))

        products = fetch_all_products()
        sorted_products = merge_sort(products, key="name", reverse=False)
        queued_orders = dispatch_queue.to_list()
        peek_order = dispatch_queue.peek()

        flash(f"Order {recalled.get('order_id')} dequeued back to active ticket for edits.", "info")
        return render_template(
            "pos.html",
            products=sorted_products,
            queued_orders=queued_orders,
            peek_order=peek_order,
            queue_size=dispatch_queue.size(),
            recalled_customer=recalled.get("customer_name", ""),
            recalled_items=recalled.get("items", []),
        )

    @app.route("/pos/dequeue", methods=["POST"])
    def pos_dequeue():
        """
        Processes the next order at the head of the FIFO queue,
        verifies current stock for all items, deducts inventory, and records sale.
        The order is only removed after the sale is committed.
        """
        if dispatch_queue.is_empty():
            flash("Dispatch Queue is currently empty. No orders to process.", "info")
            return redirect(url_for("pos"))

        order = dispatch_queue.peek()
        if not order:
            return redirect(url_for("pos"))

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Verify stock for ALL items in order
            for item in order["items"]:
                cursor.execute(
                    "SELECT stock_quantity, name FROM products WHERE id = ?;",
                    (item["product_id"],),
                )
                prod_row = cursor.fetchone()

                if not prod_row:
                    flash(
                        f"Order failed: Product {item.get('product_name')} not found. The order is still at the front of the queue; use Dequeue to Edit to fix it.",
                        "danger",
                    )
                    return redirect(url_for("pos"))

                if prod_row["stock_quantity"] < item["quantity"]:
                    flash(
                        f"Stock Underflow! Only {prod_row['stock_quantity']} units left for {prod_row['name']}, but order needs {item['quantity']}. The order is still at the front of the queue; use Dequeue to Edit to fix it.",
                        "danger",
                    )
                    return redirect(url_for("pos"))

            # 2. Deduct inventory for all items
            total_cost = 0.0
            for item in order["items"]:
                cursor.execute(
                    "SELECT cost_price FROM products WHERE id = ?;",
                    (item["product_id"],),
                )
                cost_row = cursor.fetchone()
                cost_price = cost_row["cost_price"] if cost_row else 0.0
                total_cost += cost_price * item["quantity"]

                cursor.execute(
                    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?;",
                    (item["quantity"], item["product_id"]),
                )

            # 3. Create sales record
            profit = round(order["total_amount"] - total_cost, 2)
            base_receipt = f"REC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            receipt_num = base_receipt
            suffix = 2
            while cursor.execute("SELECT 1 FROM sales WHERE receipt_number = ?;", (receipt_num,)).fetchone():
                receipt_num = f"{base_receipt}-{suffix}"
                suffix += 1

            cursor.execute(
                """
                INSERT INTO sales (receipt_number, customer_name, total_amount, cost_total, profit, items_count, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    receipt_num,
                    order["customer_name"],
                    order["total_amount"],
                    total_cost,
                    profit,
                    order["total_items_count"],
                    order["created_at"],
                ),
            )
            sale_id = cursor.lastrowid

            # 4. Insert line items
            for item in order["items"]:
                cursor.execute(
                    """
                    INSERT INTO sale_items (sale_id, product_id, product_name, sku, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                    """,
                    (
                        sale_id,
                        item["product_id"],
                        item["product_name"],
                        item["sku"],
                        item["quantity"],
                        item["unit_price"],
                        item["subtotal"],
                    ),
                )

            conn.commit()
            dispatch_queue.dequeue()
            flash(
                f"Processed order {order['order_id']} for {order['customer_name']}! Receipt {receipt_num} issued. Deducted {order['total_items_count']} total units.",
                "success",
            )
        except Exception as e:
            conn.rollback()
            flash(f"Transaction failed: {str(e)}", "danger")
        finally:
            conn.close()

        return redirect(url_for("pos"))

    # -------------------------------------------------------------
    # ROUTE 4: REPORTS ('/reports')
    # -------------------------------------------------------------
    @app.route("/reports", methods=["GET"])
    def reports():
        raw_sales = fetch_all_sales()
        for s in raw_sales:
            if "line_items" not in s:
                s["line_items"] = s.get("items", [])
        sort_by = request.args.get("sort_by", "revenue_desc")

        if sort_by == "revenue_desc":
            sorted_sales = merge_sort(raw_sales, key="total_amount", reverse=True)
        elif sort_by == "revenue_asc":
            sorted_sales = merge_sort(raw_sales, key="total_amount", reverse=False)
        elif sort_by == "profit_desc":
            sorted_sales = merge_sort(raw_sales, key="profit", reverse=True)
        elif sort_by == "date_asc":
            sorted_sales = merge_sort(raw_sales, key="timestamp", reverse=False)
        else:
            sorted_sales = merge_sort(raw_sales, key="timestamp", reverse=True)

        total_rev = sum(s["total_amount"] for s in raw_sales)
        total_profit = sum(s["profit"] for s in raw_sales)
        avg_order = (total_rev / len(raw_sales)) if raw_sales else 0.0

        return render_template(
            "reports.html",
            sales=sorted_sales,
            sort_by=sort_by,
            total_rev=total_rev,
            total_profit=total_profit,
            avg_order=avg_order,
            total_transactions=len(raw_sales),
            queue_size=dispatch_queue.size(),
        )

    # -------------------------------------------------------------
    # ROUTE 5: CODE VIEWER ('/code')
    # -------------------------------------------------------------
    @app.route("/code")
    def code_viewer():
        files = {
            "min_heap.py": ("dsa/min_heap.py", "Min-Heap priority restock alerts"),
            "merge_sort.py": ("dsa/merge_sort.py", "Merge Sort revenue & profit sorting"),
            "binary_search.py": ("dsa/binary_search.py", "Binary Search fast SKU lookup"),
            "queue.py": ("dsa/queue.py", "FIFO Order Queue checkout dispatch"),
            "db.py": ("database/db.py", "SQLite database schema & sample seed data"),
            "app.py": ("app.py", "Flask application routes & DSA integrations"),
        }
        selected = request.args.get("file", "min_heap.py")
        if selected not in files:
            selected = "min_heap.py"

        rel_path, desc = files[selected]
        full_path = os.path.join(BASE_DIR, rel_path)
        content = ""
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

        return render_template(
            "code.html",
            files=files,
            selected=selected,
            code_content=content,
            file_desc=desc,
            queue_size=dispatch_queue.size(),
        )

    # -------------------------------------------------------------
    # ROUTE 6: DEFENSE GUIDE ('/defense')
    # -------------------------------------------------------------
    @app.route("/defense")
    def defense_guide():
        return render_template(
            "defense.html",
            queue_size=dispatch_queue.size(),
        )



if __name__ == "__main__":
    if flask_available:
        print("Starting AgriStock Flask Server on port 5000...")
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        print("Flask is not installed in this environment.")

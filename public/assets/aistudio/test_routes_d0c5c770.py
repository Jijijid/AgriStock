"""
End-to-end route tests for AgriStock (Part D evidence).
Run via: python3 test_routes.py

Uses a temporary COPY of database/agristock.db, so your real data is never modified.
Covers normal cases, empty data, missing records, and invalid input across all routes,
plus the FIFO queue behavior at checkout.
"""
import os, shutil, sys, json, sqlite3, tempfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
TMP_DB = os.path.join(tempfile.mkdtemp(), "agristock_test.db")
shutil.copy(os.path.join(BASE_DIR, "database", "agristock.db"), TMP_DB)

import database.db as dbm
dbm.DB_FILE = TMP_DB
import app as A
c = A.app.test_client()
A.app.config['TESTING'] = True
def q(sql, *a):
    con = sqlite3.connect(TMP_DB); con.row_factory = sqlite3.Row
    r = con.execute(sql, a).fetchall(); con.close(); return r
ok = 0
def check(name, cond):
    global ok
    print(("PASS " if cond else "FAIL ") + name); ok += bool(cond)
    if not cond: sys.exit(1)

for path in ['/', '/inventory', '/pos', '/reports', '/code', '/defense']:
    check(f"GET {path} -> 200", c.get(path).status_code == 200)
for s in ['revenue_desc','revenue_asc','profit_desc','date_asc','date_desc']:
    check(f"/reports?sort_by={s}", c.get('/reports?sort_by='+s).status_code == 200)

prods = q("SELECT * FROM products ORDER BY sku")
p0 = prods[0]
r = c.get('/inventory?q=' + p0['sku'])
check("SKU search finds product (binary search)", p0['name'].encode() in r.data)
r = c.get('/inventory?q=FERT-9999')
check("missing SKU -> 200, no crash", r.status_code == 200)
r = c.post('/pos/lookup_sku', json={'sku': p0['sku']})
check("lookup_sku found", r.status_code == 200 and r.get_json()['found'])
r = c.post('/pos/lookup_sku', json={'sku': 'NOPE-1'})
check("lookup_sku missing -> 404", r.status_code == 404)
r = c.post('/pos/lookup_sku', json={'sku': ''})
check("lookup_sku empty -> 400", r.status_code == 400)

n0 = len(q("SELECT id FROM products"))
c.post('/inventory/add', data=dict(category='Seeds', name='Test Seed', cost_price='10', selling_price='20', stock_quantity='5', reorder_threshold='3', unit='pack'))
check("add valid product", len(q("SELECT id FROM products")) == n0 + 1)
c.post('/inventory/add', data=dict(category='Seeds', name='Bad', cost_price='10', selling_price='-5', stock_quantity='5', unit='pack'))
c.post('/inventory/add', data=dict(category='Seeds', name='', cost_price='10', selling_price='5', stock_quantity='5', unit='pack'))
c.post('/inventory/add', data=dict(category='Seeds', name='Neg', cost_price='10', selling_price='5', stock_quantity='-1', unit='pack'))
c.post('/inventory/add', data=dict(category='Seeds', name='Letters', cost_price='abc', selling_price='5', stock_quantity='1', unit='pack'))
check("invalid adds rejected", len(q("SELECT id FROM products")) == n0 + 1)

new = q("SELECT * FROM products WHERE name='Test Seed'")[0]
c.post(f"/inventory/update/{new['id']}", data=dict(cost_price='11', selling_price='22', stock_quantity='6', reorder_threshold='3'))
check("update product", q("SELECT stock_quantity FROM products WHERE id=?", new['id'])[0][0] == 6)
c.post(f"/inventory/update/{new['id']}", data=dict(cost_price='11', selling_price='0', stock_quantity='6'))
check("invalid update rejected", q("SELECT selling_price FROM products WHERE id=?", new['id'])[0][0] == 22)
c.post('/inventory/update/99999', data=dict(cost_price='1', selling_price='1', stock_quantity='1'))
check("update missing id doesn't crash", True)

def enqueue(items, name='Tester'):
    return c.post('/pos/enqueue', data=dict(customer_name=name, order_items_json=json.dumps(items)))
sales0 = len(q("SELECT id FROM sales"))
# failing order: more than stock
enqueue([dict(product_id=new['id'], quantity=100)], 'TooMuch')
check("queue has 1 order", A.dispatch_queue.size() == 1)
c.post('/pos/dequeue')
check("FIX: failed checkout keeps order in queue", A.dispatch_queue.size() == 1)
check("no sale recorded on failure", len(q("SELECT id FROM sales")) == sales0)
check("stock unchanged on failure", q("SELECT stock_quantity FROM products WHERE id=?", new['id'])[0][0] == 6)
# recall to edit
r = c.post('/pos/dequeue_edit')
check("dequeue_edit recalls order", r.status_code == 200 and A.dispatch_queue.size() == 0)
# FIFO order of two valid orders
enqueue([dict(product_id=new['id'], quantity=2)], 'First')
enqueue([dict(product_id=new['id'], quantity=1)], 'Second')
check("peek is first order", A.dispatch_queue.peek()['customer_name'] == 'First')
c.post('/pos/dequeue')
check("success dequeues exactly one", A.dispatch_queue.size() == 1 and A.dispatch_queue.peek()['customer_name'] == 'Second')
check("stock deducted 6->4", q("SELECT stock_quantity FROM products WHERE id=?", new['id'])[0][0] == 4)
check("sale recorded", len(q("SELECT id FROM sales")) == sales0 + 1)
c.post('/pos/dequeue')
check("second processed, queue empty", A.dispatch_queue.size() == 0 and q("SELECT stock_quantity FROM products WHERE id=?", new['id'])[0][0] == 3)
c.post('/pos/dequeue')
check("dequeue on empty queue doesn't crash", True)
r = c.post('/pos/enqueue', data=dict(customer_name='x', order_items_json=''))
check("enqueue empty cart rejected", A.dispatch_queue.size() == 0)

c.post(f"/inventory/delete/{new['id']}")
check("product with sales history is protected from delete", len(q("SELECT id FROM products")) == n0 + 1)
c.post('/inventory/add', data=dict(category='Feeds', name='Never Sold', cost_price='5', selling_price='9', stock_quantity='2', reorder_threshold='1', unit='bag'))
ns = q("SELECT id FROM products WHERE name='Never Sold'")[0]['id']
r = c.post(f"/inventory/delete/{ns}", follow_redirects=True)
check("unsold product deletes cleanly", len(q("SELECT id FROM products")) == n0 + 1 and b"removed from catalog" in r.data)
r = c.post(f"/inventory/delete/{new['id']}", follow_redirects=True)
check("friendly message for protected product", b"past sales records" in r.data and b"FOREIGN KEY" not in r.data)
c.post("/inventory/delete/99999")
check("delete missing id doesn't crash", True)
# duplicate SKU must fail cleanly and NOT leave the DB locked for the next write
sku0 = q("SELECT sku FROM products LIMIT 1")[0][0]
r = c.post('/inventory/add', data=dict(category='Feeds', sku=sku0, name='Dup', cost_price='1', selling_price='2', stock_quantity='1', unit='bag'), follow_redirects=True)
check("duplicate SKU rejected with message", b"UNIQUE" in r.data and not q("SELECT 1 FROM products WHERE name='Dup'"))
r = c.post('/inventory/add', data=dict(category='Feeds', name='After Dup', cost_price='1', selling_price='2', stock_quantity='1', unit='bag'), follow_redirects=True)
check("write after failed write works (no lock leak)", bool(q("SELECT 1 FROM products WHERE name='After Dup'")))
check("dashboard still renders after changes", c.get('/').status_code == 200)
print(f"\nALL {ok} ROUTE CHECKS PASSED")

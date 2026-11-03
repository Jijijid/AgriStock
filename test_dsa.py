"""
Unit and algorithmic tests for AgriStock DSA implementations.
Run via: python3 test_dsa.py
"""

import sys
from dsa.min_heap import MinHeap
from dsa.merge_sort import merge_sort
from dsa.binary_search import binary_search_by_sku, binary_search_with_trace
from dsa.queue import OrderQueue


def test_min_heap():
    print("Testing MinHeap...")
    heap = MinHeap()
    assert heap.is_empty() is True
    assert heap.size() == 0

    items = [
        {"name": "Urea Fertilizer", "stock_quantity": 45},
        {"name": "Hybrid Corn Seeds", "stock_quantity": 4},
        {"name": "Complete Fertilizer 14-14-14", "stock_quantity": 80},
        {"name": "Broiler Starter Feed", "stock_quantity": 2},
        {"name": "Glyphosate Herbicide", "stock_quantity": 18},
    ]

    for item in items:
        heap.insert(item)

    assert heap.size() == 5
    assert heap.is_empty() is False

    # Min should be Broiler Starter Feed (stock = 2)
    min_1 = heap.extract_min()
    assert min_1["name"] == "Broiler Starter Feed"
    assert min_1["stock_quantity"] == 2

    # Next should be Hybrid Corn Seeds (stock = 4)
    min_2 = heap.extract_min()
    assert min_2["name"] == "Hybrid Corn Seeds"
    assert min_2["stock_quantity"] == 4

    # Next should be Glyphosate Herbicide (stock = 18)
    min_3 = heap.extract_min()
    assert min_3["name"] == "Glyphosate Herbicide"
    assert min_3["stock_quantity"] == 18

    print("✓ MinHeap PASSED")


def test_merge_sort():
    print("Testing Merge Sort...")
    sales = [
        {"id": 1, "total_amount": 1250.0, "profit": 350.0, "timestamp": "2026-11-01 10:00"},
        {"id": 2, "total_amount": 5400.0, "profit": 1100.0, "timestamp": "2026-11-01 11:30"},
        {"id": 3, "total_amount": 800.0, "profit": 200.0, "timestamp": "2026-11-02 08:15"},
        {"id": 4, "total_amount": 3200.0, "profit": 900.0, "timestamp": "2026-11-02 09:45"},
    ]

    # Ascending sort by total_amount
    sorted_asc = merge_sort(sales, key="total_amount", reverse=False)
    amounts_asc = [s["total_amount"] for s in sorted_asc]
    assert amounts_asc == [800.0, 1250.0, 3200.0, 5400.0]

    # Descending sort by profit
    sorted_desc = merge_sort(sales, key="profit", reverse=True)
    profits_desc = [s["profit"] for s in sorted_desc]
    assert profits_desc == [1100.0, 900.0, 350.0, 200.0]

    print("✓ Merge Sort PASSED")


def test_binary_search():
    print("Testing Binary Search...")
    products = [
        {"sku": "AGR-001", "name": "Urea 46-0-0"},
        {"sku": "AGR-005", "name": "Complete 14-14-14"},
        {"sku": "AGR-012", "name": "Corn Seeds Pioneer 30Y87"},
        {"sku": "AGR-019", "name": "Rice Seeds NSIC Rc222"},
        {"sku": "AGR-025", "name": "Hog Grower Feed 50kg"},
        {"sku": "AGR-030", "name": "Carbaryl Insecticide 1L"},
    ]

    # Found case
    found = binary_search_by_sku(products, "AGR-019")
    assert found is not None
    assert found["name"] == "Rice Seeds NSIC Rc222"

    # Edge cases
    found_first = binary_search_by_sku(products, "agr-001")
    assert found_first is not None and found_first["sku"] == "AGR-001"

    found_last = binary_search_by_sku(products, "AGR-030")
    assert found_last is not None and found_last["sku"] == "AGR-030"

    # Not found case
    not_found = binary_search_by_sku(products, "AGR-999")
    assert not_found is None

    # Trace test
    _, trace = binary_search_with_trace(products, "AGR-025")
    assert len(trace) > 0

    print("✓ Binary Search PASSED")


def test_order_queue():
    print("Testing OrderQueue (FIFO)...")
    q = OrderQueue()
    assert q.is_empty() is True
    assert q.size() == 0

    q.enqueue({"order_id": 101, "customer": "Juan Dela Cruz", "amount": 1500})
    q.enqueue({"order_id": 102, "customer": "Maria Santos", "amount": 2300})
    q.enqueue({"order_id": 103, "customer": "Pedro Penduko", "amount": 950})

    assert q.size() == 3
    assert q.peek()["customer"] == "Juan Dela Cruz"

    first = q.dequeue()
    assert first["order_id"] == 101

    second = q.dequeue()
    assert second["order_id"] == 102

    assert q.size() == 1
    assert q.peek()["order_id"] == 103

    third = q.dequeue()
    assert third["order_id"] == 103
    assert q.is_empty() is True

    print("✓ OrderQueue PASSED")


def test_min_heap_edge_cases():
    print("Testing MinHeap edge cases (empty, single, duplicates, missing key)...")
    heap = MinHeap()

    # Empty data: nothing to peek or extract
    assert heap.peek() is None
    assert heap.extract_min() is None
    assert heap.get_all_sorted_by_priority() == []

    # Single element
    heap.insert({"name": "Only Item", "stock_quantity": 7})
    assert heap.peek()["name"] == "Only Item"
    assert heap.extract_min()["stock_quantity"] == 7
    assert heap.is_empty() is True

    # Duplicate stock levels must all come out, in non-decreasing order
    for qty in [5, 3, 5, 3, 9]:
        heap.insert({"name": f"Item {qty}", "stock_quantity": qty})
    order = [heap.extract_min()["stock_quantity"] for _ in range(5)]
    assert order == [3, 3, 5, 5, 9]

    # Zero stock (out of stock) is the most critical
    heap.insert({"name": "Normal", "stock_quantity": 10})
    heap.insert({"name": "Out of Stock", "stock_quantity": 0})
    assert heap.extract_min()["name"] == "Out of Stock"

    # Non-mutating helper must leave the heap unchanged
    before = heap.size()
    _ = heap.get_all_sorted_by_priority()
    assert heap.size() == before

    # Invalid record: missing stock key is treated as 0 instead of crashing
    heap2 = MinHeap()
    heap2.insert({"name": "No Stock Field"})
    heap2.insert({"name": "Has Stock", "stock_quantity": 4})
    assert heap2.extract_min()["name"] == "No Stock Field"

    print("✓ MinHeap edge cases PASSED")


def test_merge_sort_edge_cases():
    print("Testing Merge Sort edge cases (empty, single, duplicates, stability, missing)...")

    # Empty and single-element input
    assert merge_sort([], key="total_amount") == []
    one = [{"id": 1, "total_amount": 10}]
    assert merge_sort(one, key="total_amount") == one

    # Original list must not be modified
    original = [{"id": 1, "v": 3}, {"id": 2, "v": 1}, {"id": 3, "v": 2}]
    snapshot = [dict(r) for r in original]
    _ = merge_sort(original, key="v")
    assert original == snapshot

    # Stability: equal keys keep their original relative order (ascending and descending)
    ties = [
        {"id": "a", "v": 2},
        {"id": "b", "v": 1},
        {"id": "c", "v": 2},
        {"id": "d", "v": 1},
    ]
    assert [r["id"] for r in merge_sort(ties, key="v")] == ["b", "d", "a", "c"]
    assert [r["id"] for r in merge_sort(ties, key="v", reverse=True)] == ["a", "c", "b", "d"]

    # Already sorted and reverse-sorted input (best and worst ordering)
    asc = [{"v": i} for i in range(1, 9)]
    assert [r["v"] for r in merge_sort(asc, key="v")] == list(range(1, 9))
    assert [r["v"] for r in merge_sort(list(reversed(asc)), key="v")] == list(range(1, 9))

    # String keys (timestamps and SKUs sort lexicographically)
    stamps = [
        {"timestamp": "2026-11-02 09:45"},
        {"timestamp": "2026-11-01 10:00"},
        {"timestamp": "2026-11-02 08:15"},
    ]
    got = [r["timestamp"] for r in merge_sort(stamps, key="timestamp")]
    assert got == ["2026-11-01 10:00", "2026-11-02 08:15", "2026-11-02 09:45"]

    # Missing or None key values are treated as 0 instead of crashing
    mixed = [{"id": 1, "v": 5}, {"id": 2}, {"id": 3, "v": None}]
    assert [r["id"] for r in merge_sort(mixed, key="v")] == [2, 3, 1]

    print("✓ Merge Sort edge cases PASSED")


def test_binary_search_edge_cases():
    print("Testing Binary Search edge cases (empty, missing, invalid input)...")
    products = [
        {"sku": "AGR-001", "name": "A"},
        {"sku": "AGR-005", "name": "B"},
        {"sku": "AGR-012", "name": "C"},
        {"sku": "AGR-019", "name": "D"},
    ]

    # Empty data
    assert binary_search_by_sku([], "AGR-001") is None
    assert binary_search_with_trace([], "AGR-001") == (None, [])

    # Invalid input: empty or blank target
    assert binary_search_by_sku(products, "") is None
    assert binary_search_by_sku(products, None) is None

    # Whitespace and case are normalized
    assert binary_search_by_sku(products, "  agr-012  ")["name"] == "C"

    # Missing records: smaller than first, larger than last, and between two SKUs
    assert binary_search_by_sku(products, "AGR-000") is None
    assert binary_search_by_sku(products, "AGR-999") is None
    assert binary_search_by_sku(products, "AGR-010") is None

    # Single-element list
    assert binary_search_by_sku([{"sku": "X-1"}], "X-1") == {"sku": "X-1"}
    assert binary_search_by_sku([{"sku": "X-1"}], "X-2") is None

    # Best case: target at the midpoint is found on the first comparison
    found, trace = binary_search_with_trace(products, "AGR-005")
    assert found["name"] == "B" and len(trace) == 1

    # Worst case: comparisons stay within floor(log2(n)) + 1 for a miss
    big = [{"sku": f"SKU-{i:04d}"} for i in range(1000)]
    _, trace = binary_search_with_trace(big, "SKU-9999")
    assert len(trace) <= 10  # floor(log2(1000)) + 1 = 10

    # Every item in a larger catalog is found, and the result matches the target
    for i in (0, 1, 499, 500, 998, 999):
        sku = f"SKU-{i:04d}"
        assert binary_search_by_sku(big, sku)["sku"] == sku

    print("✓ Binary Search edge cases PASSED")


def test_order_queue_edge_cases():
    print("Testing OrderQueue edge cases (empty, invalid input, reuse after empty)...")
    q = OrderQueue()

    # Empty data
    assert q.dequeue() is None
    assert q.peek() is None
    assert q.to_list() == []
    assert q.size() == 0

    # Invalid input: only dictionaries are accepted
    for bad in ("not a dict", 42, None, ["list"]):
        try:
            q.enqueue(bad)
            assert False, f"enqueue({bad!r}) should raise TypeError"
        except TypeError:
            pass
    assert q.size() == 0

    # peek and to_list must not remove anything
    q.enqueue({"order_id": 1})
    q.enqueue({"order_id": 2})
    assert q.peek()["order_id"] == 1
    assert [o["order_id"] for o in q.to_list()] == [1, 2]
    assert q.size() == 2

    # Draining to empty, then reusing the queue (tail pointer must reset correctly)
    assert q.dequeue()["order_id"] == 1
    assert q.dequeue()["order_id"] == 2
    assert q.dequeue() is None
    assert q.is_empty() is True
    q.enqueue({"order_id": 3})
    assert q.peek()["order_id"] == 3
    assert q.size() == 1

    # clear() empties the queue and it still works afterwards
    q.enqueue({"order_id": 4})
    q.clear()
    assert q.is_empty() is True and q.peek() is None
    q.enqueue({"order_id": 5})
    assert q.dequeue()["order_id"] == 5

    # Large FIFO run keeps strict arrival order
    for i in range(1000):
        q.enqueue({"order_id": i})
    assert [q.dequeue()["order_id"] for _ in range(1000)] == list(range(1000))
    assert q.is_empty() is True

    # Structure check: implemented without a built-in queue container
    assert not hasattr(q, "_items")

    print("✓ OrderQueue edge cases PASSED")


if __name__ == "__main__":
    test_min_heap()
    test_merge_sort()
    test_binary_search()
    test_order_queue()
    test_min_heap_edge_cases()
    test_merge_sort_edge_cases()
    test_binary_search_edge_cases()
    test_order_queue_edge_cases()
    print("\nALL DSA TESTS COMPLETED SUCCESSFULLY!")

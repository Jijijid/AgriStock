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


if __name__ == "__main__":
    test_min_heap()
    test_merge_sort()
    test_binary_search()
    test_order_queue()
    print("\nALL DSA TESTS COMPLETED SUCCESSFULLY!")

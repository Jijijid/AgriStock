"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/binary_search.py
Application: Fast Barcode / SKU Product Lookup

Design Rationale:
-----------------
Agricultural supply warehouses store hundreds to thousands of SKUs (fertilizers,
seed variants, feed bags, pesticides). Linear search O(n) degrades cashier checkout
speed and inventory audits. Binary search achieves O(log n) lookup over a sorted
SKU index, halving the search space in each iteration.

Complexity:
-----------
- Time:  O(log n) worst and average case, O(1) best case (found at midpoint)
- Space: O(1) iterative auxiliary memory
"""

from typing import List, Dict, Any, Optional, Tuple


def binary_search_by_sku(
    sorted_products: List[Dict[str, Any]],
    target_sku: str,
) -> Optional[Dict[str, Any]]:
    """
    Search for a product with the exact target SKU using iterative binary search.
    Precondition: `sorted_products` must be sorted in ascending lexicographical order by 'sku'.

    :param sorted_products: List of product dictionaries, sorted by 'sku'
    :param target_sku: The alphanumeric SKU string to locate (case-insensitive search)
    :return: The matching product dictionary if found, else None
    """
    if not sorted_products or not target_sku:
        return None

    target = target_sku.strip().upper()
    low = 0
    high = len(sorted_products) - 1

    while low <= high:
        # Calculate midpoint safely preventing integer overflow
        mid = low + (high - low) // 2
        current_sku = str(sorted_products[mid].get("sku", "")).strip().upper()

        if current_sku == target:
            return sorted_products[mid]
        elif current_sku < target:
            # Target lies in the right partition
            low = mid + 1
        else:
            # Target lies in the left partition
            high = mid - 1

    # Element not present in the sorted inventory
    return None


def binary_search_with_trace(
    sorted_products: List[Dict[str, Any]],
    target_sku: str,
) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Educational extension for ITECC04 project presentation:
    Performs binary search while recording every pointer jump (low, mid, high,
    comparison value, decision) to visually prove O(log n) execution.

    :return: (result_product_or_None, list_of_trace_steps)
    """
    trace: List[Dict[str, Any]] = []
    if not sorted_products or not target_sku:
        return None, trace

    target = target_sku.strip().upper()
    low = 0
    high = len(sorted_products) - 1
    step = 1

    while low <= high:
        mid = low + (high - low) // 2
        current_sku = str(sorted_products[mid].get("sku", "")).strip().upper()
        product_name = sorted_products[mid].get("name", "")

        step_record = {
            "step": step,
            "low_index": low,
            "mid_index": mid,
            "high_index": high,
            "mid_sku": current_sku,
            "product_name": product_name,
            "target": target,
        }

        if current_sku == target:
            step_record["decision"] = f"MATCH FOUND! '{current_sku}' == '{target}'"
            trace.append(step_record)
            return sorted_products[mid], trace
        elif current_sku < target:
            step_record["decision"] = (
                f"'{current_sku}' < '{target}' -> Shift LOW pointer to mid+1 ({mid + 1})"
            )
            trace.append(step_record)
            low = mid + 1
        else:
            step_record["decision"] = (
                f"'{current_sku}' > '{target}' -> Shift HIGH pointer to mid-1 ({mid - 1})"
            )
            trace.append(step_record)
            high = mid - 1

        step += 1

    return None, trace

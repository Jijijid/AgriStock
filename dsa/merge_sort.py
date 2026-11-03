"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/merge_sort.py
Application: Sales & Revenue Ledger Sorting

Design Rationale:
-----------------
Merge Sort is a stable, divide-and-conquer algorithm with guaranteed O(n log n)
time complexity regardless of input distribution (best, average, worst case).
Stability is critical for financial ledgers: two sales with identical revenue
maintain their original timestamp sequence.

Complexity:
-----------
- Time:  O(n log n) in all cases (best, average, worst)
- Space: O(n) auxiliary space for sub-array merging
- Stable: Yes (elements with equal keys retain their relative order)
"""

from typing import List, Dict, Any


def merge(
    left: List[Dict[str, Any]],
    right: List[Dict[str, Any]],
    key: str,
    reverse: bool = False,
) -> List[Dict[str, Any]]:
    """
    Merge two sorted lists of record dictionaries into a single sorted list.

    :param left: Sorted left partition
    :param right: Sorted right partition
    :param key: Dictionary key to sort by (e.g. 'total_amount', 'profit', 'timestamp')
    :param reverse: False for ascending order, True for descending order
    :return: Merged sorted list
    """
    merged: List[Dict[str, Any]] = []
    i = 0
    j = 0
    len_left = len(left)
    len_right = len(right)

    while i < len_left and j < len_right:
        val_left = left[i].get(key, 0)
        val_right = right[j].get(key, 0)

        # Handle numeric vs string comparisons safely
        if val_left is None:
            val_left = 0
        if val_right is None:
            val_right = 0

        # Normal comparison (Ascending: left <= right)
        # Reverse comparison (Descending: left >= right)
        # We use '<=' or '>=' respectively to ensure merge stability
        condition = (val_left >= val_right) if reverse else (val_left <= val_right)

        if condition:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    # Append any remaining elements from left partition
    while i < len_left:
        merged.append(left[i])
        i += 1

    # Append any remaining elements from right partition
    while j < len_right:
        merged.append(right[j])
        j += 1

    return merged


def merge_sort(
    records: List[Dict[str, Any]],
    key: str,
    reverse: bool = False,
) -> List[Dict[str, Any]]:
    """
    Recursively sorts a list of dictionaries by a given key using Merge Sort.
    Does NOT use Python's built-in sort() or sorted().

    :param records: List of dictionary records to sort
    :param key: The dictionary key to sort by (e.g., 'total_amount', 'profit', 'timestamp')
    :param reverse: True for descending, False for ascending (default)
    :return: A newly sorted list of records
    """
    # Base case: a list of 0 or 1 element is already sorted
    if len(records) <= 1:
        return list(records)

    # Divide step: find midpoint and split the array
    mid = len(records) // 2
    left_half = records[:mid]
    right_half = records[mid:]

    # Conquer step: recursively sort both halves
    sorted_left = merge_sort(left_half, key, reverse)
    sorted_right = merge_sort(right_half, key, reverse)

    # Combine step: merge the two sorted halves
    return merge(sorted_left, sorted_right, key, reverse)

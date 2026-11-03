"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/min_heap.py
Application: Critical Restock Priority Alert

Design Rationale:
-----------------
A Min-Heap is a complete binary tree where the key at the root must be the minimum
among all keys present in the binary heap. In AgriStock, inventory items are prioritized
by lowest remaining stock (stock_quantity). Whenever stock falls below the reorder threshold,
it must be escalated immediately to procurement.

Complexity:
-----------
- insert(product): O(log n)
- extract_min():   O(log n)
- peek():          O(1)
- is_empty():      O(1)
- Space:           O(n) stored sequentially in an array
"""

from typing import List, Dict, Any, Optional


class MinHeap:
    """
    MinHeap data structure tailored for Agricultural Product Inventory restock prioritization.
    Array-based binary heap representation:
      - Parent of index i:      (i - 1) // 2
      - Left child of index i:   2 * i + 1
      - Right child of index i:  2 * i + 2
    Comparison Key: product['stock_quantity'] (ascending order)
    """

    def __init__(self) -> None:
        """Initialize an empty binary min-heap array."""
        self.heap: List[Dict[str, Any]] = []

    def is_empty(self) -> bool:
        """Return True if heap contains no elements, False otherwise."""
        return len(self.heap) == 0

    def size(self) -> int:
        """Return the total number of products currently in the heap."""
        return len(self.heap)

    def peek(self) -> Optional[Dict[str, Any]]:
        """
        Return the product with the minimum stock quantity without removing it.
        Time Complexity: O(1)
        """
        if self.is_empty():
            return None
        return self.heap[0]

    def insert(self, product: Dict[str, Any]) -> None:
        """
        Insert a product dictionary into the MinHeap and restore heap property.
        Time Complexity: O(log n)
        """
        # Append to the end of the complete binary tree representation
        self.heap.append(product)
        # Restore heap order upwards
        self._heapify_up(len(self.heap) - 1)

    def extract_min(self) -> Optional[Dict[str, Any]]:
        """
        Remove and return the product with the lowest remaining stock quantity.
        Time Complexity: O(log n)
        """
        if self.is_empty():
            return None

        # Root holds the minimum element
        min_item = self.heap[0]

        # Move the last element to root and remove the last position
        last_item = self.heap.pop()
        if not self.is_empty():
            self.heap[0] = last_item
            # Restore heap order downwards
            self._heapify_down(0)

        return min_item

    def _heapify_up(self, index: int) -> None:
        """
        Shift the node at `index` upward until the min-heap invariant is satisfied.
        Parent must have stock_quantity <= child.
        """
        while index > 0:
            parent_idx = (index - 1) // 2
            curr_stock = self.heap[index].get("stock_quantity", 0)
            parent_stock = self.heap[parent_idx].get("stock_quantity", 0)

            # If current item has strictly lower stock than parent, bubble up
            if curr_stock < parent_stock:
                self.heap[index], self.heap[parent_idx] = (
                    self.heap[parent_idx],
                    self.heap[index],
                )
                index = parent_idx
            else:
                break

    def _heapify_down(self, index: int) -> None:
        """
        Shift the node at `index` downward until the min-heap invariant is satisfied.
        Node swaps with the smaller of its two children.
        """
        size = len(self.heap)
        while True:
            smallest = index
            left_child = 2 * index + 1
            right_child = 2 * index + 2

            # Check if left child has lower stock
            if (
                left_child < size
                and self.heap[left_child].get("stock_quantity", 0)
                < self.heap[smallest].get("stock_quantity", 0)
            ):
                smallest = left_child

            # Check if right child has lower stock than current smallest
            if (
                right_child < size
                and self.heap[right_child].get("stock_quantity", 0)
                < self.heap[smallest].get("stock_quantity", 0)
            ):
                smallest = right_child

            # If the current node is already smaller than or equal to both children, stop
            if smallest != index:
                self.heap[index], self.heap[smallest] = (
                    self.heap[smallest],
                    self.heap[index],
                )
                index = smallest
            else:
                break

    def get_all_sorted_by_priority(self) -> List[Dict[str, Any]]:
        """
        Helper method to extract all items in order of criticality
        without mutating the original heap instance.
        """
        temp_heap = MinHeap()
        # Shallow copy items into temporary heap
        for item in self.heap:
            temp_heap.insert(item)

        sorted_list = []
        while not temp_heap.is_empty():
            sorted_list.append(temp_heap.extract_min())
        return sorted_list

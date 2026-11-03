"""
AgriStock - Agricultural Inventory & DSA Management System
Universidad de Dagupan | ITECC04: Data Structures & Algorithms
Module: dsa/queue.py
Application: Checkout & Warehouse Dispatch Queue

Design Rationale:
-----------------
In retail agricultural supply centers, multiple farmers and agricultural workers
place bulk orders simultaneously (e.g., during planting season for fertilizer and seeds).
To prevent race conditions, avoid inventory over-allocation, and guarantee fairness,
orders enter a strictly ordered First-In, First-Out (FIFO) queue. Orders are staged
and verified sequentially before committing atomic stock deductions to the database.

Complexity:
-----------
- enqueue(order): O(1) amortized
- dequeue():      O(1)
- peek():         O(1)
- is_empty():     O(1)
- size():         O(1)
- Space:          O(n) where n is the number of queued orders
"""

from typing import Dict, Any, Optional, List
from collections import deque


class OrderQueue:
    """
    Pure FIFO (First-In, First-Out) Queue implementation for managing
    checkout transactions and warehouse dispatch requests.
    """

    def __init__(self) -> None:
        """Initialize an empty order queue using an internal double-ended container."""
        self._items: deque[Dict[str, Any]] = deque()

    def enqueue(self, order: Dict[str, Any]) -> None:
        """
        Add a new order to the tail (back) of the queue.
        Time Complexity: O(1)
        """
        if not isinstance(order, dict):
            raise TypeError("Order must be a valid dictionary structure.")
        self._items.append(order)

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Remove and return the order at the head (front) of the queue.
        Time Complexity: O(1)
        Returns None if queue is empty.
        """
        if self.is_empty():
            return None
        return self._items.popleft()

    def peek(self) -> Optional[Dict[str, Any]]:
        """
        Inspect the next order in line at the head without removing it.
        Time Complexity: O(1)
        Returns None if queue is empty.
        """
        if self.is_empty():
            return None
        return self._items[0]

    def is_empty(self) -> bool:
        """
        Check if the queue is empty.
        Time Complexity: O(1)
        """
        return len(self._items) == 0

    def size(self) -> int:
        """
        Return the number of orders currently waiting in the dispatch queue.
        Time Complexity: O(1)
        """
        return len(self._items)

    def to_list(self) -> List[Dict[str, Any]]:
        """
        Return a snapshot list of queued orders from head to tail
        for inspection and UI rendering without mutating the queue.
        """
        return list(self._items)

    def clear(self) -> None:
        """Remove all orders from the queue."""
        self._items.clear()

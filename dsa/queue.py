"""
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
"""

from typing import Dict, Any, Optional, List


class _Node:
    """A single link in the queue: one order plus a pointer to the next node."""

    __slots__ = ("order", "next")

    def __init__(self, order: Dict[str, Any]) -> None:
        self.order = order
        self.next: Optional["_Node"] = None


class OrderQueue:
    """Pure FIFO queue implemented as a singly linked list."""

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

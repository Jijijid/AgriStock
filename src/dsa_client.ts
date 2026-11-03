/**
 * AgriStock Frontend DSA Engine
 * Mirrors the exact Python algorithms from dsa/min_heap.py, dsa/merge_sort.py,
 * dsa/binary_search.py, and dsa/queue.py without any built-in sort() shortcuts.
 */

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: 'Fertilizers' | 'Seeds' | 'Feeds' | 'Agrochemicals';
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  reorder_threshold: number;
  unit: string;
}

export interface SaleItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  receipt_number: string;
  customer_name: string;
  total_amount: number;
  cost_total: number;
  profit: number;
  items_count: number;
  timestamp: string;
  items?: SaleItem[];
}

export interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  unit: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  cost_subtotal: number;
  profit: number;
}

export interface QueuedOrder {
  order_id: string;
  customer_name: string;
  items: CartItem[];
  total_items_count: number;
  total_amount: number;
  cost_total: number;
  profit: number;
  created_at: string;
}

export interface SearchTraceStep {
  step: number;
  low_index: number;
  mid_index: number;
  high_index: number;
  mid_sku: string;
  product_name: string;
  target: string;
  decision: string;
}

// Category Prefix Mapping for Automatic SKU Generation
export const CATEGORY_PREFIXES: Record<string, string> = {
  Fertilizers: 'FERT',
  Seeds: 'SEED',
  Feeds: 'FEED',
  Agrochemicals: 'AGRO',
};

export function generateNextSku(category: string, products: Product[]): string {
  const prefix = CATEGORY_PREFIXES[category] || 'AGRI';
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

  for (const p of products) {
    const match = p.sku.trim().match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

// ==========================================
// 1. MIN-HEAP IMPLEMENTATION (dsa/min_heap.py)
// ==========================================
export class ClientMinHeap {
  public heap: Product[] = [];

  constructor(items?: Product[]) {
    if (items) {
      for (const item of items) {
        this.insert(item);
      }
    }
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  public peek(): Product | null {
    if (this.isEmpty()) return null;
    return this.heap[0];
  }

  public insert(product: Product): void {
    this.heap.push({ ...product });
    this._heapifyUp(this.heap.length - 1);
  }

  public extractMin(): Product | null {
    if (this.isEmpty()) return null;
    const minItem = this.heap[0];
    const lastItem = this.heap.pop()!;
    if (!this.isEmpty()) {
      this.heap[0] = lastItem;
      this._heapifyDown(0);
    }
    return minItem;
  }

  private _heapifyUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (this.heap[curr].stock_quantity < this.heap[parent].stock_quantity) {
        const temp = this.heap[curr];
        this.heap[curr] = this.heap[parent];
        this.heap[parent] = temp;
        curr = parent;
      } else {
        break;
      }
    }
  }

  private _heapifyDown(index: number): void {
    let curr = index;
    const len = this.heap.length;

    while (true) {
      let smallest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < len && this.heap[left].stock_quantity < this.heap[smallest].stock_quantity) {
        smallest = left;
      }
      if (right < len && this.heap[right].stock_quantity < this.heap[smallest].stock_quantity) {
        smallest = right;
      }

      if (smallest !== curr) {
        const temp = this.heap[curr];
        this.heap[curr] = this.heap[smallest];
        this.heap[smallest] = temp;
        curr = smallest;
      } else {
        break;
      }
    }
  }

  public extractAllSorted(): Product[] {
    const tempHeap = new ClientMinHeap();
    for (const item of this.heap) {
      tempHeap.insert(item);
    }
    const result: Product[] = [];
    while (!tempHeap.isEmpty()) {
      const min = tempHeap.extractMin();
      if (min) result.push(min);
    }
    return result;
  }
}

// ==========================================
// 2. MERGE SORT IMPLEMENTATION (dsa/merge_sort.py)
// ==========================================
function client_merge<T extends Record<string, any>>(
  left: T[],
  right: T[],
  key: keyof T,
  reverse = false
): T[] {
  const merged: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    const valL = left[i][key];
    const valR = right[j][key];

    let condition: boolean;
    if (reverse) {
      condition = valL >= valR;
    } else {
      condition = valL <= valR;
    }

    if (condition) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    merged.push(left[i]);
    i++;
  }
  while (j < right.length) {
    merged.push(right[j]);
    j++;
  }

  return merged;
}

export function client_merge_sort<T extends Record<string, any>>(
  records: T[],
  key: keyof T,
  reverse = false
): T[] {
  if (records.length <= 1) {
    return [...records];
  }

  const mid = Math.floor(records.length / 2);
  const leftHalf = records.slice(0, mid);
  const rightHalf = records.slice(mid);

  const sortedLeft = client_merge_sort(leftHalf, key, reverse);
  const sortedRight = client_merge_sort(rightHalf, key, reverse);

  return client_merge(sortedLeft, sortedRight, key, reverse);
}

// ==========================================
// 3. BINARY SEARCH IMPLEMENTATION (dsa/binary_search.py)
// ==========================================
export function client_binary_search_by_sku(
  sortedProducts: Product[],
  targetSku: string
): Product | null {
  if (!sortedProducts.length || !targetSku) return null;
  const target = targetSku.trim().toUpperCase();
  let low = 0;
  let high = sortedProducts.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const midSku = sortedProducts[mid].sku.trim().toUpperCase();

    if (midSku === target) {
      return sortedProducts[mid];
    } else if (midSku < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}

export function client_binary_search_with_trace(
  sortedProducts: Product[],
  targetSku: string
): { result: Product | null; trace: SearchTraceStep[] } {
  const trace: SearchTraceStep[] = [];
  if (!sortedProducts.length || !targetSku) {
    return { result: null, trace };
  }

  const target = targetSku.trim().toUpperCase();
  let low = 0;
  let high = sortedProducts.length - 1;
  let step = 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const midSku = sortedProducts[mid].sku.trim().toUpperCase();
    const productName = sortedProducts[mid].name;

    const stepRecord: SearchTraceStep = {
      step,
      low_index: low,
      mid_index: mid,
      high_index: high,
      mid_sku: midSku,
      product_name: productName,
      target,
      decision: '',
    };

    if (midSku === target) {
      stepRecord.decision = `MATCH FOUND! '${midSku}' == '${target}' at index ${mid}`;
      trace.push(stepRecord);
      return { result: sortedProducts[mid], trace };
    } else if (midSku < target) {
      stepRecord.decision = `'${midSku}' < '${target}' => Discard left partition. Shift low pointer to mid+1 (${mid + 1})`;
      trace.push(stepRecord);
      low = mid + 1;
    } else {
      stepRecord.decision = `'${midSku}' > '${target}' => Discard right partition. Shift high pointer to mid-1 (${mid - 1})`;
      trace.push(stepRecord);
      high = mid - 1;
    }

    step++;
  }

  return { result: null, trace };
}

// ==========================================
// 4. FIFO ORDER QUEUE IMPLEMENTATION (dsa/queue.py)
// ==========================================
export class ClientOrderQueue {
  private items: QueuedOrder[] = [];

  constructor(initialItems?: QueuedOrder[]) {
    if (initialItems) {
      this.items = [...initialItems];
    }
  }

  public enqueue(order: QueuedOrder): void {
    this.items.push(order);
  }

  public dequeue(): QueuedOrder | null {
    if (this.isEmpty()) return null;
    return this.items.shift() || null;
  }

  public peek(): QueuedOrder | null {
    if (this.isEmpty()) return null;
    return this.items[0];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public toList(): QueuedOrder[] {
    return [...this.items];
  }

  public clear(): void {
    this.items = [];
  }
}

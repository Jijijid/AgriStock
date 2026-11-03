/**
 * AgriStock - Agricultural Inventory & Farm Supply Management System
 * Universidad de Dagupan | School of Information Technology
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Sale,
  CartItem,
  QueuedOrder,
  SearchTraceStep,
  ClientMinHeap,
  ClientOrderQueue,
  client_merge_sort,
  client_binary_search_by_sku,
  client_binary_search_with_trace,
  generateNextSku,
  CATEGORY_PREFIXES
} from './dsa_client.ts';
import { PYTHON_FILES } from './python_sources.ts';
import {
  Sprout,
  Boxes,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  Code2,
  GraduationCap,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Edit,
  TrendingUp,
  Package,
  Copy,
  Check,
  ShoppingCart,
  Minus,
  X,
  Undo2,
  AlertCircle,
  Barcode,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, sku: 'FERT-001', name: 'Urea Fertilizer 46-0-0', category: 'Fertilizers', cost_price: 1950.00, selling_price: 2350.00, stock_quantity: 8, reorder_threshold: 20, unit: '50kg sack' },
  { id: 2, sku: 'FERT-002', name: 'Complete Fertilizer 14-14-14', category: 'Fertilizers', cost_price: 1850.00, selling_price: 2200.00, stock_quantity: 34, reorder_threshold: 20, unit: '50kg sack' },
  { id: 3, sku: 'FERT-003', name: 'Ammonium Sulfate 21-0-0', category: 'Fertilizers', cost_price: 950.00, selling_price: 1200.00, stock_quantity: 5, reorder_threshold: 15, unit: '50kg sack' },
  { id: 4, sku: 'FERT-004', name: 'Muriate of Potash 0-0-60', category: 'Fertilizers', cost_price: 2100.00, selling_price: 2600.00, stock_quantity: 14, reorder_threshold: 15, unit: '50kg sack' },
  { id: 5, sku: 'FERT-005', name: 'Organic Vermicast Soil Conditioner', category: 'Fertilizers', cost_price: 280.00, selling_price: 420.00, stock_quantity: 90, reorder_threshold: 30, unit: '40kg sack' },
  { id: 6, sku: 'SEED-001', name: 'Pioneer 30Y87 Hybrid Corn Seeds', category: 'Seeds', cost_price: 4200.00, selling_price: 4950.00, stock_quantity: 3, reorder_threshold: 10, unit: '5kg bag' },
  { id: 7, sku: 'SEED-002', name: 'NSIC Rc222 Inbred Palay Seeds', category: 'Seeds', cost_price: 1400.00, selling_price: 1750.00, stock_quantity: 42, reorder_threshold: 15, unit: '40kg sack' },
  { id: 8, sku: 'SEED-003', name: 'East-West Eggplant Dumaguete Long', category: 'Seeds', cost_price: 320.00, selling_price: 450.00, stock_quantity: 65, reorder_threshold: 25, unit: '100g pouch' },
  { id: 9, sku: 'SEED-004', name: 'Condor F1 Hybrid Tomato Seeds', category: 'Seeds', cost_price: 480.00, selling_price: 650.00, stock_quantity: 19, reorder_threshold: 20, unit: '50g tin' },
  { id: 10, sku: 'FEED-001', name: 'B-Meg Hog Starter Pellets', category: 'Feeds', cost_price: 1520.00, selling_price: 1780.00, stock_quantity: 28, reorder_threshold: 25, unit: '50kg sack' },
  { id: 11, sku: 'FEED-002', name: 'B-Meg Hog Grower Mash', category: 'Feeds', cost_price: 1450.00, selling_price: 1690.00, stock_quantity: 4, reorder_threshold: 20, unit: '50kg sack' },
  { id: 12, sku: 'FEED-003', name: 'Purina Broiler Starter Crumble', category: 'Feeds', cost_price: 1680.00, selling_price: 1980.00, stock_quantity: 52, reorder_threshold: 30, unit: '50kg sack' },
  { id: 13, sku: 'FEED-004', name: 'Tateh Tilapia Sinking Pellets', category: 'Feeds', cost_price: 1100.00, selling_price: 1350.00, stock_quantity: 12, reorder_threshold: 20, unit: '25kg sack' },
  { id: 14, sku: 'AGRO-001', name: 'Glyphosate Systemic Herbicide 480SL', category: 'Agrochemicals', cost_price: 720.00, selling_price: 950.00, stock_quantity: 18, reorder_threshold: 15, unit: '1 Liter' },
  { id: 15, sku: 'AGRO-002', name: 'Cypermethrin 5EC Broad Insecticide', category: 'Agrochemicals', cost_price: 450.00, selling_price: 620.00, stock_quantity: 2, reorder_threshold: 10, unit: '1 Liter' },
  { id: 16, sku: 'AGRO-003', name: 'Mancozeb 80WP Protectant Fungicide', category: 'Agrochemicals', cost_price: 580.00, selling_price: 780.00, stock_quantity: 25, reorder_threshold: 15, unit: '1kg box' },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 1,
    receipt_number: 'REC-202611-001',
    customer_name: 'Mang Tomas Farm - San Fabian',
    total_amount: 9400.00,
    cost_total: 7800.00,
    profit: 1600.00,
    items_count: 4,
    timestamp: '2026-11-01 10:30:15',
    items: [
      { product_id: 1, product_name: 'Urea Fertilizer 46-0-0', sku: 'FERT-001', quantity: 4, unit_price: 2350.00, subtotal: 9400.00 }
    ]
  },
  {
    id: 2,
    receipt_number: 'REC-202611-002',
    customer_name: 'Dagupan Agri-Coop Cluster 4',
    total_amount: 17850.00,
    cost_total: 14800.00,
    profit: 3050.00,
    items_count: 10,
    timestamp: '2026-11-01 14:15:40',
    items: [
      { product_id: 2, product_name: 'Complete Fertilizer 14-14-14', sku: 'FERT-002', quantity: 5, unit_price: 2200.00, subtotal: 11000.00 },
      { product_id: 7, product_name: 'NSIC Rc222 Inbred Palay Seeds', sku: 'SEED-002', quantity: 3, unit_price: 1750.00, subtotal: 5250.00 },
      { product_id: 14, product_name: 'Glyphosate Systemic Herbicide 480SL', sku: 'AGRO-001', quantity: 2, unit_price: 950.00, subtotal: 1900.00 }
    ]
  },
  {
    id: 3,
    receipt_number: 'REC-202611-003',
    customer_name: 'Ka Pedro Piggery - Calasiao',
    total_amount: 6760.00,
    cost_total: 5800.00,
    profit: 960.00,
    items_count: 4,
    timestamp: '2026-11-02 08:20:10',
    items: [
      { product_id: 11, product_name: 'B-Meg Hog Grower Mash', sku: 'FEED-002', quantity: 4, unit_price: 1690.00, subtotal: 6760.00 }
    ]
  },
  {
    id: 4,
    receipt_number: 'REC-202611-004',
    customer_name: 'Elena Santos Rice Fields - Mangaldan',
    total_amount: 8750.00,
    cost_total: 7000.00,
    profit: 1750.00,
    items_count: 5,
    timestamp: '2026-11-02 09:45:22',
    items: [
      { product_id: 7, product_name: 'NSIC Rc222 Inbred Palay Seeds', sku: 'SEED-002', quantity: 5, unit_price: 1750.00, subtotal: 8750.00 }
    ]
  },
  {
    id: 5,
    receipt_number: 'REC-202611-005',
    customer_name: 'Bonuan Tilapia Hatchery',
    total_amount: 4050.00,
    cost_total: 3300.00,
    profit: 750.00,
    items_count: 3,
    timestamp: '2026-11-02 11:10:05',
    items: [
      { product_id: 13, product_name: 'Tateh Tilapia Sinking Pellets', sku: 'FEED-004', quantity: 3, unit_price: 1350.00, subtotal: 4050.00 }
    ]
  },
  {
    id: 6,
    receipt_number: 'REC-202611-006',
    customer_name: 'Juan Dela Cruz (Walk-in Farmer)',
    total_amount: 1900.00,
    cost_total: 1440.00,
    profit: 460.00,
    items_count: 2,
    timestamp: '2026-11-02 12:40:18',
    items: [
      { product_id: 14, product_name: 'Glyphosate Systemic Herbicide 480SL', sku: 'AGRO-001', quantity: 2, unit_price: 950.00, subtotal: 1900.00 }
    ]
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pos' | 'reports' | 'code' | 'defense'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [ordersQueue, setOrdersQueue] = useState<QueuedOrder[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; message: string } | null>(null);

  // Search State for Inventory (Unified search with auto-suggest dropdown)
  const [searchQuery, setSearchQuery] = useState('');
  const [isInventorySearchFocused, setIsInventorySearchFocused] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Add Product Form State with Automatic Category-based SKU
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductCategory, setNewProductCategory] = useState<Product['category']>('Fertilizers');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductCost, setNewProductCost] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('25');
  const [newProductThreshold, setNewProductThreshold] = useState('15');
  const [newProductUnit, setNewProductUnit] = useState('50kg sack');

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Verification Pop-up Modals
  const [zeroStockConfirm, setZeroStockConfirm] = useState<{
    isOpen: boolean;
    productName: string;
    onConfirm: () => void;
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productId: number;
    productName: string;
    productSku: string;
  } | null>(null);

  // POS State: Multi-Item Checkout & Searchable Items with Auto-Suggest
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posProductSearch, setPosProductSearch] = useState('');
  const [isPosSearchFocused, setIsPosSearchFocused] = useState(false);
  const [posSelectedProductId, setPosSelectedProductId] = useState<number | ''>('');
  const [posItemQuantity, setPosItemQuantity] = useState<number>(1);
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);

  // Reports Sort State
  const [reportSortBy, setReportSortBy] = useState<'revenue_desc' | 'revenue_asc' | 'profit_desc' | 'date_desc' | 'date_asc'>('revenue_desc');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

  // Code Inspector State
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('min_heap');
  const [copied, setCopied] = useState(false);

  // Automatically update SKU when category changes or modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      const generated = generateNextSku(newProductCategory, products);
      setNewProductSku(generated);
    }
  }, [newProductCategory, isAddModalOpen, products]);

  // Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // -----------------------------------------------------------------
  // 1. MIN-HEAP CRITICAL RESTOCK EXTRACTION (Pure DSA)
  // -----------------------------------------------------------------
  const criticalAlerts = useMemo(() => {
    const heap = new ClientMinHeap();
    for (const p of products) {
      heap.insert(p);
    }
    const alerts: Product[] = [];
    while (!heap.isEmpty()) {
      const minItem = heap.extractMin();
      if (minItem && minItem.stock_quantity <= minItem.reorder_threshold) {
        alerts.push(minItem);
      }
    }
    return alerts;
  }, [products]);

  // Financial KPIs
  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total_amount, 0), [sales]);
  const totalProfit = useMemo(() => sales.reduce((acc, s) => acc + s.profit, 0), [sales]);
  const totalStockUnits = useMemo(() => products.reduce((acc, p) => acc + p.stock_quantity, 0), [products]);

  // Recent Sales sorted chronologically using custom Merge Sort
  const recentSales = useMemo(() => {
    return client_merge_sort(sales, 'timestamp', true).slice(0, 5);
  }, [sales]);

  // -----------------------------------------------------------------
  // 2. INVENTORY FILTERING & BINARY SEARCH O(log n)
  // -----------------------------------------------------------------
  // Precondition: Catalog sorted in ascending order by SKU via custom Merge Sort O(n log n)
  const skuSortedCatalog = useMemo(() => {
    return client_merge_sort(products, 'sku', false);
  }, [products]);

  // Evaluates inventory search using custom Binary Search O(log n) for SKU or Name search
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim();
    let baseList = [...skuSortedCatalog];

    if (selectedCategoryFilter !== 'All') {
      baseList = baseList.filter(p => p.category === selectedCategoryFilter);
    }

    if (!query) {
      return baseList;
    }

    // Auto-detect SKU format or exact SKU match
    const isSkuMode =
      query.includes('-') ||
      Object.values(CATEGORY_PREFIXES).some(prefix => query.toUpperCase().startsWith(prefix)) ||
      skuSortedCatalog.some(p => p.sku.toUpperCase() === query.toUpperCase());

    if (isSkuMode) {
      // Actively invoke custom Binary Search O(log n)
      const match = client_binary_search_by_sku(skuSortedCatalog, query);
      if (match) {
        if (selectedCategoryFilter === 'All' || match.category === selectedCategoryFilter) {
          return [match];
        } else {
          return [];
        }
      } else {
        return [];
      }
    } else {
      // Linear scan fallback for general product name search
      const qLower = query.toLowerCase();
      return baseList.filter(p => p.name.toLowerCase().includes(qLower));
    }
  }, [skuSortedCatalog, searchQuery, selectedCategoryFilter]);

  // Automatic Suggestions for Inventory Search (matches product name or SKU)
  const inventorySuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [products, searchQuery]);

  // Automatic Suggestions for POS Product Search (matches product name or SKU)
  const posSuggestions = useMemo(() => {
    const q = posProductSearch.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [products, posProductSearch]);

  // Handle Add Product Submission
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sku = newProductSku.trim().toUpperCase();
    const name = newProductName.trim();
    const cost = parseFloat(newProductCost);
    const price = parseFloat(newProductPrice);
    const qty = parseInt(newProductStock, 10);
    const threshold = parseInt(newProductThreshold, 10);

    if (!sku || !name) {
      showToast('SKU and Product Name are required.', 'danger');
      return;
    }
    if (isNaN(cost) || cost < 0 || isNaN(qty) || qty < 0) {
      showToast('Cost and Stock Quantity cannot be negative.', 'danger');
      return;
    }
    if (isNaN(price) || price <= 0) {
      showToast('Selling price must be greater than zero.', 'danger');
      return;
    }
    if (products.some(p => p.sku.toUpperCase() === sku)) {
      showToast(`A product with SKU ${sku} already exists!`, 'danger');
      return;
    }

    const saveProductAction = () => {
      const item: Product = {
        id: Date.now(),
        sku,
        name,
        category: newProductCategory,
        cost_price: cost,
        selling_price: price,
        stock_quantity: qty,
        reorder_threshold: threshold || 15,
        unit: newProductUnit || 'unit'
      };

      setProducts(prev => [...prev, item]);
      setIsAddModalOpen(false);
      setNewProductName('');
      setNewProductCost('');
      setNewProductPrice('');
      setNewProductStock('25');
      showToast(`Added '${item.name}' with generated SKU [${item.sku}]!`, 'success');
    };

    // Verification popup if user inputs '0' for initial stock
    if (qty === 0) {
      setZeroStockConfirm({
        isOpen: true,
        productName: name,
        onConfirm: () => {
          setZeroStockConfirm(null);
          saveProductAction();
        }
      });
      return;
    }

    saveProductAction();
  };

  // Handle Update Product with '0' Verification
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.selling_price <= 0 || editingProduct.stock_quantity < 0 || editingProduct.cost_price < 0) {
      showToast('Invalid prices or stock quantity.', 'danger');
      return;
    }

    const saveUpdate = () => {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      showToast(`Updated '${editingProduct.name}' successfully.`, 'success');
      setEditingProduct(null);
    };

    // If user input '0' for stock, trigger the verification popup
    if (editingProduct.stock_quantity === 0) {
      setZeroStockConfirm({
        isOpen: true,
        productName: editingProduct.name,
        onConfirm: () => {
          setZeroStockConfirm(null);
          saveUpdate();
        }
      });
      return;
    }

    saveUpdate();
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteProduct = (product: Product) => {
    setDeleteConfirm({
      isOpen: true,
      productId: product.id,
      productName: product.name,
      productSku: product.sku
    });
  };

  const executeDeleteProduct = () => {
    if (!deleteConfirm) return;

    // Check if product appears in past sales history (foreign key constraint)
    const hasSalesHistory = sales.some(sale =>
      sale.items?.some(item => item.product_id === deleteConfirm.productId)
    );
    if (hasSalesHistory) {
      showToast(
        "Cannot remove this product because it appears in past sales records. Set its stock to 0 instead to retire it.",
        "warning"
      );
      setDeleteConfirm(null);
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== deleteConfirm.productId));
    showToast(`Product '${deleteConfirm.productName}' (${deleteConfirm.productSku}) deleted from catalog.`, 'info');
    setDeleteConfirm(null);
  };

  // -----------------------------------------------------------------
  // 3. SEARCHABLE POS PRODUCTS & MULTI-ITEM CHECKOUT
  // -----------------------------------------------------------------
  // Searchable matching products for POS dropdown/picker
  const posMatchingProducts = useMemo(() => {
    if (!posProductSearch.trim()) {
      return products;
    }
    const q = posProductSearch.trim().toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, posProductSearch]);

  const selectedProductForPos = useMemo(() => {
    return products.find(p => p.id === posSelectedProductId);
  }, [products, posSelectedProductId]);

  // Add line item to customer cart
  const handleAddToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProductForPos) {
      showToast('Please select a product first.', 'danger');
      return;
    }
    const qty = parseInt(String(posItemQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be at least 1.', 'danger');
      return;
    }

    const existingIndex = customerCart.findIndex(ci => ci.product_id === selectedProductForPos.id);
    const existingQty = existingIndex >= 0 ? customerCart[existingIndex].quantity : 0;
    const requestedTotal = existingQty + qty;

    if (requestedTotal > selectedProductForPos.stock_quantity) {
      showToast(
        `Insufficient stock! Only ${selectedProductForPos.stock_quantity} available, but order would contain ${requestedTotal}.`,
        'danger'
      );
      return;
    }

    const unitPrice = selectedProductForPos.selling_price;
    const costPrice = selectedProductForPos.cost_price;

    if (existingIndex >= 0) {
      setCustomerCart(prev => prev.map((ci, idx) => {
        if (idx === existingIndex) {
          const newQty = ci.quantity + qty;
          const sub = Math.round(newQty * unitPrice * 100) / 100;
          const costSub = Math.round(newQty * costPrice * 100) / 100;
          return {
            ...ci,
            quantity: newQty,
            subtotal: sub,
            cost_subtotal: costSub,
            profit: Math.round((sub - costSub) * 100) / 100
          };
        }
        return ci;
      }));
    } else {
      const sub = Math.round(qty * unitPrice * 100) / 100;
      const costSub = Math.round(qty * costPrice * 100) / 100;
      const newItem: CartItem = {
        product_id: selectedProductForPos.id,
        product_name: selectedProductForPos.name,
        sku: selectedProductForPos.sku,
        unit: selectedProductForPos.unit,
        quantity: qty,
        unit_price: unitPrice,
        cost_price: costPrice,
        subtotal: sub,
        cost_subtotal: costSub,
        profit: Math.round((sub - costSub) * 100) / 100
      };
      setCustomerCart(prev => [...prev, newItem]);
    }

    setPosItemQuantity(1);
    showToast(`Added ${qty}x ${selectedProductForPos.name} to order ticket.`, 'success');
  };

  const handleRemoveFromCart = (productId: number) => {
    setCustomerCart(prev => prev.filter(ci => ci.product_id !== productId));
  };

  // Direct typing of quantity in cart table (supports any number without limit of 20)
  const handleSetCartQuantity = (productId: number, newQty: number) => {
    const prod = products.find(p => p.id === productId);
    if (isNaN(newQty) || newQty <= 0) return;

    if (prod && newQty > prod.stock_quantity) {
      showToast(`Only ${prod.stock_quantity} available in stock for ${prod.name}.`, 'danger');
      newQty = prod.stock_quantity;
    }

    setCustomerCart(prev => prev.map(ci => {
      if (ci.product_id === productId) {
        const sub = Math.round(newQty * ci.unit_price * 100) / 100;
        const costSub = Math.round(newQty * ci.cost_price * 100) / 100;
        return {
          ...ci,
          quantity: newQty,
          subtotal: sub,
          cost_subtotal: costSub,
          profit: Math.round((sub - costSub) * 100) / 100
        };
      }
      return ci;
    }));
  };

  const handleStepCartQuantity = (productId: number, delta: number) => {
    const item = customerCart.find(ci => ci.product_id === productId);
    if (item) {
      handleSetCartQuantity(productId, item.quantity + delta);
    }
  };

  // Cart summary totals
  const cartSummary = useMemo(() => {
    const totalItems = customerCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = Math.round(customerCart.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
    const costTotal = Math.round(customerCart.reduce((sum, item) => sum + item.cost_subtotal, 0) * 100) / 100;
    const profit = Math.round((totalAmount - costTotal) * 100) / 100;
    return { totalItems, totalAmount, costTotal, profit };
  }, [customerCart]);

  // Enqueue multi-item order to FIFO Queue using ClientOrderQueue (singly linked list)
  const handleSubmitOrderToQueue = () => {
    if (customerCart.length === 0) {
      showToast('Cannot enqueue empty cart. Please add items.', 'danger');
      return;
    }

    const customer = posCustomerName.trim() || 'Walk-in Farmer';
    const queuedOrder: QueuedOrder = {
      order_id: `ORD-${Date.now()}`,
      customer_name: customer,
      items: [...customerCart],
      total_items_count: cartSummary.totalItems,
      total_amount: cartSummary.totalAmount,
      cost_total: cartSummary.costTotal,
      profit: cartSummary.profit,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const q = new ClientOrderQueue(ordersQueue);
    q.enqueue(queuedOrder);
    setOrdersQueue(q.toList());

    setCustomerCart([]);
    setPosCustomerName('');
    showToast(`Order ${queuedOrder.order_id} enqueued for dispatch with ${queuedOrder.items.length} product(s)!`, 'success');
  };

  // -----------------------------------------------------------------
  // 4. DEQUEUE ORDER TO MAKE CHANGES (RECALL TO CART)
  // -----------------------------------------------------------------
  const handleRecallOrderToEdit = () => {
    if (ordersQueue.length === 0) {
      showToast('No orders in dispatch queue to recall.', 'info');
      return;
    }

    // Pure FIFO dequeue from head of OrderQueue
    const q = new ClientOrderQueue(ordersQueue);
    const recalledOrder = q.dequeue();
    setOrdersQueue(q.toList());

    if (recalledOrder) {
      setPosCustomerName(recalledOrder.customer_name);
      setCustomerCart(recalledOrder.items);
      showToast(`Dequeued order ${recalledOrder.order_id} back to active ticket for edits.`, 'info');
    }
  };

  // Discard order at head of queue
  const handleCancelQueuedOrder = () => {
    if (ordersQueue.length === 0) return;
    const q = new ClientOrderQueue(ordersQueue);
    const discarded = q.dequeue();
    setOrdersQueue(q.toList());
    if (discarded) {
      showToast(`Dequeued and cancelled order ${discarded.order_id}.`, 'info');
    }
  };

  // Process order from queue head (FIFO Dequeue + Atomic Inventory Deduction)
  const handleProcessOrder = () => {
    if (ordersQueue.length === 0) {
      showToast('Order queue is empty!', 'info');
      return;
    }

    const q = new ClientOrderQueue(ordersQueue);
    const orderToProcess = q.peek();
    if (!orderToProcess) return;

    // Verify stock for all items (order remains at front if verification fails)
    for (const item of orderToProcess.items) {
      const currentProd = products.find(p => p.id === item.product_id);
      if (!currentProd) {
        showToast(
          `Order failed: ${item.product_name} not found in inventory. The order is still at the front of the queue; use Dequeue to Edit to fix it.`,
          'danger'
        );
        return;
      }
      if (currentProd.stock_quantity < item.quantity) {
        showToast(
          `Stock Underflow! Only ${currentProd.stock_quantity} left for ${currentProd.name}, but order needs ${item.quantity}. The order is still at the front of the queue; use Dequeue to Edit to fix it.`,
          'danger'
        );
        return;
      }
    }

    // Deduct inventory
    setProducts(prev => prev.map(p => {
      const match = orderToProcess.items.find(item => item.product_id === p.id);
      if (match) {
        return { ...p, stock_quantity: p.stock_quantity - match.quantity };
      }
      return p;
    }));

    // Record sale with collision-resistant receipt number
    const nowStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const baseReceipt = `REC-${nowStr}`;
    let receiptNum = baseReceipt;
    let suffix = 2;
    while (sales.some(s => s.receipt_number === receiptNum)) {
      receiptNum = `${baseReceipt}-${suffix}`;
      suffix++;
    }

    const newSale: Sale = {
      id: Date.now(),
      receipt_number: receiptNum,
      customer_name: orderToProcess.customer_name,
      total_amount: orderToProcess.total_amount,
      cost_total: orderToProcess.cost_total,
      profit: orderToProcess.profit,
      items_count: orderToProcess.total_items_count,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      items: orderToProcess.items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        sku: i.sku,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal
      }))
    };
    setSales(prev => [newSale, ...prev]);

    // Dequeue head only after the sale is committed
    q.dequeue();
    setOrdersQueue(q.toList());

    showToast(
      `Dispatched Order ${orderToProcess.order_id}! Receipt: ${newSale.receipt_number}. Deducted ${orderToProcess.total_items_count} units.`,
      'success'
    );
  };

  // -----------------------------------------------------------------
  // 5. MERGE SORT FOR REPORTS
  // -----------------------------------------------------------------
  const sortedSales = useMemo(() => {
    if (reportSortBy === 'revenue_desc') {
      return client_merge_sort(sales, 'total_amount', true);
    } else if (reportSortBy === 'revenue_asc') {
      return client_merge_sort(sales, 'total_amount', false);
    } else if (reportSortBy === 'profit_desc') {
      return client_merge_sort(sales, 'profit', true);
    } else if (reportSortBy === 'date_asc') {
      return client_merge_sort(sales, 'timestamp', false);
    } else {
      return client_merge_sort(sales, 'timestamp', true);
    }
  }, [sales, reportSortBy]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all agricultural inventory and sales data back to defaults?')) {
      setProducts(INITIAL_PRODUCTS);
      setSales(INITIAL_SALES);
      setOrdersQueue([]);
      setCustomerCart([]);
      setSearchQuery('');
      setPosProductSearch('');
      showToast('AgriStock data reset to initial values.', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F1] text-[#2B2118]">
      
      {/* INSTITUTION HEADER BAR */}
      <div className="bg-[#1E3E1A] text-xs text-[#D5DCD0] px-4 py-1.5 border-b border-[#2D5A27] flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E09F3E]"></span>
          <span className="font-semibold text-white tracking-wide">Universidad de Dagupan</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">School of Information Technology</span>
          <span>&bull;</span>
          <span className="text-[#E09F3E] font-medium">AgriStock Farm Supply Management</span>
        </div>
      </div>

      {/* MAIN TOP NAVBAR */}
      <header className="bg-[#2D5A27] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E09F3E] text-[#2B2118] flex items-center justify-center font-bold text-xl shadow group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-[#2B2118]" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white">
                  AgriStock
                </div>
                <div className="text-[11px] text-[#D5DCD0] -mt-0.5">Agricultural Warehouse & POS Ledger</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'dashboard' ? 'bg-[#1E3E1A] text-[#E09F3E] shadow-inner font-bold' : 'hover:bg-[#366C2F] text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'inventory' ? 'bg-[#1E3E1A] text-[#E09F3E] shadow-inner font-bold' : 'hover:bg-[#366C2F] text-white'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span className="hidden md:inline">Inventory</span>
              </button>

              <button
                onClick={() => setActiveTab('pos')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 relative ${
                  activeTab === 'pos' ? 'bg-[#1E3E1A] text-[#E09F3E] shadow-inner font-bold' : 'hover:bg-[#366C2F] text-white'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden md:inline">POS Checkout</span>
                {ordersQueue.length > 0 && (
                  <span className="bg-[#E09F3E] text-[#2B2118] font-extrabold text-[11px] px-1.5 py-0.2 rounded-full">
                    {ordersQueue.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'reports' ? 'bg-[#1E3E1A] text-[#E09F3E] shadow-inner font-bold' : 'hover:bg-[#366C2F] text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden md:inline">Reports</span>
              </button>

              <button
                onClick={handleResetData}
                title="Reset sample data"
                className="p-2 text-white/80 hover:text-white hover:bg-[#366C2F] rounded-md transition ml-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-between shadow-sm ${
            notification.type === 'success' ? 'bg-[#EBF4EC] border-[#4E8752] text-[#2D5A27]' :
            notification.type === 'danger' ? 'bg-[#FDECE8] border-[#BF4327] text-[#BF4327]' :
            notification.type === 'warning' ? 'bg-[#FEF9E7] border-[#E09F3E] text-[#8C5E00]' :
            'bg-white border-[#D5DCD0] text-[#2B2118]'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4E8752]" />}
              {notification.type === 'danger' && <AlertTriangle className="w-5 h-5 text-[#BF4327]" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#E09F3E]" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs font-bold opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ============================================================== */}
        {/* VIEW 1: DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#2D5A27] to-[#1E3E1A] text-white rounded-xl p-6 shadow-md border border-[#3E6C36]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Agricultural Supply Dashboard</h1>
                  <p className="text-sm text-[#D5DCD0] mt-1 max-w-2xl">
                    Live farm inventory monitoring, restocking alerts, and sales performance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="px-4 py-2 bg-[#E09F3E] hover:bg-[#d4902f] text-[#2B2118] font-bold text-sm rounded-lg shadow transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manage Inventory</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pos')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg border border-white/20 transition flex items-center space-x-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Open POS Cashier</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#D5DCD0] shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A4A3E]">Restock Alerts</p>
                    <p className="text-3xl font-extrabold text-[#BF4327] mt-1">{criticalAlerts.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#FDECE8] text-[#BF4327] flex items-center justify-center text-xl font-bold">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#5A4A3E] mt-3">
                  Items currently at or below minimum threshold
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#D5DCD0] shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A4A3E]">Catalog Products</p>
                    <p className="text-3xl font-extrabold text-[#2B2118] mt-1">{products.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#EBF4EC] text-[#2D5A27] flex items-center justify-center text-xl font-bold">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#5A4A3E] mt-3">
                  Total Units on Hand: <strong className="text-[#2B2118]">{totalStockUnits}</strong>
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#D5DCD0] shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A4A3E]">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-[#2D5A27] mt-1">₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#F8E8D0] text-[#E09F3E] flex items-center justify-center text-xl font-bold">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#5A4A3E] mt-3">
                  Total gross sales processed
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#D5DCD0] shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5A4A3E]">Net Margin / Profit</p>
                    <p className="text-2xl font-extrabold text-[#4E8752] mt-1">₱{totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#EBF4EC] text-[#4E8752] flex items-center justify-center text-xl font-bold">
                    <Sprout className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#5A4A3E] mt-3">
                  Profit Margin: <strong className="text-[#4E8752]">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</strong>
                </p>
              </div>
            </div>

            {/* RESTOCK PRIORITY TABLE */}
            <div className="bg-white rounded-xl border border-[#D5DCD0] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#D5DCD0] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#2B2118]">Restock Priority Alerts</h2>
                  <p className="text-xs text-[#5A4A3E] mt-0.5">
                    Products automatically ranked by lowest remaining inventory.
                  </p>
                </div>
                <div className="text-xs text-[#5A4A3E]">
                  <strong>{criticalAlerts.length}</strong> items needing reorder
                </div>
              </div>

              {criticalAlerts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#2B2118]">
                    <thead className="bg-[#F1ECE1] text-xs uppercase font-semibold text-[#5A4A3E] border-b border-[#D5DCD0]">
                      <tr>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Current Stock</th>
                        <th className="px-4 py-3 text-right">Reorder Threshold</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5DCD0]">
                      {criticalAlerts.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-[#FAF8F5] transition-colors ${index === 0 ? 'bg-[#FDECE8]/40' : ''}`}>
                          <td className="px-4 py-3 font-mono font-bold">
                            {index === 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#BF4327] text-white text-xs font-bold">
                                #1 Priority
                              </span>
                            ) : (
                              <span className="text-[#5A4A3E]">#{index + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-xs text-[#2D5A27]">
                            {{ ...item }.sku}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {{ ...item }.name}
                            <span className="block text-xs text-[#5A4A3E] font-normal">{{ ...item }.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#EBF4EC] text-[#2D5A27] font-medium">
                              {{ ...item }.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-[#BF4327]">
                            {{ ...item }.stock_quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#5A4A3E]">
                            {{ ...item }.reorder_threshold}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setEditingProduct(item);
                                setActiveTab('inventory');
                              }}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded bg-[#2D5A27] text-white hover:bg-[#366C2F] transition"
                            >
                              <Edit className="w-3 h-3 mr-1" /> Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5A4A3E]">
                  <CheckCircle2 className="w-10 h-10 text-[#4E8752] mx-auto mb-2" />
                  <p className="font-bold text-[#2B2118]">All inventory stocks are healthy!</p>
                  <p className="text-xs">No items currently meet or fall below their reorder threshold.</p>
                </div>
              )}
            </div>

            {/* RECENT SALES LEDGER */}
            <div className="bg-white rounded-xl border border-[#D5DCD0] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#D5DCD0] bg-[#FAF8F5] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#2B2118]">Recent Sales Transactions</h2>
                  <p className="text-xs text-[#5A4A3E] mt-0.5">
                    Dispatched customer sales orders.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs font-bold text-[#2D5A27] hover:underline flex items-center space-x-1"
                >
                  <span>View All Reports</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#2B2118]">
                  <thead className="bg-[#F1ECE1] text-xs uppercase font-semibold text-[#5A4A3E] border-b border-[#D5DCD0]">
                    <tr>
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Customer / Cooperative</th>
                      <th className="px-4 py-3 text-right">Items Sold</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-right">Profit</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5DCD0]">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#2D5A27]">
                          {sale.receipt_number}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {sale.customer_name}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {sale.items_count}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#2B2118]">
                          ₱{sale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#4E8752]">
                          +₱{sale.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#5A4A3E]">
                          {sale.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INVENTORY & SEARCH */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Header & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#2B2118]">Farm Supply Inventory Catalog</h1>
                <p className="text-xs text-[#5A4A3E]">Search by product name or SKU, manage stock levels, and organize agricultural categories.</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-[#2D5A27] hover:bg-[#366C2F] text-white font-bold text-sm rounded-lg shadow transition flex items-center space-x-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* SEARCH BY PRODUCT NAME & BINARY SEARCH BY SKU */}
            <div className="bg-white rounded-xl border border-[#D5DCD0] p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A4A3E]">
                    <Search className="w-4 h-4 text-[#5A4A3E]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsInventorySearchFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsInventorySearchFocused(false), 200);
                    }}
                    placeholder="Search products by name or SKU (e.g., Urea, FERT-001)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D5DCD0] focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent text-sm bg-[#F9F7F1]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Automatic Suggestions Dropdown (Name or SKU) */}
                  {isInventorySearchFocused && searchQuery.trim().length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#D5DCD0] rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-[#D5DCD0]/60 max-h-80 overflow-y-auto"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {inventorySuggestions.length > 0 ? (
                        <>
                          <div className="px-3.5 py-2 bg-[#FAF8F5] text-[11px] font-semibold text-[#5A4A3E] flex items-center justify-between border-b border-[#D5DCD0]">
                            <span>Suggested Products ({inventorySuggestions.length})</span>
                            <span className="text-[10px] text-slate-400">Click to search</span>
                          </div>
                          {inventorySuggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSearchQuery(p.sku);
                                setIsInventorySearchFocused(false);
                              }}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-[#F9F7F1] transition flex items-center justify-between group"
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EBF4EC] text-[#2D5A27] border border-[#D5DCD0]">
                                  {p.sku}
                                </span>
                                <div>
                                  <div className="font-semibold text-xs text-[#2B2118] group-hover:text-[#2D5A27] transition">
                                    {p.name}
                                  </div>
                                  <div className="text-[11px] text-[#5A4A3E]">
                                    {p.category} &bull; {p.unit}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-xs font-bold text-[#2B2118]">
                                  ₱{p.selling_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className={`text-[10px] font-semibold ${p.stock_quantity <= p.reorder_threshold ? 'text-[#BF4327]' : 'text-[#4E8752]'}`}>
                                  Stock: {p.stock_quantity}
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-3 text-center text-xs text-[#5A4A3E]">
                          No products found matching &ldquo;{searchQuery}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Fertilizers', 'Seeds', 'Feeds', 'Agrochemicals'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        selectedCategoryFilter === cat
                          ? 'bg-[#2D5A27] text-white'
                          : 'bg-[#F9F7F1] text-[#5A4A3E] border border-[#D5DCD0] hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counter & Reset Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5A4A3E] pt-1 gap-2">
                <div>
                  Showing <strong>{filteredProducts.length}</strong> of {products.length} products
                  {searchQuery && <span> matching &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>}
                  {selectedCategoryFilter !== 'All' && <span> in <strong>{selectedCategoryFilter}</strong></span>}
                </div>

                {(searchQuery || selectedCategoryFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('All');
                    }}
                    className="text-[#2D5A27] font-semibold hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>



            {/* INVENTORY CATALOG TABLE */}
            <div className="bg-white rounded-xl border border-[#D5DCD0] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAF8F5] border-b border-[#D5DCD0] flex justify-between items-center">
                <h2 className="font-bold text-[#2B2118]">Product Inventory</h2>
                <span className="text-xs font-mono text-[#5A4A3E]">{filteredProducts.length} Items</span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#2B2118]">
                    <thead className="bg-[#F1ECE1] text-xs uppercase font-semibold text-[#5A4A3E] border-b border-[#D5DCD0]">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Cost Price</th>
                        <th className="px-4 py-3 text-right">Selling Price</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-right">Reorder Min</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5DCD0]">
                      {filteredProducts.map((item) => {
                        const isLow = item.stock_quantity <= item.reorder_threshold;
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-xs text-[#2D5A27]">
                              {item.sku}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {item.name}
                              <span className="block text-xs text-[#5A4A3E] font-normal">{item.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#5A4A3E]">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#5A4A3E]">
                              ₱{item.cost_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#2B2118]">
                              ₱{item.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`px-4 py-3 text-right font-mono font-bold ${isLow ? 'text-[#BF4327]' : 'text-[#4E8752]'}`}>
                              {item.stock_quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-[#5A4A3E]">
                              {item.reorder_threshold}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isLow ? (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FDECE8] text-[#BF4327]">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#EBF4EC] text-[#4E8752]">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => setEditingProduct(item)}
                                  className="p-1.5 text-xs rounded hover:bg-slate-200 text-[#2D5A27]"
                                  title="Edit Stock & Pricing"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => requestDeleteProduct(item)}
                                  className="p-1.5 text-xs rounded hover:bg-[#FDECE8] text-[#BF4327]"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5A4A3E]">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-[#2B2118]">No products matched your search</p>
                  <p className="text-xs">Try searching with a different product name or clear your filters.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: MULTI-ITEM POS CHECKOUT & DISPATCH QUEUE */}
        {/* ============================================================== */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#2B2118]">Point-of-Sale (POS) & Order Dispatch</h1>
                <p className="text-xs text-[#5A4A3E]">Search products, type any quantity, build multi-item customer tickets, and manage the dispatch queue.</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-[#5A4A3E]">Orders in Queue:</span>
                <span className="font-mono text-base font-extrabold bg-[#E09F3E] text-[#2B2118] px-3 py-1 rounded-lg">
                  {ordersQueue.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT: MULTI-ITEM ORDER BUILDER (COL 6) */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-[#D5DCD0] p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#D5DCD0]">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF4EC] text-[#2D5A27] flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#2B2118]">New Customer Order Ticket</h2>
                    <p className="text-[11px] text-[#5A4A3E]">Add multiple items for a customer before queueing for dispatch</p>
                  </div>
                </div>

                {/* Customer Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Customer / Farm Cooperative Name</label>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    placeholder="e.g. Mang Tomas (San Fabian Rice Growers)"
                    className="w-full px-3 py-2 border border-[#D5DCD0] rounded-lg text-sm bg-[#F9F7F1] focus:ring-2 focus:ring-[#2D5A27]"
                  />
                </div>

                {/* SEARCHABLE ITEM PICKER & DIRECT QUANTITY INPUT WITH AUTO-SUGGEST */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D5A27]">Search & Select Product</span>
                    {selectedProductForPos && (
                      <span className="text-xs text-[#5A4A3E]">
                        Available: <strong className="text-[#2B2118]">{selectedProductForPos.stock_quantity} {selectedProductForPos.unit}</strong>
                      </span>
                    )}
                  </div>

                  {/* Search bar inside POS with auto-suggest dropdown */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#5A4A3E]">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={posProductSearch}
                      onChange={(e) => {
                        setPosProductSearch(e.target.value);
                        setIsPosSearchFocused(true);
                      }}
                      onFocus={() => setIsPosSearchFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsPosSearchFocused(false), 200);
                      }}
                      placeholder="Type product name or SKU (e.g., Urea, FERT-001)..."
                      className="w-full pl-8 pr-3 py-1.5 border border-[#D5DCD0] rounded-lg text-xs bg-white focus:ring-1 focus:ring-[#2D5A27]"
                    />

                    {/* Automatic suggestions dropdown for POS */}
                    {isPosSearchFocused && posProductSearch.trim().length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D5DCD0] rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-[#D5DCD0]/60 max-h-72 overflow-y-auto"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {posSuggestions.length > 0 ? (
                          <>
                            <div className="px-3 py-1.5 bg-[#FAF8F5] text-[11px] font-semibold text-[#5A4A3E] flex items-center justify-between border-b border-[#D5DCD0]">
                              <span>Suggested Products ({posSuggestions.length})</span>
                              <span className="text-[10px] text-slate-400">Click to select</span>
                            </div>
                            {posSuggestions.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setPosSelectedProductId(p.id);
                                  setPosProductSearch(p.name);
                                  setIsPosSearchFocused(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[#F9F7F1] transition flex items-center justify-between group"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#EBF4EC] text-[#2D5A27] border border-[#D5DCD0]">
                                    {p.sku}
                                  </span>
                                  <div>
                                    <div className="font-semibold text-xs text-[#2B2118] group-hover:text-[#2D5A27] transition">
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] text-[#5A4A3E]">
                                      {p.category} &bull; {p.unit}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-xs font-bold text-[#2B2118]">
                                    ₱{p.selling_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className={`text-[10px] font-semibold ${p.stock_quantity <= p.reorder_threshold ? 'text-[#BF4327]' : 'text-[#4E8752]'}`}>
                                    Stock: {p.stock_quantity}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="p-2.5 text-center text-xs text-[#5A4A3E]">
                            No products found matching &ldquo;{posProductSearch}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Dropdown Selector */}
                  <div>
                    <select
                      value={posSelectedProductId}
                      onChange={(e) => setPosSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-[#D5DCD0] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#2D5A27]"
                    >
                      <option value="">-- Choose Product ({posMatchingProducts.length} available) --</option>
                      {posMatchingProducts.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.sku} • {prod.name} (₱{prod.selling_price.toLocaleString()} / {prod.unit}) — Stock: {prod.stock_quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input: Free-form typing of any amount beyond 20 */}
                  <div className="flex items-center space-x-3">
                    <div className="w-36">
                      <label className="block text-[11px] font-semibold text-[#5A4A3E] mb-1">
                        Quantity to Add
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProductForPos ? selectedProductForPos.stock_quantity : 9999}
                        value={posItemQuantity}
                        onChange={(e) => setPosItemQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-1.5 border border-[#D5DCD0] rounded-lg text-sm font-mono font-bold bg-white text-center"
                      />
                    </div>
                    <div className="flex-grow pt-5">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!selectedProductForPos}
                        className={`w-full py-2 font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 ${
                          selectedProductForPos
                            ? 'bg-[#2D5A27] hover:bg-[#366C2F] text-white shadow'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item to Customer Cart</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* CURRENT CART LINE ITEMS TABLE WITH DIRECT TYPING OF QUANTITY */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#2B2118]">
                      Order Items ({customerCart.length})
                    </span>
                    {customerCart.length > 0 && (
                      <button
                        onClick={() => setCustomerCart([])}
                        className="text-xs text-[#BF4327] hover:underline"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {customerCart.length > 0 ? (
                    <div className="border border-[#D5DCD0] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F1ECE1] text-[#5A4A3E]">
                          <tr>
                            <th className="p-2">Item</th>
                            <th className="p-2 text-center w-32">Qty (Type any)</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Subtotal</th>
                            <th className="p-2 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5DCD0]">
                          {customerCart.map((item) => (
                            <tr key={item.product_id} className="hover:bg-slate-50">
                              <td className="p-2">
                                <div className="font-semibold text-[#2B2118]">{item.product_name}</div>
                                <span className="font-mono text-[10px] text-[#5A4A3E]">{item.sku} &bull; {item.unit}</span>
                              </td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center space-x-1 bg-white border border-[#D5DCD0] rounded px-1 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStepCartQuantity(item.product_id, -1)}
                                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-black font-bold text-xs hover:bg-slate-100 rounded"
                                  >
                                    -
                                  </button>
                                  {/* User can type any quantity they want directly here! */}
                                  <input
                                    type="number"
                                    min="1"
                                    max={products.find(p => p.id === item.product_id)?.stock_quantity || 9999}
                                    value={item.quantity}
                                    onChange={(e) => handleSetCartQuantity(item.product_id, parseInt(e.target.value, 10) || 1)}
                                    className="w-14 text-center font-mono font-bold text-xs py-0.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#2D5A27]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStepCartQuantity(item.product_id, 1)}
                                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-black font-bold text-xs hover:bg-slate-100 rounded"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-2 text-right font-mono text-[#5A4A3E]">
                                ₱{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-2 text-right font-mono font-bold text-[#2D5A27]">
                                ₱{item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(item.product_id)}
                                  className="text-slate-400 hover:text-[#BF4327]"
                                  title="Remove Item"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* CART GRAND TOTAL */}
                      <div className="bg-[#FAF8F5] p-3 border-t border-[#D5DCD0] flex justify-between items-center text-sm">
                        <div>
                          <span className="text-xs text-[#5A4A3E]">Total Units: <strong className="text-[#2B2118]">{cartSummary.totalItems}</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-[#5A4A3E] mr-2">Grand Total:</span>
                          <span className="text-lg font-mono font-extrabold text-[#2D5A27]">
                            ₱{cartSummary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-[#D5DCD0] rounded-lg text-center text-xs text-[#5A4A3E]">
                      No items in current ticket yet. Pick a product and type quantity to add.
                    </div>
                  )}
                </div>

                {/* SUBMIT TICKET BUTTON */}
                <button
                  type="button"
                  onClick={handleSubmitOrderToQueue}
                  disabled={customerCart.length === 0}
                  className={`w-full py-2.5 font-bold text-sm rounded-lg shadow transition flex items-center justify-center space-x-2 ${
                    customerCart.length > 0
                      ? 'bg-[#E09F3E] hover:bg-[#d4902f] text-[#2B2118]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Send Multi-Item Order to Dispatch Queue</span>
                </button>
              </div>

              {/* RIGHT: DISPATCH QUEUE MONITOR & DEQUEUE EDIT OPTIONS (COL 6) */}
              <div className="lg:col-span-6 space-y-4">

                {/* NEXT ORDER IN LINE WITH "RECALL / DEQUEUE TO EDIT" ACTION */}
                <div className={`bg-white rounded-xl border-2 p-5 shadow-sm ${
                  ordersQueue.length > 0 ? 'border-[#E09F3E]' : 'border-[#D5DCD0]'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D5DCD0]">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-[#E09F3E] inline-block"></span>
                      <h3 className="font-bold text-[#2B2118] text-base">Next Order in Line</h3>
                    </div>

                    {/* ACTIONS FOR ORDER AT QUEUE HEAD */}
                    {ordersQueue.length > 0 && (
                      <div className="flex items-center space-x-2">
                        {/* Dequeue to make changes */}
                        <button
                          type="button"
                          onClick={handleRecallOrderToEdit}
                          className="px-3 py-1.5 bg-[#F8E8D0] hover:bg-[#ebd4b3] text-[#2B2118] font-bold text-xs rounded-lg border border-[#E09F3E] transition flex items-center space-x-1"
                          title="Dequeue this order from queue and reload into cart for changes"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Dequeue to Edit</span>
                        </button>

                        {/* Process order and commit to database */}
                        <button
                          type="button"
                          onClick={handleProcessOrder}
                          className="px-3 py-1.5 bg-[#4E8752] hover:bg-[#3f7042] text-white font-extrabold text-xs rounded-lg shadow transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Process & Deduct</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {ordersQueue.length > 0 ? (
                    <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#D5DCD0] space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-[#2D5A27]">{ordersQueue[0].order_id}</span>
                            <span className="text-[10px] bg-[#EBF4EC] text-[#2D5A27] font-bold px-1.5 py-0.5 rounded">Ready for dispatch</span>
                          </div>
                          <h4 className="font-bold text-base text-[#2B2118] mt-0.5">{ordersQueue[0].customer_name}</h4>
                          <p className="text-xs text-[#5A4A3E]">{ordersQueue[0].created_at}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-[#5A4A3E]">Order Grand Total</span>
                          <div className="text-xl font-mono font-black text-[#2D5A27]">
                            ₱{ordersQueue[0].total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Line items preview */}
                      <div className="pt-2 border-t border-[#D5DCD0] space-y-1">
                        <div className="text-xs font-semibold text-[#5A4A3E]">Line Items ({ordersQueue[0].items.length}):</div>
                        {ordersQueue[0].items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs py-0.5">
                            <div>
                              <span className="font-medium text-[#2B2118]">{it.product_name}</span>
                              <span className="text-slate-400 text-[10px] ml-1">({it.sku})</span>
                            </div>
                            <div className="font-mono text-[#2B2118]">
                              {it.quantity} {it.unit} &times; ₱{it.unit_price.toLocaleString()} = <strong>₱{it.subtotal.toLocaleString()}</strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCancelQueuedOrder}
                          className="text-xs text-[#BF4327] hover:underline"
                        >
                          Cancel / Discard this order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-[#5A4A3E]">
                      <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#2B2118]">No orders waiting in queue</p>
                      <p className="text-xs">Add items on the left panel to stage orders for dispatch.</p>
                    </div>
                  )}
                </div>

                {/* FULL QUEUE TABLE */}
                <div className="bg-white rounded-xl border border-[#D5DCD0] shadow-sm overflow-hidden">
                  <div className="p-4 bg-[#FAF8F5] border-b border-[#D5DCD0] flex justify-between items-center">
                    <h3 className="font-bold text-[#2B2118] text-sm">Waiting Orders ({ordersQueue.length})</h3>
                    <span className="text-xs text-[#5A4A3E]">Sequential Dispatch Buffer</span>
                  </div>

                  {ordersQueue.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F1ECE1] uppercase font-semibold text-[#5A4A3E]">
                          <tr>
                            <th className="p-3">Pos</th>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Items</th>
                            <th className="p-3 text-right">Units</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5DCD0]">
                          {ordersQueue.map((ord, idx) => (
                            <tr key={ord.order_id} className={idx === 0 ? 'bg-[#FAF8F5] font-semibold text-[#2D5A27]' : ''}>
                              <td className="p-3 font-mono font-bold">#{idx + 1}</td>
                              <td className="p-3 font-mono">{ord.order_id}</td>
                              <td className="p-3 font-medium text-[#2B2118]">{ord.customer_name}</td>
                              <td className="p-3 truncate max-w-[120px]">
                                {ord.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                              </td>
                              <td className="p-3 text-right font-mono">{ord.total_items_count}</td>
                              <td className="p-3 text-right font-mono font-bold text-[#2B2118]">
                                ₱{ord.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#5A4A3E]">
                      All orders have been dispatched.
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: REPORTS & FINANCIAL LEDGER */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#2B2118]">Revenue Analytics & Sales Ledger</h1>
                <p className="text-xs text-[#5A4A3E]">Financial records and sales transactions history.</p>
              </div>

              {/* Filter Controls Form */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-[#5A4A3E]">Sort By:</label>
                <select
                  value={reportSortBy}
                  onChange={(e) => setReportSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-[#D5DCD0] rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-[#2D5A27]"
                >
                  <option value="revenue_desc">Highest Revenue</option>
                  <option value="revenue_asc">Lowest Revenue</option>
                  <option value="profit_desc">Highest Profit Margin</option>
                  <option value="date_desc">Date: Newest First</option>
                  <option value="date_asc">Date: Oldest First</option>
                </select>
              </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#D5DCD0] shadow-sm">
                <span className="text-xs text-[#5A4A3E] uppercase font-semibold">Total Revenue</span>
                <p className="text-2xl font-black text-[#2D5A27] mt-1">₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#D5DCD0] shadow-sm">
                <span className="text-xs text-[#5A4A3E] uppercase font-semibold">Net Realized Profit</span>
                <p className="text-2xl font-black text-[#4E8752] mt-1">₱{totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#D5DCD0] shadow-sm">
                <span className="text-xs text-[#5A4A3E] uppercase font-semibold">Average Sale Value</span>
                <p className="text-2xl font-black text-[#2B2118] mt-1">
                  ₱{(sales.length ? totalRevenue / sales.length : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#D5DCD0] shadow-sm">
                <span className="text-xs text-[#5A4A3E] uppercase font-semibold">Total Transactions</span>
                <p className="text-2xl font-black text-[#E09F3E] mt-1">{sales.length} Receipts</p>
              </div>
            </div>

            {/* SALES LEDGER TABLE */}
            <div className="bg-white rounded-xl border border-[#D5DCD0] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAF8F5] border-b border-[#D5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold text-[#2B2118] text-sm">Dispatched Sales Ledger</h2>
                  <p className="text-[11px] text-[#5A4A3E]">Click on any transaction row to expand and view itemized products sold.</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#2D5A27] bg-[#EBF4EC] px-2.5 py-1 rounded-full border border-[#D5DCD0]">
                  {sales.length} Receipts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#2B2118]">
                  <thead className="bg-[#F1ECE1] text-xs uppercase font-semibold text-[#5A4A3E] border-b border-[#D5DCD0]">
                    <tr>
                      <th className="w-8 px-2 py-3 text-center"></th>
                      <th className="px-3 py-3">#</th>
                      <th className="px-4 py-3">Receipt Number</th>
                      <th className="px-4 py-3">Customer / Cooperative</th>
                      <th className="px-4 py-3 text-right">Items Sold</th>
                      <th className="px-4 py-3 text-right">Cost Basis</th>
                      <th className="px-4 py-3 text-right">Total Revenue</th>
                      <th className="px-4 py-3 text-right">Profit</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5DCD0]">
                    {sortedSales.map((sale, index) => (
                      <React.Fragment key={sale.id}>
                        <tr
                          onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                          className="hover:bg-[#FAF8F5] transition-colors cursor-pointer select-none group"
                        >
                          <td className="px-2 py-3 text-center">
                            {expandedSaleId === sale.id ? (
                              <ChevronDown className="w-4 h-4 text-[#2D5A27] mx-auto transition-transform" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#2D5A27] mx-auto transition-transform" />
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-xs text-[#5A4A3E]">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#2D5A27] group-hover:underline">
                            {sale.receipt_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#2B2118]">{sale.customer_name}</div>
                            <span className="text-[10px] text-[#5A4A3E]">Click to view {sale.items?.length || 0} item(s)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            <span className="inline-block px-2 py-0.5 rounded bg-[#F1ECE1] text-xs font-bold">
                              {sale.items_count} units
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#5A4A3E]">
                            ₱{sale.cost_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-[#2B2118]">
                            ₱{sale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#4E8752]">
                            +₱{sale.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#5A4A3E]">
                            {sale.timestamp}
                          </td>
                        </tr>

                        {/* Expandable line items */}
                        {expandedSaleId === sale.id && (
                          <tr className="bg-[#FAF8F5]/90 border-t border-b border-[#D5DCD0]">
                            <td colSpan={9} className="p-4 bg-gradient-to-b from-[#F9F7F1] to-white">
                              <div className="max-w-4xl mx-auto space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-[#D5DCD0]">
                                  <div className="flex items-center space-x-2">
                                    <Receipt className="w-4 h-4 text-[#2D5A27]" />
                                    <h4 className="font-bold text-xs text-[#2B2118]">
                                      Itemized Products Sold • Receipt {sale.receipt_number}
                                    </h4>
                                  </div>
                                  <span className="text-[11px] text-[#5A4A3E]">
                                    Customer: <strong>{sale.customer_name}</strong> • {sale.timestamp}
                                  </span>
                                </div>

                                {sale.items && sale.items.length > 0 ? (
                                  <div className="border border-[#D5DCD0] rounded-lg overflow-hidden bg-white shadow-xs">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-[#F1ECE1] font-semibold text-[#5A4A3E]">
                                        <tr>
                                          <th className="p-2.5">Product Name</th>
                                          <th className="p-2.5">SKU</th>
                                          <th className="p-2.5 text-center">Quantity</th>
                                          <th className="p-2.5 text-right">Unit Price</th>
                                          <th className="p-2.5 text-right">Line Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#D5DCD0]">
                                        {sale.items.map((line, lidx) => (
                                          <tr key={lidx} className="hover:bg-[#FAF8F5]">
                                            <td className="p-2.5 font-semibold text-[#2B2118]">
                                              {line.product_name}
                                            </td>
                                            <td className="p-2.5 font-mono text-[11px] text-[#2D5A27]">
                                              {line.sku}
                                            </td>
                                            <td className="p-2.5 text-center font-mono font-bold">
                                              {line.quantity}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-[#5A4A3E]">
                                              ₱{line.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-[#2D5A27]">
                                              ₱{line.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-[#FAF8F5] border-t border-[#D5DCD0] text-xs font-semibold">
                                        <tr>
                                          <td colSpan={2} className="p-2.5 text-[#5A4A3E]">
                                            Total Units: <strong>{sale.items_count}</strong>
                                          </td>
                                          <td colSpan={2} className="p-2.5 text-right text-[#5A4A3E]">
                                            Transaction Total:
                                          </td>
                                          <td className="p-2.5 text-right font-mono font-black text-sm text-[#2D5A27]">
                                            ₱{sale.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-3 text-center text-xs text-[#5A4A3E] bg-white rounded-lg border border-[#D5DCD0]">
                                    No itemized line records found for this transaction. Total units sold: {sale.items_count}.
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#5A4A3E] pt-1 px-1">
                                  <div>
                                    Cost Basis: <strong className="font-mono text-[#2B2118]">₱{sale.cost_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                                  </div>
                                  <div>
                                    Net Realized Profit: <strong className="font-mono text-[#4E8752]">₱{sale.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                                  </div>
                                  <div>
                                    Profit Margin:{' '}
                                    <strong className="font-mono text-[#2D5A27]">
                                      {sale.total_amount > 0 ? ((sale.profit / sale.total_amount) * 100).toFixed(1) : 0}%
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: PYTHON CODE ARTIFACTS */}
        {/* ============================================================== */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#2B2118]">Python Source Code Inspector</h1>
                <p className="text-xs text-[#5A4A3E]">Standalone Python deliverables ready for Universidad de Dagupan ITECC04 project submission.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyCode(PYTHON_FILES[selectedCodeFile].code)}
                  className="px-3 py-2 bg-white border border-[#D5DCD0] hover:bg-slate-50 text-xs font-bold rounded-lg transition flex items-center space-x-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Current Code'}</span>
                </button>
              </div>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#D5DCD0] pb-2">
              {Object.entries(PYTHON_FILES).map(([key, file]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCodeFile(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
                    selectedCodeFile === key
                      ? 'bg-[#2D5A27] text-white shadow'
                      : 'bg-white text-[#5A4A3E] border border-[#D5DCD0] hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>{file.path}</span>
                </button>
              ))}
            </div>

            {/* Code Viewer Panel */}
            <div className="bg-[#1E1E1E] text-slate-100 rounded-xl p-5 shadow-lg border border-slate-700 font-mono text-xs overflow-hidden">
              <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-700 text-[11px]">
                <div className="text-[#E09F3E] font-bold">
                  {PYTHON_FILES[selectedCodeFile].title}
                </div>
                <div className="text-slate-400">
                  File: {PYTHON_FILES[selectedCodeFile].path}
                </div>
              </div>
              <pre className="overflow-x-auto p-2 leading-relaxed text-slate-200">
                <code>{PYTHON_FILES[selectedCodeFile].code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: DSA DEFENSE GUIDE */}
        {/* ============================================================== */}
        {activeTab === 'defense' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#D5DCD0] p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#D5DCD0]">
                <div className="w-10 h-10 rounded-xl bg-[#E09F3E] text-[#2B2118] flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-[#2B2118]">
                    ITECC04 Project Defense Guide
                  </h1>
                  <p className="text-xs text-[#5A4A3E]">
                    Universidad de Dagupan &bull; School of Information Technology &bull; Final Project Review
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0] space-y-2">
                  <h3 className="font-bold text-sm text-[#2D5A27]">1. Binary Min-Heap (`dsa/min_heap.py`)</h3>
                  <p className="text-[#5A4A3E]">
                    <strong>Application:</strong> Critical restock alerts for agricultural inputs. Keeps the product with the minimum remaining stock quantity at the root without needing to sort the entire database.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0] space-y-2">
                  <h3 className="font-bold text-sm text-[#2D5A27]">2. Binary Search (`dsa/binary_search.py`)</h3>
                  <p className="text-[#5A4A3E]">
                    <strong>Application:</strong> Rapid barcode / SKU lookup across large agricultural catalogs. Repeatedly halves the search partition to locate items instantaneously.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0] space-y-2">
                  <h3 className="font-bold text-sm text-[#2D5A27]">3. FIFO Order Queue (`dsa/queue.py`)</h3>
                  <p className="text-[#5A4A3E]">
                    <strong>Application:</strong> Cashier checkout &amp; warehouse dispatch queue implemented as a pure singly linked list with head and tail pointers (O(1) enqueue, dequeue, peek with zero built-in deque shortcuts). Retains failed dispatch orders at head until explicitly resolved.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0] space-y-2">
                  <h3 className="font-bold text-sm text-[#2D5A27]">4. Merge Sort (`dsa/merge_sort.py`)</h3>
                  <p className="text-[#5A4A3E]">
                    <strong>Application:</strong> Multi-criteria revenue and financial ledger sorting. Divide-and-conquer sorting guarantees stability so transactions with equal values maintain their order.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#FAF8F5] rounded-xl border border-[#D5DCD0]">
                <h3 className="font-bold text-sm text-[#2B2118] mb-2">How to Run the Python Project Locally</h3>
                <div className="bg-[#1E1E1E] text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1">
                  <p><span className="text-slate-400"># 1. Install dependencies</span></p>
                  <p className="text-emerald-400">pip install -r requirements.txt</p>
                  <p><span className="text-slate-400"># 2. Initialize database & seed agricultural products</span></p>
                  <p className="text-emerald-400">python3 database/db.py</p>
                  <p><span className="text-slate-400"># 3. Run DSA & Route verification test suites</span></p>
                  <p className="text-emerald-400">python3 test_dsa.py</p>
                  <p className="text-emerald-400">python3 test_routes.py</p>
                  <p><span className="text-slate-400"># 4. Start Flask web server</span></p>
                  <p className="text-emerald-400">python3 app.py</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: ADD PRODUCT (WITH AUTO CATEGORY SKU) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D5DCD0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2B2118]">Add Agricultural Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Product Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  >
                    <option value="Fertilizers">Fertilizers (FERT-###)</option>
                    <option value="Seeds">Seeds (SEED-###)</option>
                    <option value="Feeds">Feeds (FEED-###)</option>
                    <option value="Agrochemicals">Agrochemicals (AGRO-###)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1 flex items-center justify-between">
                    <span>Generated SKU</span>
                    <span className="text-[10px] text-[#2D5A27] font-bold">Auto-generated</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold uppercase bg-[#EBF4EC] text-[#2D5A27]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Product Description / Name</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Zinc Sulfate Micronutrient"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Cost Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                    placeholder="350.00"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Selling Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="480.00"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Reorder Min</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductThreshold}
                    onChange={(e) => setNewProductThreshold(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    placeholder="50kg sack"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-[#5A4A3E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#366C2F] text-white font-bold rounded-lg text-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#D5DCD0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2B2118]">Update Inventory & Pricing</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <p className="font-bold text-sm text-[#2D5A27]">{editingProduct.name} ({editingProduct.sku})</p>
                <span className="text-xs text-[#5A4A3E]">{editingProduct.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Cost Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.cost_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Selling Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editingProduct.selling_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4A3E] mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.reorder_threshold}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reorder_threshold: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F9F7F1]"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-lg text-sm text-[#5A4A3E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#366C2F] text-white font-bold rounded-lg text-sm"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: ZERO STOCK VERIFICATION */}
      {zeroStockConfirm && zeroStockConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border-2 border-[#BF4327]">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FDECE8] text-[#BF4327] flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#2B2118]">
                  Zero Stock Verification Warning
                </h3>
                <p className="text-xs text-[#5A4A3E] leading-relaxed">
                  You are setting the remaining inventory of <strong className="text-[#2B2118]">{zeroStockConfirm.productName}</strong> to <span className="font-mono font-bold text-[#BF4327]">0 units</span>.
                </p>
                <div className="p-3 bg-[#FDECE8] rounded-lg border border-[#BF4327]/30 text-xs text-[#BF4327]">
                  <strong>Warning:</strong> This item will be marked completely <em>Out of Stock</em> and will immediately become <strong>#1 Critical Restock Priority</strong> on the dashboard.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#D5DCD0] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setZeroStockConfirm(null)}
                className="px-4 py-2 border border-[#D5DCD0] rounded-lg text-xs font-semibold text-[#5A4A3E] hover:bg-slate-100 transition"
              >
                No, Change Quantity
              </button>
              <button
                type="button"
                onClick={zeroStockConfirm.onConfirm}
                className="px-4 py-2 bg-[#BF4327] hover:bg-[#a5371e] text-white text-xs font-bold rounded-lg shadow transition"
              >
                Yes, Set Stock to 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#D5DCD0]">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FDECE8] text-[#BF4327] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#2B2118]">
                  Delete Product Confirmation
                </h3>
                <p className="text-xs text-[#5A4A3E] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#2B2118]">{deleteConfirm.productName}</strong> (<span className="font-mono text-[#2D5A27]">{deleteConfirm.productSku}</span>) from the catalog?
                </p>
                <p className="text-xs text-[#BF4327]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#D5DCD0] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-[#D5DCD0] rounded-lg text-xs font-semibold text-[#5A4A3E] hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteProduct}
                className="px-4 py-2 bg-[#BF4327] hover:bg-[#a5371e] text-white text-xs font-bold rounded-lg shadow transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#2B2118] text-[#D5DCD0] border-t border-[#3E3024] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <div>
            <p className="font-bold text-white tracking-wide">AgriStock &mdash; Farm Supply Management System</p>
            <p className="text-[#8F9E89] mt-0.5">Universidad de Dagupan | School of Information Technology</p>
          </div>

          {/* Bottom links with logos for Python Code and Defense Guide */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveTab('code');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#1E3E1A] text-[#E09F3E] border-[#E09F3E]'
                  : 'bg-[#3E3024] text-[#D5DCD0] border-[#5A4A3E] hover:bg-[#4E3D2F] hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 text-[#E09F3E]" />
              <span>Python Code</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('defense');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'defense'
                  ? 'bg-[#1E3E1A] text-[#E09F3E] border-[#E09F3E]'
                  : 'bg-[#3E3024] text-[#D5DCD0] border-[#5A4A3E] hover:bg-[#4E3D2F] hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#E09F3E]" />
              <span>Defense Guide</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[#8F9E89] text-[11px]">
            <span>Fertilizers</span>
            <span>&bull;</span>
            <span>Hybrid Seeds</span>
            <span>&bull;</span>
            <span>Feeds</span>
            <span>&bull;</span>
            <span>Agrochemicals</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

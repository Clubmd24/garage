import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import EposLayout from "../../../components/EposLayout";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import { Modal } from "../../../components/ui/Modal.jsx";
import { createInvoice } from "../../../lib/invoices";
import ClientAutocomplete from "../../../components/ClientAutocomplete";
import VehicleAutocomplete from "../../../components/VehicleAutocomplete";

// Enhanced numeric keypad with better styling
function Keypad({ onPress, onClear }) {
  return (
    <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 shadow-xl rounded-xl">
      <div className="grid grid-cols-3 gap-3 mb-3">
        {["1","2","3","4","5","6","7","8","9","0"].map(d => (
          <button
            key={d}
            onClick={() => onPress(d)}
            className="h-14 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClear}
          className="flex-1 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          C
        </button>
        <button
          onClick={() => onPress("+")}
          className="flex-1 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          +
        </button>
        <button
          onClick={() => onPress("-")}
          className="flex-1 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          -
        </button>
      </div>
    </div>
  );
}

// Enhanced section wrapper with better styling
function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`mb-6 bg-white bg-opacity-95 rounded-xl shadow-2xl overflow-hidden text-black border border-gray-200 ${className}`}>
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg">
        {title}
      </div>
      <div className="p-6 text-black">{children}</div>
    </div>
  );
}

// Enhanced product card component
function ProductCard({ product, onAddToCart, suppliers }) {
  const supplier = suppliers.find(s => s.id === product.supplier_id);
  const salePrice = product.unit_sale_price || product.unit_cost;
  
  return (
    <div className="group">
      <Card className="hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 overflow-hidden">
        <CardContent className="p-0">
          {/* Product Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-gray-600 bg-gray-200 px-2 py-1 rounded">
                #{product.part_number || 'N/A'}
              </div>
              {supplier && (
                <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                  {supplier.name}
                </div>
              )}
            </div>
            <div className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">
              {product.description || 'No Description'}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-green-600">
                €{(salePrice && typeof salePrice === 'number' ? salePrice.toFixed(2) : '0.00')}
              </div>
              {product.unit_cost && typeof product.unit_cost === 'number' && product.unit_sale_price && typeof product.unit_sale_price === 'number' && (
                <div className="text-sm text-gray-500">
                  Cost: €{product.unit_cost.toFixed(2)}
                </div>
              )}
            </div>
            
            {product.markup_percentage && typeof product.markup_percentage === 'number' && (
              <div className="text-sm text-gray-600 mb-3">
                Markup: <span className="font-semibold text-blue-600">{product.markup_percentage}%</span>
              </div>
            )}
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={() => onAddToCart({
                part_id: product.id,
                description: product.description,
                price: salePrice,
                part_number: product.part_number
              })}
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Sale Product Entry Component
function QuickSaleProductEntry({ onAddToCart }) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [partNumber, setPartNumber] = useState('');

  const handleAdd = () => {
    if (!description || !price) return;
    
    onAddToCart({
      part_id: `quick_${Date.now()}`, // Generate unique ID for quick sale items
      description: description,
      price: parseFloat(price),
      part_number: partNumber || 'QUICK SALE',
      isQuickSale: true
    });
    
    // Clear form
    setDescription('');
    setPrice('');
    setPartNumber('');
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200">
      <h3 className="font-bold text-lg text-yellow-800 mb-3">🚀 Quick Sale - Manual Entry</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">Product Description *</label>
          <Input
            placeholder="e.g., Lamp, Oil Change, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border-2 border-yellow-300 focus:border-yellow-500 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">Part Number (Optional)</label>
          <Input
            placeholder="e.g., LAMP001, OIL001"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            className="w-full bg-white border-2 border-yellow-300 focus:border-yellow-500 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">Sale Price (€) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-white border-2 border-yellow-300 focus:border-yellow-500 rounded-lg"
          />
        </div>
        
        <Button
          onClick={handleAdd}
          disabled={!description || !price}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ Add to Cart
        </Button>
      </div>
    </div>
  );
}

// Cart hook
function useCart(initial = []) {
  const [items, setItems] = useState(initial);
  const add = product => {
    setItems(prev => {
      const exists = prev.find(i => i.part_id === product.part_id);
      if (exists) {
        return prev.map(i =>
          i.part_id === product.part_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };
  const updateQty = (part_id, newQty) => {
    setItems(prev =>
      prev
        .map(i =>
          i.part_id === part_id
            ? { ...i, quantity: Math.max(1, newQty) }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  };
  const clear = () => setItems([]);
  const total = useMemo(
    () => items.reduce((sum, it) => sum + ((it.price && typeof it.price === 'number' ? it.price : 0) * it.quantity), 0),
    [items]
  );
  return { items, add, updateQty, clear, total };
}

export default function EposPage() {
  const router = useRouter();
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cart
  const {
    items: cartItems,
    add: addToCart,
    updateQty,
    clear: clearCart,
    total
  } = useCart();

  // UI & form
  const [invoiceLookup, setInvoiceLookup] = useState("");
  const [clientName, setClientName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [quickSale, setQuickSale] = useState(false);
  const [session, setSession] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("cash");
  const [cash, setCash] = useState({
    n50: 0,
    n20: 0,
    n10: 0,
    n5: 0,
    n2: 0,
    n1: 0,
    c050: 0,
    c020: 0,
    c010: 0,
    c005: 0,
  });

  useEffect(() => {
    if (quickSale) {
      setClientName("");
      setCustomerId("");
      setVehiclePlate("");
      setVehicleId("");
    }
  }, [quickSale]);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Start day
  useEffect(() => {
    fetch("/api/epos/start-day")
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  // Load categories, products & suppliers
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/categories").then(r => r.ok? r.json():Promise.reject()),
      fetch("/api/parts").then(r => r.ok? r.json():Promise.reject()),
      fetch("/api/suppliers").then(r => r.ok? r.json():Promise.reject())
    ])
      .then(([c,p,s])=>{
        setCategories(c);
        setSuppliers(s);
        const norm = p.map(x=>({ ...x, unit_cost: Number(x.unit_cost)||0 }));
        setProducts(norm);
        // Default to "all" category to show all products initially
        setSelectedCategory('all');
      })
      .catch(()=>setError("Failed to load"))
      .finally(()=>setLoading(false));
  }, []);

  // Handle URL parameters for automatic invoice loading
  useEffect(() => {
    if (router.isReady && router.query.invoice_id) {
      setInvoiceLookup(router.query.invoice_id);
      loadInvoiceFromId(router.query.invoice_id);
    }
  }, [router.isReady, router.query.invoice_id]);

  // Invoice lookup
  const loadInvoice = async () => {
    if(!invoiceLookup) return;
    await loadInvoiceFromId(invoiceLookup);
  };

  const loadInvoiceFromId = async (invoiceId) => {
    setError(null);
    try{
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if(!res.ok) throw new Error();
      const data = await res.json();
      data.customer_id && setCustomerId(data.customer_id);
      data.vehicle_id && setVehicleId(data.vehicle_id);
      if(Array.isArray(data.items)){
        clearCart();
        data.items.forEach(it=> addToCart({ part_id: it.part_id, description: it.description, price: Number(it.unit_price)||0, quantity: it.qty }));
      }
    }catch{
      setError("Invoice not found");
    }
  };

  // Payment calc
  const received =
    50 * cash.n50 +
    20 * cash.n20 +
    10 * cash.n10 +
    5 * cash.n5 +
    2 * cash.n2 +
    1 * cash.n1 +
    0.5 * cash.c050 +
    0.2 * cash.c020 +
    0.1 * cash.c010 +
    0.05 * cash.c005;
  const changeDue = received - total;

  // Submit payment
  const takePayment = async () => {
    if(!session) return alert("No session");
    const custId = quickSale ? null : customerId || null;
    const vehId = quickSale ? null : vehicleId || null;
    const saleRes = await fetch("/api/epos/sales",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ 
        session_id:session.id, 
        customer_id:custId, 
        vehicle_id:vehId, 
        payment_type:paymentType, 
        total_amount:total, 
        items:cartItems.map(i=>({
          part_id:i.isQuickSale ? null : i.part_id, 
          qty:i.quantity, 
          unit_price:i.price,
          description: i.description,
          part_number: i.part_number
        })) 
      })
    });
    const sale = await saleRes.json();
    const invoice = await createInvoice({
      customer_id: custId,
      amount: total,
      status: 'paid'
    });
    await fetch(`/api/invoices/${invoice.id}/pdf`);
    window.open(`/api/invoices/${invoice.id}/pdf`);
    clearCart();
    setShowPayment(false);
    setCash({
      n50: 0,
      n20: 0,
      n10: 0,
      n5: 0,
      n2: 0,
      n1: 0,
      c050: 0,
      c020: 0,
      c010: 0,
      c005: 0,
    });
  };

  // Filter products
  const visibleProducts = products
    .filter(p => {
      // Handle "all" category - show all products
      if (selectedCategory === 'all') return true;
      // Handle specific category selection
      if (selectedCategory) return p.category_id === selectedCategory;
      // Default: show all products
      return true;
    })
    .filter(p => {
      // Safely handle null/undefined descriptions
      if (!p.description) return false;
      // Safely handle null/undefined search terms
      if (!searchTerm) return true;
      return p.description.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 min-h-screen">
      <EposLayout>
        {/* Enhanced top bar */}
        <div className="flex flex-col sm:flex-row items-center p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white gap-4 rounded-xl shadow-2xl mb-6">
          <div className="flex items-center space-x-4">
            <label className="font-bold text-lg">Invoice:</label>
            <Input
              value={invoiceLookup}
              onChange={e=>setInvoiceLookup(e.target.value)}
              placeholder="Enter invoice #"
              className="w-40 bg-white text-black border-2 border-blue-300 focus:border-blue-500 rounded-lg"
            />
            <Button 
              onClick={loadInvoice}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold shadow-lg"
            >
              Search
            </Button>
          </div>
          
          {error && <span className="text-red-200 bg-red-800 px-3 py-1 rounded-lg">{error}</span>}
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-blue-800 px-3 py-2 rounded-lg">
              <input type="checkbox" checked={quickSale} onChange={e=>setQuickSale(e.target.checked)} className="w-4 h-4" />
              <span className="font-medium">Quick Sale</span>
            </label>
            
            {!quickSale && (
              <ClientAutocomplete
                value={clientName}
                onChange={setClientName}
                onSelect={c=>{setClientName(`${c.first_name} ${c.last_name}`); setCustomerId(c.id);}}
              />
            )}
            {!quickSale && (
              <VehicleAutocomplete
                value={vehiclePlate}
                onChange={setVehiclePlate}
                onSelect={v=>{setVehiclePlate(v.licence_plate); setVehicleId(v.id);}}
              />
            )}
          </div>
          
          <div className="flex-grow"/>
          
          <div className="flex items-center space-x-3">
            {session && (
              <Link href="/office/epos/end-day" className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                Close Session
              </Link>
            )}
            <Link href="/office" className="bg-gray-600 hover:bg-gray-700 px-4 py-2 text-sm font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
              Return to Office
            </Link>
            <Link href={session?"/office/epos/end-day":"/office/epos/start-day"} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 text-sm font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
              Manager
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-6">
          {/* Left pane - Categories and Products */}
          <div className="w-full lg:w-2/3 overflow-y-auto">
            {/* Enhanced Categories Section */}
            <SectionCard title="Categories" className="mb-6">
              <div className="flex flex-wrap gap-3">
                {/* All Products Button */}
                <button
                  onClick={()=>setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl scale-105'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-xl'
                  }`}
                >
                  🌟 All Products
                </button>
                
                {/* Category Buttons */}
                {categories.map(cat=>(
                  <button
                    key={cat.id}
                    onClick={()=>setSelectedCategory(cat.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      cat.id === selectedCategory
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-xl'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Quick Sale Section - Only show when quickSale is enabled */}
            {quickSale && (
              <div className="mb-6">
                <QuickSaleProductEntry onAddToCart={addToCart} />
              </div>
            )}

            {/* Enhanced Search */}
            <div className="mb-6">
              <Input
                placeholder="Search products by name or part number..."
                className="w-full bg-white text-black border-2 border-gray-300 focus:border-blue-500 rounded-xl py-4 text-lg shadow-lg"
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
              />
            </div>

            {/* Enhanced Products Section - Hide when in quick sale mode */}
            {!quickSale && (
              <SectionCard title={`${selectedCategory === 'all' ? 'All Products' : 'Products'} (${visibleProducts.length})`}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"/>
                  ))}
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No products found</div>
                  <div className="text-gray-400">Try adjusting your search or category selection</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.map(p=>(
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onAddToCart={addToCart}
                      suppliers={suppliers}
                    />
                  ))}
                </div>
              )}
              </SectionCard>
            )}
          </div>

          {/* Right pane - Enhanced Cart and Payment */}
          <div className="w-full lg:w-1/3 flex flex-col space-y-6">
            {/* Enhanced Cart Section */}
            <SectionCard title={`Cart (${cartItems.length} items)`}>
              {cartItems.length ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cartItems.map(item=>(
                    <div key={item.part_id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-sm leading-tight mb-1">
                            {item.description}
                          </div>
                          {item.part_number && (
                            <div className="text-xs text-gray-600 font-mono bg-gray-200 px-2 py-1 rounded">
                              #{item.part_number}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">€{(item.price && typeof item.price === 'number' ? item.price.toFixed(2) : '0.00')}</div>
                          <div className="font-bold text-lg text-green-600">€{((item.price && typeof item.price === 'number' ? item.price : 0) * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={()=>updateQty(item.part_id, item.quantity-1)}
                            className="w-8 h-8 p-0 rounded-full"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={()=>updateQty(item.part_id, item.quantity+1)}
                            className="w-8 h-8 p-0 rounded-full"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">🛒</div>
                  <div className="text-gray-500">No items in cart</div>
                  <div className="text-gray-400 text-sm">Select products to get started</div>
                </div>
              )}
            </SectionCard>

            {/* Enhanced Summary & Payment */}
            <SectionCard title="Summary & Payment">
              <div className="space-y-4 text-black">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg font-medium">Subtotal</span>
                  <span className="text-lg font-bold">€{(total && typeof total === 'number' ? total.toFixed(2) : '0.00')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg font-medium">Tax</span>
                  <span className="text-lg font-bold">€0.00</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-blue-100 px-4 rounded-lg">
                  <span className="text-xl font-bold text-blue-800">Total</span>
                  <span className="text-2xl font-bold text-blue-800">€{(total && typeof total === 'number' ? total.toFixed(2) : '0.00')}</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200" 
                  onClick={()=>setShowPayment(true)}
                  disabled={cartItems.length === 0}
                >
                  💳 Take Payment
                </Button>
              </div>
            </SectionCard>

            {/* Enhanced Keypad */}
            <Keypad
              onPress={digit => setInvoiceLookup(prev => prev + digit)}
              onClear={() => setInvoiceLookup("")}
            />
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <Modal onClose={()=>setShowPayment(false)}>
            <div className="p-4 space-y-4 text-black">
              <h3 className="text-lg font-semibold">Payment</h3>
              <div>
                <label className="block mb-1">Type</label>
                <select value={paymentType} onChange={e=>setPaymentType(e.target.value)} className="input w-full">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>
              {paymentType==="cash" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['n50','n20','n10','n5','n2','n1','c050','c020','c010','c005'].map(n => (
                      <div key={n}>
                        <label className="block mb-1">
                          {n.startsWith('n') ? `€${n.slice(1)} notes` : `${n.slice(1)} coins`}
                        </label>
                        <Input
                          type="number"
                          value={cash[n]}
                          onChange={e => setCash({ ...cash, [n]: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div>Received: €{received.toFixed(2)}</div>
                    <div>Change: €{changeDue.toFixed(2)}</div>
                  </div>
                </>
              )}
              <div className="text-right">
                <Button onClick={takePayment}>Confirm</Button>
              </div>
            </div>
          </Modal>
        )}
      </EposLayout>
    </div>
  );
}

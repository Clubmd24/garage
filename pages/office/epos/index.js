import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import OfficeLayout from "../../../components/OfficeLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "../../../components/ui/Modal.jsx";
import ClientAutocomplete from "../../../components/ClientAutocomplete";
import VehicleAutocomplete from "../../../components/VehicleAutocomplete";

// Section wrapper
function SectionCard({ title, children }) {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-2 bg-blue-600 text-white font-semibold">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Touch‐friendly numpad
function Numpad({ initial, onConfirm, onCancel }) {
  const [value, setValue] = useState(initial);
  const press = d => {
    if (d === "C") setValue("");
    else setValue(v => v + d);
  };
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-xl z-50"
    >
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["1","2","3","4","5","6","7","8","9","0","C"].map(d => (
          <button
            key={d}
            onClick={() => press(d)}
            className="bg-gray-200 h-12 rounded-lg text-xl font-semibold"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(value)}>Done</Button>
      </div>
    </motion.div>
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
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );
  return { items, add, updateQty, clear, total };
}

export default function EposPage() {
  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
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
  const [clientName, setClientName]       = useState("");
  const [customerId, setCustomerId]       = useState("");
  const [vehiclePlate, setVehiclePlate]   = useState("");
  const [vehicleId, setVehicleId]         = useState("");
  const [session, setSession]             = useState(null);
  const [showPayment, setShowPayment]     = useState(false);
  const [paymentType, setPaymentType]     = useState("cash");
  const [cash, setCash]                   = useState({ n50:0,n20:0,n10:0,n5:0,coins:0 });

  // Numpad
  const [numpadField, setNumpadField] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Start day
  useEffect(() => {
    fetch("/api/epos/start-day")
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  // Load categories & products
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/categories").then(r => r.ok? r.json():Promise.reject()),
      fetch("/api/parts").then(r => r.ok? r.json():Promise.reject())
    ])
      .then(([c,p])=>{
        setCategories(c);
        const norm = p.map(x=>({
          ...x,
          unit_cost: Number(x.unit_cost)||0
        }));
        setProducts(norm);
        if(c.length) setSelectedCategory(c[0].id);
      })
      .catch(()=>setError("Failed to load"))
      .finally(()=>setLoading(false));
  }, []);

  // Invoice lookup
  const loadInvoice = async () => {
    if(!invoiceLookup) return;
    setError(null);
    try{
      const res = await fetch(`/api/invoices/${invoiceLookup}`);
      if(!res.ok) throw new Error();
      const data = await res.json();
      data.customer_id && setCustomerId(data.customer_id);
      data.vehicle_id && setVehicleId(data.vehicle_id);
      if(Array.isArray(data.items)){
        clearCart();
        data.items.forEach(it=>{
          addToCart({
            part_id: it.part_id,
            description: it.description,
            price: Number(it.unit_price)||0,
            quantity: it.qty
          });
        });
      }
    }catch{
      setError("Invoice not found");
    }
  };

  // Payment calc
  const received = 50*cash.n50+20*cash.n20+10*cash.n10+5*cash.n5+Number(cash.coins||0);
  const changeDue = received - total;

  // Submit payment
  const takePayment = async () => {
    if(!session) return alert("No session");
    await fetch("/api/epos/sales",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        session_id: session.id,
        customer_id: customerId||null,
        vehicle_id:   vehicleId||null,
        payment_type: paymentType,
        total_amount: total,
        items: cartItems.map(i=>({
          part_id: i.part_id,
          qty:     i.quantity,
          unit_price: i.price
        }))
      })
    });
    alert(`Processed €${total.toFixed(2)}`);
    clearCart();
    setShowPayment(false);
    setCash({n50:0,n20:0,n10:0,n5:0,coins:0});
  };

  // Handle numpad confirm
  const handleNumpadConfirm = val => {
    if(numpadField === "invoice") {
      setInvoiceLookup(val);
    } else if(numpadField?.startsWith("qty-")) {
      const id = numpadField.split("-")[1];
      const qty = Number(val)||1;
      updateQty(id, qty);
    }
    setNumpadField(null);
  };

  // Filtered products
  const visibleProducts = products
    .filter(p => p.category_id === selectedCategory)
    .filter(p => p.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-gray-50 min-h-screen">
      <OfficeLayout>
        {/* Top bar */}
        <div className="flex items-center p-4 bg-blue-600 text-white space-x-2">
          <label className="font-medium">Invoice:</label>
          <Input
            value={invoiceLookup}
            onFocus={()=>setNumpadField("invoice")}
            readOnly
            placeholder="Enter invoice #"
            className="w-32 bg-white text-black"
          />
          <Button onClick={loadInvoice}>Search</Button>
          {error && <span className="text-red-200">{error}</span>}
          <ClientAutocomplete
            value={clientName}
            onChange={setClientName}
            onSelect={c=>{setClientName(`${c.first_name} ${c.last_name}`); setCustomerId(c.id);}}
          />
          <VehicleAutocomplete
            value={vehiclePlate}
            onChange={setVehiclePlate}
            onSelect={v=>{setVehiclePlate(v.licence_plate); setVehicleId(v.id);}}
          />
          <div className="flex-grow"/>
          <Link href="/office" className="underline">Return to Office</Link>
          <Link
            href={session?"/office/epos/end-day":"/office/epos/start-day"}
            className="ml-4 underline"
          >
            Manager
          </Link>
        </div>

        <div className="flex flex-1 overflow-hidden p-4">
          {/* Left pane */}
          <div className="w-2/3 overflow-y-auto pr-4">
            <SectionCard title="Categories">
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map(cat=>(
                  <Button
                    key={cat.id}
                    variant={cat.id===selectedCategory?"primary":"outline"}
                    onClick={()=>setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </SectionCard>

            <Input
              placeholder="Search products…"
              className="mb-4 w-full bg-white"
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
            />

            <SectionCard title="Products">
              {loading ? (
                <div className="grid grid-cols-3 gap-6">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"/>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {visibleProducts.map(p=>(
                    <motion.div
                      key={p.id}
                      whileHover={{ scale:1.02, y:-4 }}
                      transition={{ duration:0.2 }}
                      className="cursor-pointer"
                      onClick={()=>addToCart({part_id:p.id,description:p.description,price:p.unit_cost})}
                    >
                      <Card>
                        <CardContent className="flex flex-col justify-between h-32">
                          <div className="font-medium truncate">{p.description}</div>
                          <div>€{p.unit_cost.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right pane */}
          <div className="w-1/3 flex flex-col">
            <SectionCard title="Cart">
              {cartItems.length ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map(item=>(
                    <motion.div
                      key={item.part_id}
                      whileHover={{ scale:1.02 }}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-gray-600">
                          €{item.price.toFixed(2)}
                        </div>
                      </div>
                      <div
                        className="flex items-center space-x-1"
                        onClick={()=>setNumpadField(`qty-${item.part_id}`)}
                      >
                        <Button size="sm" variant="outline">–</Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button size="sm" variant="outline">+</Button>
                      </div>
                      <div className="font-semibold">
                        €{(item.price*item.quantity).toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No items in cart</div>
              )}
            </SectionCard>

            <SectionCard title="Summary & Payment">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span><span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span><span>€0.00</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span><span>€{total.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-4" onClick={()=>setShowPayment(true)}>
                  Take Payment
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <Modal onClose={()=>setShowPayment(false)}>
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">Payment</h3>
              <div>
                <label className="block mb-1">Type</label>
                <select
                  value={paymentType}
                  onChange={e=>setPaymentType(e.target.value)}
                  className="input w-full"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>
              {paymentType==="cash" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {["n50","n20","n10","n5"].map(n=>(
                      <div key={n}>
                        <label className="block mb-1">€{n.slice(1)} notes</label>
                        <Input
                          type="number"
                          value={cash[n]}
                          onChange={e=>setCash({...cash,[n]:Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block mb-1">Coins</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={cash.coins}
                        onChange={e=>setCash({...cash,coins:Number(e.target.value)})}
                        className="w-full"
                      />
                    </div>
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

        {/* Numpad Overlay */}
        <AnimatePresence>
          {numpadField && (
            <Numpad
              key="numpad"
              initial={numpadField==="invoice"? invoiceLookup : 
                cartItems.find(i=>`qty-${i.part_id}`===numpadField)?.quantity.toString()||""}
              onConfirm={handleNumpadConfirm}
              onCancel={()=>setNumpadField(null)}
            />
          )}
        </AnimatePresence>
      </OfficeLayout>
    </div>
  );
}

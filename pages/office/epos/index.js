import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import OfficeLayout from "../../../components/OfficeLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "../../../components/ui/Modal.jsx";
import ClientAutocomplete from "../../../components/ClientAutocomplete";
import VehicleAutocomplete from "../../../components/VehicleAutocomplete";

// Simple section wrapper
function SectionCard({ title, children }) {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-2 bg-blue-700 text-white font-semibold">
        {title}
      </div>
      <div className="p-4">{children}</div>
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
  const updateQty = (part_id, delta) => {
    setItems(prev =>
      prev
        .map(i =>
          i.part_id === part_id
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
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
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    items: cartItems,
    add: addToCart,
    updateQty,
    clear: clearCart,
    total,
  } = useCart();

  const [invoiceLookup, setInvoiceLookup] = useState("");
  const [clientName, setClientName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [session, setSession] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("cash");
  const [cash, setCash] = useState({ n50: 0, n20: 0, n10: 0, n5: 0, coins: 0 });

  // Start day
  useEffect(() => {
    fetch("/api/epos/start-day")
      .then(r => (r.ok ? r.json() : null))
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  // Load categories & products (normalize prices)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/categories").then(r => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/parts").then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([c, p]) => {
        setCategories(c);
        const normalized = p.map(item => ({
          ...item,
          unit_cost: Number(item.unit_cost) || 0,
        }));
        setProducts(normalized);
        if (c.length) setSelectedCategory(c[0].id);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  // Invoice lookup
  const loadInvoice = async () => {
    if (!invoiceLookup) return;
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceLookup}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.customer_id) setCustomerId(data.customer_id);
      if (data.vehicle_id) setVehicleId(data.vehicle_id);
      if (Array.isArray(data.items)) {
        clearCart();
        data.items.forEach(it =>
          addToCart({
            part_id: it.part_id,
            description: it.description,
            price: Number(it.unit_price) || 0,
            quantity: it.qty,
          })
        );
      }
    } catch {
      setError("Invoice not found");
    }
  };

  // Payment calcs
  const received =
    50 * cash.n50 +
    20 * cash.n20 +
    10 * cash.n10 +
    5 * cash.n5 +
    Number(cash.coins || 0);
  const changeDue = received - total;

  // Process payment
  const takePayment = async () => {
    if (!session) return alert("No active session");
    await fetch("/api/epos/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.id,
        customer_id: customerId || null,
        vehicle_id: vehicleId || null,
        payment_type: paymentType,
        total_amount: total,
        items: cartItems.map(it => ({
          part_id: it.part_id,
          qty: it.quantity,
          unit_price: it.price,
        })),
      }),
    });
    alert(`Processed payment: €${total.toFixed(2)}`);
    clearCart();
    setShowPayment(false);
    setCash({ n50: 0, n20: 0, n10: 0, n5: 0, coins: 0 });
  };

  return (
    <OfficeLayout>
      {/* Top bar */}
      <div className="flex items-center space-x-2 p-4 bg-blue-700 text-white">
        <label className="font-semibold">Invoice:</label>
        <Input
          value={invoiceLookup}
          onChange={e => setInvoiceLookup(e.target.value)}
          placeholder="Enter invoice #"
          className="w-32"
        />
        <Button onClick={loadInvoice} variant="outline-light">
          Search
        </Button>
        {error && <span className="text-red-300 ml-2">{error}</span>}
        <ClientAutocomplete
          value={clientName}
          onChange={setClientName}
          onSelect={c => {
            setClientName(`${c.first_name} ${c.last_name}`);
            setCustomerId(c.id);
          }}
        />
        <VehicleAutocomplete
          value={vehiclePlate}
          onChange={setVehiclePlate}
          onSelect={v => {
            setVehiclePlate(v.licence_plate);
            setVehicleId(v.id);
          }}
        />
        <div className="flex-grow" />
        <Link href="/office" className="text-white hover:underline">
          Return to Office
        </Link>
        <Link
          href={session ? "/office/epos/end-day" : "/office/epos/start-day"}
          className="ml-4 text-white hover:underline"
        >
          Manager
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Categories & Products */}
        <div className="w-2/3 overflow-y-auto p-4">
          <SectionCard title="Categories">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={cat.id === selectedCategory ? "primary" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Products">
            <div className="grid grid-cols-3 gap-4">
              {products
                .filter(p => p.category_id === selectedCategory)
                .map(p => (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:shadow-lg"
                    onClick={() =>
                      addToCart({
                        part_id: p.id,
                        description: p.description,
                        price: p.unit_cost,
                      })
                    }
                  >
                    <CardContent className="flex flex-col justify-between h-32">
                      <div className="font-semibold truncate">{p.description}</div>
                      <div>€{p.unit_cost.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </SectionCard>
        </div>

        {/* Right: Cart & Summary */}
        <div className="w-1/3 flex flex-col p-4">
          <SectionCard title="Cart">
            <div className="flex-1 overflow-y-auto max-h-64">
              {cartItems.length ? (
                cartItems.map(item => (
                  <div
                    key={item.part_id}
                    className="flex items-center justify-between mb-2 p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-600">
                        €{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQty(item.part_id, -1)}
                      >
                        –
                      </Button>
                      <span className="px-2">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQty(item.part_id, +1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="font-semibold">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No items in cart</div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Summary & Payment">  
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>€0.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-4" onClick={() => setShowPayment(true)}>
                Take Payment
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <Modal onClose={() => setShowPayment(false)}>
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Payment</h3>
            <div>
              <label className="block mb-1">Type</label>
              <select
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
                className="input w-full"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            {paymentType === "cash" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {["n50", "n20", "n10", "n5"].map(note => (
                    <div key={note}>
                      <label className="block mb-1">€{note.slice(1)} notes</label>
                      <Input
                        type="number"
                        value={cash[note]}
                        onChange={e =>
                          setCash({ ...cash, [note]: Number(e.target.value) })
                        }
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
                      onChange={e =>
                        setCash({ ...cash, coins: Number(e.target.value) })
                      }
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
    </OfficeLayout>
  );
}

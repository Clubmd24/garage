import React, { useState, useEffect } from "react";
import Link from "next/link";
import OfficeLayout from "../../../components/OfficeLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "../../../components/ui/Modal.jsx";
import ClientAutocomplete from "../../../components/ClientAutocomplete";
import VehicleAutocomplete from "../../../components/VehicleAutocomplete";

export default function EposPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [clientName, setClientName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [invoiceLookup, setInvoiceLookup] = useState("");
  const [session, setSession] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("cash");
  const [cash, setCash] = useState({ n50: 0, n20: 0, n10: 0, n5: 0, coins: 0 });

  useEffect(() => {
    fetch('/api/epos/start-day')
      .then(r => (r.ok ? r.json() : null))
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/parts').then(r => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([c, p]) => {
        setCategories(c);
        setProducts(p);
        if (c.length) setSelectedCategory(c[0].id);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  const handleKeypad = (digit) => {
    setInputValue((prev) => prev + digit);
  };

  const clearInput = () => setInputValue("");
  const total = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const received =
    50 * cash.n50 +
    20 * cash.n20 +
    10 * cash.n10 +
    5 * cash.n5 +
    Number(cash.coins || 0);
  const changeDue = received - total;

  const loadInvoice = async () => {
    if (!invoiceLookup) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceLookup}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.customer_id) setCustomerId(data.customer_id);
      if (data.vehicle_id) setVehicleId(data.vehicle_id);
      if (Array.isArray(data.items)) {
        setCartItems(
          data.items.map((it) => ({
            part_id: it.part_id,
            name: it.description,
            price: it.unit_price,
            quantity: it.qty,
          }))
        );
      }
    } catch {}
  };

  const takePayment = async () => {
    if (!session) {
      alert('No active session');
      return;
    }
    await fetch('/api/epos/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        customer_id: customerId || null,
        vehicle_id: vehicleId || null,
        payment_type: paymentType,
        total_amount: total,
        items: cartItems.map((it) => ({
          part_id: it.part_id || it.id,
          qty: it.quantity,
          unit_price: it.price,
        })),
      }),
    });
    alert(`Processed payment: €${total.toFixed(2)}`);
    setCartItems([]);
    setInputValue('');
    setShowPayment(false);
    setCash({ n50: 0, n20: 0, n10: 0, n5: 0, coins: 0 });
  };

  return (
    <OfficeLayout>
      {showPayment && (
        <Modal onClose={() => setShowPayment(false)} data-testid="payment-modal">
          <div className="space-y-2">
            <div>
              <label className="block mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="input w-full"
                aria-label="Payment Type"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            {paymentType === 'cash' && (
              <div className="space-y-2">
                <div>
                  <label className="block mb-1">€50 notes</label>
                  <Input
                    type="number"
                    value={cash.n50}
                    onChange={(e) => setCash({ ...cash, n50: Number(e.target.value) })}
                    aria-label="€50 notes"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">€20 notes</label>
                  <Input
                    type="number"
                    value={cash.n20}
                    onChange={(e) => setCash({ ...cash, n20: Number(e.target.value) })}
                    aria-label="€20 notes"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">€10 notes</label>
                  <Input
                    type="number"
                    value={cash.n10}
                    onChange={(e) => setCash({ ...cash, n10: Number(e.target.value) })}
                    aria-label="€10 notes"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">€5 notes</label>
                  <Input
                    type="number"
                    value={cash.n5}
                    onChange={(e) => setCash({ ...cash, n5: Number(e.target.value) })}
                    aria-label="€5 notes"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Coins</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cash.coins}
                    onChange={(e) => setCash({ ...cash, coins: Number(e.target.value) })}
                    aria-label="Coins"
                    className="input w-full"
                  />
                </div>
                <p>Received: €{received.toFixed(2)}</p>
                <p>Change: €{changeDue.toFixed(2)}</p>
              </div>
            )}
            <div className="text-right">
              <Button onClick={takePayment}>Confirm</Button>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex flex-col h-full space-y-4 p-4">
      <div className="flex gap-2 mb-2">
        <ClientAutocomplete
          value={clientName}
          onChange={setClientName}
          onSelect={(c) => {
            setClientName(`${c.first_name || ''} ${c.last_name || ''}`.trim());
            setCustomerId(c.id);
          }}
        />
        <VehicleAutocomplete
          value={vehiclePlate}
          onChange={setVehiclePlate}
          onSelect={(v) => {
            setVehiclePlate(v.licence_plate);
            setVehicleId(v.id);
          }}
        />
        <div className="flex gap-1">
          <Input
            value={invoiceLookup}
            onChange={(e) => setInvoiceLookup(e.target.value)}
            placeholder="Invoice ID"
            className="w-24"
          />
          <Button type="button" onClick={loadInvoice}>
            Load
          </Button>
        </div>
      </div>
        {error && <p className="text-red-500">{error}</p>}
        {loading && <p>Loading…</p>}
        <div className="flex justify-between items-center mb-4">
          <Link href="/office" className="button">
            Return to Office
          </Link>
          <Link
            href={session ? "/office/epos/end-day" : "/office/epos/start-day"}
            className="button-secondary"
          >
            Manager
          </Link>
        </div>
      {/* Cart & keypad pane - now full width */}
      <div className="flex flex-col flex-1 justify-between">
        <Card className="flex-1 mb-4">
          <CardContent className="space-y-2">
            <h2 className="text-lg font-semibold">Cart</h2>
            <ul className="space-y-1">
              {cartItems.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-2 w-1/2">
              {["1","2","3","4","5","6","7","8","9","0","C"].map((key) => (
                <Button
                  key={key}
                  onClick={() => key === "C" ? clearInput() : handleKeypad(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
            <Button onClick={() => setShowPayment(true)} className="w-full">
              Take Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories & products panes beneath the cart */}
      <div className="flex space-x-4">
        <aside className="w-1/6">
          <Card className="h-full">
            <CardContent className="space-y-2">
              <h2 className="text-lg font-semibold">Categories</h2>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={cat.id === selectedCategory ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="w-full text-left"
                >
                  {cat.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Products pane */}
        <div className="w-1/4">
          <Card className="h-full">
            <CardContent className="grid grid-cols-2 gap-2">
              {products
                .filter((p) => p.category_id === selectedCategory)
                .map((p) => (
                  <Button
                    key={p.id}
                    onClick={() =>
                      addToCart({
                        id: p.id,
                        name: p.description || p.part_number,
                        price: p.unit_cost || 0,
                      })
                    }
                    className="flex flex-col items-center p-2"
                  >
                    <span>{p.description || p.part_number}</span>
                    <small>€{Number(p.unit_cost || 0).toFixed(2)}</small>
                  </Button>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </OfficeLayout>
  );
}

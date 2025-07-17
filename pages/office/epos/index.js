import { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';

function Keypad({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input w-full mb-2"
    />
  );
}

export default function EposPage() {
  const [categories, setCategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState(1);
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/parts?category_id=${categoryId}`)
      .then(r => r.json())
      .then(setParts);
  }, [categoryId]);

  const add = p => {
    setCart(c => [...c, { ...p, qty }]);
    setQty(1);
  };

  const remove = idx => setCart(c => c.filter((_, i) => i !== idx));

  const pay = async type => {
    const total = cart.reduce((sum, i) => sum + i.unit_cost * i.qty, 0);
    await fetch('/api/epos/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: 1, payment_type: type, total_amount: total, items: cart.map(i => ({ part_id: i.id, qty: i.qty, unit_price: i.unit_cost })) }),
    });
    setCart([]);
    setShowPay(false);
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">EPOS</h1>
      {!categoryId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className="button">
              {c.name}
            </button>
          ))}
        </div>
      )}
      {categoryId && (
        <div className="space-y-2">
          <button onClick={() => setCategoryId(null)} className="button-secondary mb-2">Back</button>
          <Keypad value={qty} onChange={setQty} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {parts.map(p => (
              <button key={p.id} onClick={() => add(p)} className="button">
                {p.part_number}
              </button>
            ))}
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold mt-4 mb-2">Cart</h2>
      <ul className="space-y-1">
        {cart.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {item.qty} x {item.part_number}
            </span>
            <button onClick={() => remove(i)} className="text-red-500">Remove</button>
          </li>
        ))}
      </ul>
      {cart.length > 0 && (
        <div className="mt-4 space-x-2">
          <button onClick={() => setShowPay(true)} className="button">Pay</button>
          <button onClick={() => setCart([])} className="button-secondary">Clear</button>
        </div>
      )}
      {showPay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-x-2">
            <button onClick={() => pay('cash')} className="button">Cash</button>
            <button onClick={() => pay('card')} className="button">Card</button>
            <button onClick={() => setShowPay(false)} className="button-secondary">Cancel</button>
          </div>
        </div>
      )}
    </OfficeLayout>
  );
}

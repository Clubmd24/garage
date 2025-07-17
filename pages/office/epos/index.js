import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function EposPage() {
  // sample data
  const categories = ["Beverages", "Snacks", "Meals", "Desserts"];
  const products = {
    Beverages: [
      { id: 1, name: "Coffee", price: 2.5 },
      { id: 2, name: "Tea", price: 2.0 },
      { id: 3, name: "Soda", price: 1.5 },
    ],
    Snacks: [
      { id: 4, name: "Chips", price: 1.0 },
      { id: 5, name: "Nuts", price: 1.2 },
    ],
    // ... more
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [cartItems, setCartItems] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  const handleKeypad = (digit) => {
    setInputValue((prev) => prev + digit);
  };

  const clearInput = () => setInputValue("");

  const takePayment = () => {
    // TODO: integrate payment handling
    alert(`Processing payment: $${inputValue}`);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
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
            <div className="mb-2">
              <Input
                readOnly
                value={inputValue}
                placeholder="Enter payment amount"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {["1","2","3","4","5","6","7","8","9","0","C"].map((key) => (
                <Button
                  key={key}
                  onClick={() => key === "C" ? clearInput() : handleKeypad(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
            <Button onClick={takePayment} className="w-full">
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
                  key={cat}
                  variant={cat === selectedCategory ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="w-full text-left"
                >
                  {cat}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Products pane */}
        <div className="w-1/4">
          <Card className="h-full">
            <CardContent className="grid grid-cols-2 gap-2">
              {products[selectedCategory]?.map((p) => (
                <Button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex flex-col items-center p-2"
                >
                  <span>{p.name}</span>
                  <small>${p.price.toFixed(2)}</small>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

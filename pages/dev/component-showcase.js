import React, { useState } from 'react';
import Button from '../../components/ui/design-system/Button';
import Card from '../../components/ui/design-system/Card';

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'cards', label: 'Cards', icon: '🃏' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'utilities', label: 'Utilities', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Design System Showcase
          </h1>
          <p className="text-xl text-gray-400">
            Explore all the components and utilities from the Design Blueprint
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-1 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-2xl p-8 backdrop-blur-xl">
          {activeTab === 'buttons' && <ButtonShowcase />}
          {activeTab === 'cards' && <CardShowcase />}
          {activeTab === 'layout' && <LayoutShowcase />}
          {activeTab === 'utilities' && <UtilityShowcase />}
        </div>
      </div>
    </div>
  );
}

function ButtonShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Button Components</h2>
      
      {/* Button Variants */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-300">Variants</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      {/* Button Sizes */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-300">Sizes</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
    </div>
  );
}

function CardShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Card Components</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="default" className="p-6">
          <h3 className="text-xl font-semibold mb-3">Default Card</h3>
          <p className="text-gray-400">This is a default card with standard styling.</p>
        </Card>

        <Card variant="stats" className="p-6">
          <h3 className="text-xl font-semibold mb-3">Stats Card</h3>
          <p className="text-gray-400">Perfect for displaying metrics and statistics.</p>
        </Card>

        <Card variant="warning" className="p-6">
          <h3 className="text-xl font-semibold mb-3">Warning Card</h3>
          <p className="text-gray-400">Use this for important notices and warnings.</p>
        </Card>

        <Card variant="danger" className="p-6">
          <h3 className="text-xl font-semibold mb-3">Danger Card</h3>
          <p className="text-gray-400">Highlight critical information and errors.</p>
        </Card>

        <Card variant="info" className="p-6">
          <h3 className="text-xl font-semibold mb-3">Info Card</h3>
          <p className="text-gray-400">Display informational content and tips.</p>
        </Card>
      </div>
    </div>
  );
}

function LayoutShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Layout System</h2>
      
      {/* Grid Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Grid Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg text-center">
              Grid Item {i}
            </div>
          ))}
        </div>
      </div>

      {/* Flexbox Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Flexbox Layout</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="bg-gray-700 px-4 py-2 rounded-lg">Flex Item 1</div>
          <div className="bg-gray-700 px-4 py-2 rounded-lg">Flex Item 2</div>
          <div className="bg-gray-700 px-4 py-2 rounded-lg">Flex Item 3</div>
        </div>
      </div>

      {/* Stack Layout */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Stack Layout</h3>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <div className="bg-gray-700 p-4 rounded-lg text-center">Stack Item 1</div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">Stack Item 2</div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">Stack Item 3</div>
        </div>
      </div>
    </div>
  );
}

function UtilityShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Utility Classes</h2>
      
      {/* Spacing Utilities */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Spacing Utilities</h3>
        <div className="space-y-2">
          <div className="bg-gray-700 p-2 rounded">Padding 2 (p-2)</div>
          <div className="bg-gray-700 p-4 rounded">Padding 4 (p-4)</div>
          <div className="bg-gray-700 p-6 rounded">Padding 6 (p-6)</div>
        </div>
      </div>

      {/* Color Utilities */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Color Utilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-600 p-4 rounded text-center">Blue 600</div>
          <div className="bg-emerald-600 p-4 rounded text-center">Emerald 600</div>
          <div className="bg-amber-600 p-4 rounded text-center">Amber 600</div>
          <div className="bg-red-600 p-4 rounded text-center">Red 600</div>
        </div>
      </div>

      {/* Typography Utilities */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-300">Typography Utilities</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Small text (text-sm)</p>
          <p className="text-base text-gray-300">Base text (text-base)</p>
          <p className="text-lg text-gray-200">Large text (text-lg)</p>
          <p className="text-xl text-gray-100">Extra large text (text-xl)</p>
        </div>
      </div>
    </div>
  );
}

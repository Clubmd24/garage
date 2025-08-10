#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Installing Garage Management System Design Blueprint...\n');

// Create directories if they don't exist
const dirs = [
  'styles/design-system',
  'components/ui/design-system',
  'lib/design-system'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// 1. Install CSS Variables and Base Styles
console.log('\n📦 Installing CSS Variables and Base Styles...');
installCSSVariables();

// 2. Install Component System
console.log('\n🧩 Installing Component System...');
installComponentSystem();

// 3. Install Layout System
console.log('\n📐 Installing Layout System...');
installLayoutSystem();

// 4. Install Utility Classes
console.log('\n🔧 Installing Utility Classes...');
installUtilityClasses();

// 5. Update Tailwind Config
console.log('\n🎨 Updating Tailwind Configuration...');
updateTailwindConfig();

// 6. Create Component Showcase
console.log('\n🎭 Creating Component Showcase...');
createComponentShowcase();

console.log('\n🎉 Design Blueprint Installation Complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run dev');
console.log('2. Visit: /dev/component-showcase');
console.log('3. Check the new design system components');

function installCSSVariables() {
  const cssContent = `/* Design Blueprint CSS Variables */
:root {
  /* Primary Colors */
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-primary-glow: #60a5fa;
  
  /* Accent Colors */
  --color-accent: #f59e0b;
  --color-accent-light: #fbbf24;
  --color-accent-dark: #d97706;
  
  /* Success/Status Colors */
  --color-success: #10b981;
  --color-success-light: #34d399;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
  
  /* Dark Theme Backgrounds */
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #111118;
  --color-bg-tertiary: #1a1a24;
  --color-bg-elevated: #1f1f2a;
  --color-bg-glass: rgba(26, 26, 36, 0.8);
  
  /* Surface Colors */
  --color-surface-primary: #1a1a24;
  --color-surface-secondary: #262632;
  --color-surface-tertiary: #333340;
  --color-surface-elevated: #404050;
  
  /* Border Colors */
  --color-border-primary: #333340;
  --color-border-secondary: #404050;
  --color-border-accent: #3b82f6;
  --color-border-glow: rgba(59, 130, 246, 0.3);
  
  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #b8b8c8;
  --color-text-tertiary: #8a8a9a;
  --color-text-muted: #6a6a7a;
  --color-text-accent: #3b82f6;
  
  /* Spacing Scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  --spacing-5xl: 8rem;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Dark theme (default) */
.dark {
  color-scheme: dark;
}

/* Light theme support */
.light {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-elevated: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #64748b;
  --color-border-primary: #e2e8f0;
  --color-border-secondary: #cbd5e1;
}
`;

  fs.writeFileSync('styles/design-system/variables.css', cssContent);
  console.log('✅ Created CSS variables file');
}

function installComponentSystem() {
  // Button Component
  const buttonComponent = `import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'btn-modern transition-modern font-semibold rounded-xl';
  
  const variants = {
    primary: 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/20 text-white hover:from-blue-700 hover:to-blue-800',
    secondary: 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 text-gray-300 hover:from-gray-700/90 hover:to-gray-800/90',
    success: 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500/20 text-white hover:from-emerald-700 hover:to-emerald-800',
    warning: 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500/20 text-white hover:from-amber-700 hover:to-amber-800',
    danger: 'bg-gradient-to-br from-red-600 to-red-700 border-red-500/20 text-white hover:from-red-700 hover:to-red-800',
    ghost: 'bg-transparent border-blue-500/20 text-blue-400 hover:bg-blue-500/10'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  const classes = \`\${baseClasses} \${variants[variant]} \${sizes[size]} \${className}\`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
`;

  fs.writeFileSync('components/ui/design-system/Button.jsx', buttonComponent);
  console.log('✅ Created Button component');

  // Card Component
  const cardComponent = `import React from 'react';

export const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'card-modern backdrop-blur-xl border border-blue-500/10 rounded-2xl shadow-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-gradient-to-br from-gray-900/90 to-gray-800/90',
    stats: 'bg-gradient-to-br from-emerald-500/10 to-emerald-400/10 border-l-4 border-l-emerald-500',
    warning: 'bg-gradient-to-br from-amber-500/10 to-amber-400/10 border-l-4 border-l-amber-500',
    danger: 'bg-gradient-to-br from-red-500/10 to-red-400/10 border-l-4 border-l-red-500',
    info: 'bg-gradient-to-br from-blue-500/10 to-blue-400/10 border-l-4 border-l-blue-500'
  };
  
  const classes = \`\${baseClasses} \${variants[variant]} \${className}\`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
`;

  fs.writeFileSync('components/ui/design-system/Card.jsx', cardComponent);
  console.log('✅ Created Card component');
}

function installLayoutSystem() {
  const layoutCSS = `/* Layout System CSS */
.container-modern {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }

.grid-modern {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  padding: 1.5rem;
}

.flex-modern { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }

.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }

.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-initial { flex: 0 1 auto; }
.flex-none { flex: none; }

/* Spacing Utilities */
.m-0 { margin: 0; }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }
.m-xl { margin: var(--spacing-xl); }

.p-0 { padding: 0; }
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }

/* Layout Components */
.card-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sidebar-layout {
  display: flex;
  min-height: 100vh;
}

.split-layout {
  display: flex;
  min-height: 100vh;
}

.stack-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.inline-layout {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
`;

  fs.writeFileSync('styles/design-system/layout.css', layoutCSS);
  console.log('✅ Created Layout system CSS');
}

function installUtilityClasses() {
  const utilityCSS = `/* Utility Classes */
.transition-modern {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.backdrop-blur-xl {
  backdrop-filter: blur(20px);
}

/* Position Utilities */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

/* Z-Index Scale */
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }

/* Overflow Utilities */
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-visible { overflow: visible; }
.overflow-scroll { overflow: scroll; }

/* Display Utilities */
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }
.none { display: none; }

/* Visibility Utilities */
.visible { visibility: visible; }
.invisible { visibility: hidden; }

/* Opacity Utilities */
.opacity-0 { opacity: 0; }
.opacity-25 { opacity: 0.25; }
.opacity-50 { opacity: 0.5; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }
`;

  fs.writeFileSync('styles/design-system/utilities.css', utilityCSS);
  console.log('✅ Created Utility classes CSS');
}

function updateTailwindConfig() {
  const tailwindConfigPath = 'tailwind.config.js';
  
  if (fs.existsSync(tailwindConfigPath)) {
    let config = fs.readFileSync(tailwindConfigPath, 'utf8');
    
    // Add design system colors
    if (!config.includes('design-system')) {
      const designSystemColors = `
  // Design System Colors
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      }
    },
    fontFamily: {
      'primary': ['Inter', 'ui-sans-serif', 'system-ui'],
      'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
    },
    spacing: {
      'xs': '0.25rem',
      'sm': '0.5rem',
      'md': '1rem',
      'lg': '1.5rem',
      'xl': '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
      '5xl': '8rem',
    },
    boxShadow: {
      'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    }
  }`;

      // Insert the design system colors into the config
      config = config.replace(
        /module\.exports\s*=\s*{([^}]+)}/,
        `module.exports = {$1${designSystemColors}\n}`
      );
      
      fs.writeFileSync(tailwindConfigPath, config);
      console.log('✅ Updated Tailwind config with design system colors');
    } else {
      console.log('ℹ️  Tailwind config already contains design system colors');
    }
  } else {
    console.log('⚠️  Tailwind config not found, skipping update');
  }
}

function createComponentShowcase() {
  const showcasePage = `import React, { useState } from 'react';
import Button from '../ui/design-system/Button';
import Card from '../ui/design-system/Card';

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
                className={\`px-6 py-3 rounded-lg transition-all duration-200 \${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }\`}
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
`;

  fs.writeFileSync('pages/dev/component-showcase.js', showcasePage);
  console.log('✅ Created component showcase page');
}

// Run the installation
console.log('🚀 Starting Design Blueprint installation...\n'); 
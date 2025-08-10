# 🎨 **GARAGE MANAGEMENT SYSTEM - DESIGN BLUEPRINT**

## **1. DESIGN PHILOSOPHY & VISION**

### **Core Principles**
- **Professional Automotive Aesthetic**: Inspired by luxury car dashboards and modern garage management systems
- **Dark Theme Excellence**: Deep, sophisticated dark palette with strategic accent lighting
- **User-Centric Design**: Tailored experiences for Mechanics, Office Staff, and Vehicle Owners
- **Smooth & Responsive**: Fluid animations, micro-interactions, and seamless transitions
- **Modern UI/UX**: Glassmorphism, subtle gradients, and professional typography

### **Target User Experience**
- **Mechanics**: Intuitive job management with clear visual hierarchy
- **Office Staff**: Efficient administrative tools with professional aesthetics
- **Vehicle Owners**: Clean, trustworthy interface for service tracking

## **2. ENHANCED COLOR SYSTEM**

### **Primary Palette (Automotive-Inspired)**
```css
/* Enhanced Primary Colors */
--color-primary: #2563eb;          /* Professional Blue */
--color-primary-light: #3b82f6;    /* Bright Blue */
--color-primary-dark: #1d4ed8;     /* Deep Blue */
--color-primary-glow: #60a5fa;     /* Glow Effect */

/* Enhanced Accent Colors */
--color-accent: #f59e0b;           /* Warning Orange */
--color-accent-light: #fbbf24;     /* Light Orange */
--color-accent-dark: #d97706;      /* Dark Orange */

/* Success/Status Colors */
--color-success: #10b981;          /* Emerald Green */
--color-success-light: #34d399;    /* Light Green */
--color-error: #ef4444;            /* Red */
--color-warning: #f59e0b;          /* Orange */
--color-info: #3b82f6;             /* Blue */
```

### **Enhanced Dark Theme**
```css
/* Sophisticated Dark Backgrounds */
--color-bg-primary: #0a0a0f;       /* Deepest Black */
--color-bg-secondary: #111118;      /* Rich Dark */
--color-bg-tertiary: #1a1a24;      /* Elevated Dark */
--color-bg-elevated: #1f1f2a;      /* Card Background */
--color-bg-glass: rgba(26, 26, 36, 0.8); /* Glass Effect */

/* Enhanced Surface Colors */
--color-surface-primary: #1a1a24;   /* Main Surface */
--color-surface-secondary: #262632;  /* Secondary Surface */
--color-surface-tertiary: #333340;   /* Tertiary Surface */
--color-surface-elevated: #404050;  /* Elevated Surface */

/* Professional Borders */
--color-border-primary: #333340;     /* Main Border */
--color-border-secondary: #404050;   /* Secondary Border */
--color-border-accent: #3b82f6;     /* Accent Border */
--color-border-glow: rgba(59, 130, 246, 0.3); /* Glow Border */
```

## **3. TYPOGRAPHY SYSTEM**

### **Font Hierarchy**
```css
/* Primary Font: Inter (Professional & Readable) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace Font: JetBrains Mono (Technical Data) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Enhanced Typography Scale */
h1: 2.5rem (40px) - Page Headers
h2: 2rem (32px) - Section Headers  
h3: 1.5rem (24px) - Subsection Headers
h4: 1.25rem (20px) - Card Headers
h5: 1.125rem (18px) - Feature Headers
h6: 1rem (16px) - Small Headers
```

### **Text Colors & Hierarchy**
```css
--color-text-primary: #ffffff;      /* Main Text */
--color-text-secondary: #b8b8c8;   /* Secondary Text */
--color-text-tertiary: #8a8a9a;    /* Tertiary Text */
--color-text-muted: #6a6a7a;       /* Muted Text */
--color-text-accent: #3b82f6;      /* Accent Text */
```

## **4. COMPONENT ENHANCEMENTS**

### **Enhanced Cards**
```css
/* Professional Card System */
.card-modern {
  background: linear-gradient(135deg, 
    rgba(26, 26, 36, 0.9) 0%, 
    rgba(38, 38, 50, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-modern:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

/* Card Variants */
.card-stats {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(52, 211, 153, 0.1) 100%);
  border-left: 4px solid #10b981;
}

.card-warning {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.1) 0%, 
    rgba(251, 191, 36, 0.1) 100%);
  border-left: 4px solid #f59e0b;
}

.card-danger {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1) 0%, 
    rgba(248, 113, 113, 0.1) 100%);
  border-left: 4px solid #ef4444;
}

.card-info {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(96, 165, 250, 0.1) 100%);
  border-left: 4px solid #3b82f6;
}
```

### **Enhanced Buttons**
```css
/* Professional Button System */
.btn-modern {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-modern:hover::before {
  left: 100%;
}

/* Button Variants */
.btn-secondary {
  background: linear-gradient(135deg, rgba(38, 38, 50, 0.9) 0%, rgba(51, 51, 64, 0.9) 100%);
  border-color: rgba(59, 130, 246, 0.2);
  color: #b8b8c8;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: rgba(245, 158, 11, 0.2);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-ghost {
  background: transparent;
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.btn-ghost:hover {
  background: rgba(59, 130, 246, 0.1);
}
```

### **Enhanced Navigation**
```css
/* Modern Sidebar */
.sidebar-modern {
  background: linear-gradient(180deg, 
    rgba(26, 26, 36, 0.95) 0%, 
    rgba(38, 38, 50, 0.95) 100%);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(30px);
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.3);
}

/* Navigation Items */
.nav-item-modern {
  margin: 0.25rem 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item-modern::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  transition: width 0.3s ease;
  z-index: -1;
}

.nav-item-modern:hover::before {
  width: 100%;
}

/* Active Navigation State */
.nav-item-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.nav-item-active::before {
  width: 100%;
}
```

### **Enhanced Form Elements**
```css
/* Modern Input Fields */
.input-modern {
  background: rgba(26, 26, 36, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.input-modern:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(26, 26, 36, 0.9);
}

.input-modern::placeholder {
  color: #8a8a9a;
}

/* Select Dropdowns */
.select-modern {
  background: rgba(26, 26, 36, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.select-modern:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Textarea */
.textarea-modern {
  background: rgba(26, 26, 36, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  resize: vertical;
  min-height: 6rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.textarea-modern:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### **Enhanced Tables**
```css
/* Modern Data Tables */
.table-modern {
  background: rgba(26, 26, 36, 0.8);
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.table-modern th {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.table-modern td {
  padding: 1rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.05);
  color: #b8b8c8;
}

.table-modern tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

/* Table Variants */
.table-striped tbody tr:nth-child(even) {
  background: rgba(38, 38, 50, 0.3);
}

.table-bordered td,
.table-bordered th {
  border: 1px solid rgba(59, 130, 246, 0.1);
}
```

### **Enhanced Modals**
```css
/* Modern Modal System */
.modal-overlay {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, 
    rgba(26, 26, 36, 0.95) 0%, 
    rgba(38, 38, 50, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(30px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  background: none;
  border: none;
  color: #8a8a9a;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
```

### **Enhanced Status Indicators**
```css
/* Badge System */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Status Dots */
.status-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot-online {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-dot-offline {
  background: #6b7280;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
}

.status-dot-busy {
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}
```

### **Enhanced Loading States**
```css
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(90deg, 
    rgba(38, 38, 50, 0.5) 25%, 
    rgba(51, 51, 64, 0.5) 50%, 
    rgba(38, 38, 50, 0.5) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 0.5rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  width: 60%;
}

.skeleton-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.skeleton-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(26, 26, 36, 0.5);
}

/* Spinner */
.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Progress Bar */
.progress-bar {
  background: rgba(38, 38, 50, 0.5);
  border-radius: 0.5rem;
  height: 0.5rem;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 0.5rem;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## **5. LAYOUT & SPACING SYSTEM**

### **Container System**
```css
/* Professional Container System */
.container-modern {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Responsive Container Sizes */
.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

.container-xl {
  max-width: 1280px;
}

.container-2xl {
  max-width: 1536px;
}

.container-full {
  max-width: none;
}

/* Container with Sidebar Support */
.container-with-sidebar {
  margin-left: 280px; /* Adjust based on sidebar width */
  transition: margin-left 0.3s ease;
}

.container-with-sidebar.collapsed {
  margin-left: 80px; /* Collapsed sidebar width */
}
```

### **Grid System**
```css
/* Professional Grid Layout */
.grid-modern {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  padding: 1.5rem;
}

/* Advanced Grid Layouts */
.grid-2-cols {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3-cols {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4-cols {
  grid-template-columns: repeat(4, 1fr);
}

.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.grid-auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

/* Grid Areas for Complex Layouts */
.grid-dashboard {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.grid-dashboard-header {
  grid-area: header;
}

.grid-dashboard-sidebar {
  grid-area: sidebar;
}

.grid-dashboard-main {
  grid-area: main;
}

.grid-dashboard-aside {
  grid-area: aside;
}

.grid-dashboard-footer {
  grid-area: footer;
}

/* Responsive Grid Breakpoints */
@media (max-width: 1024px) {
  .grid-dashboard {
    grid-template-areas: 
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
  
  .grid-dashboard-sidebar,
  .grid-dashboard-aside {
    display: none;
  }
}
```

### **Flexbox Utilities**
```css
/* Flexbox Layout System */
.flex-modern {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
}

/* Flex Alignment */
.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.justify-evenly {
  justify-content: space-evenly;
}

/* Flex Item Alignment */
.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.items-baseline {
  align-items: baseline;
}

.items-stretch {
  align-items: stretch;
}

/* Flex Item Properties */
.flex-1 {
  flex: 1 1 0%;
}

.flex-auto {
  flex: 1 1 auto;
}

.flex-initial {
  flex: 0 1 auto;
}

.flex-none {
  flex: none;
}

.flex-grow {
  flex-grow: 1;
}

.flex-shrink {
  flex-shrink: 1;
}
```

### **Spacing Scale & Utilities**
```css
/* Enhanced Spacing System */
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
--spacing-4xl: 6rem;      /* 96px */
--spacing-5xl: 8rem;      /* 128px */

/* Margin Utilities */
.m-0 { margin: 0; }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }
.m-xl { margin: var(--spacing-xl); }
.m-2xl { margin: var(--spacing-2xl); }
.m-3xl { margin: var(--spacing-3xl); }

/* Margin Directional */
.mt-0 { margin-top: 0; }
.mt-xs { margin-top: var(--spacing-xs); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mt-xl { margin-top: var(--spacing-xl); }

.mb-0 { margin-bottom: 0; }
.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }

.ml-0 { margin-left: 0; }
.ml-xs { margin-left: var(--spacing-xs); }
.ml-sm { margin-left: var(--spacing-sm); }
.ml-md { margin-left: var(--spacing-md); }
.ml-lg { margin-left: var(--spacing-lg); }
.ml-xl { margin-left: var(--spacing-xl); }

.mr-0 { margin-right: 0; }
.mr-xs { margin-right: var(--spacing-xs); }
.mr-sm { margin-right: var(--spacing-sm); }
.mr-md { margin-right: var(--spacing-md); }
.mr-lg { margin-right: var(--spacing-lg); }
.mr-xl { margin-right: var(--spacing-xl); }

/* Margin Auto */
.mx-auto { margin-left: auto; margin-right: auto; }
.my-auto { margin-top: auto; margin-bottom: auto; }

/* Padding Utilities */
.p-0 { padding: 0; }
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }
.p-2xl { padding: var(--spacing-2xl); }
.p-3xl { padding: var(--spacing-3xl); }

/* Padding Directional */
.pt-0 { padding-top: 0; }
.pt-xs { padding-top: var(--spacing-xs); }
.pt-sm { padding-top: var(--spacing-sm); }
.pt-md { padding-top: var(--spacing-md); }
.pt-lg { padding-top: var(--spacing-lg); }
.pt-xl { padding-top: var(--spacing-xl); }

.pb-0 { padding-bottom: 0; }
.pb-xs { padding-bottom: var(--spacing-xs); }
.pb-sm { padding-bottom: var(--spacing-sm); }
.pb-md { padding-bottom: var(--spacing-md); }
.pb-lg { padding-bottom: var(--spacing-lg); }
.pb-xl { padding-bottom: var(--spacing-xl); }

.pl-0 { padding-left: 0; }
.pl-xs { padding-left: var(--spacing-xs); }
.pl-sm { padding-left: var(--spacing-sm); }
.pl-md { padding-left: var(--spacing-md); }
.pl-lg { padding-left: var(--spacing-lg); }
.pl-xl { padding-left: var(--spacing-xl); }

.pr-0 { padding-right: 0; }
.pr-xs { padding-right: var(--spacing-xs); }
.pr-sm { padding-right: var(--spacing-sm); }
.pr-md { padding-right: var(--spacing-md); }
.pr-lg { padding-right: var(--spacing-lg); }
.pr-xl { padding-right: var(--spacing-xl); }
```

### **Layout Components**
```css
/* Card Layout System */
.card-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-layout-horizontal {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
  align-items: center;
}

.card-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

/* Sidebar Layout */
.sidebar-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex: 1;
  padding: var(--spacing-lg);
}

/* Split Layout */
.split-layout {
  display: flex;
  min-height: 100vh;
}

.split-left {
  flex: 1;
  border-right: 1px solid var(--color-border-primary);
}

.split-right {
  flex: 1;
}

/* Stack Layout */
.stack-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stack-layout-compact {
  gap: var(--spacing-sm);
}

.stack-layout-spacious {
  gap: var(--spacing-lg);
}

/* Inline Layout */
.inline-layout {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.inline-layout-compact {
  gap: var(--spacing-xs);
}

.inline-layout-spacious {
  gap: var(--spacing-md);
}
```

### **Responsive Breakpoints & Utilities**
```css
/* Responsive Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;

/* Responsive Utilities */
.hidden-sm { display: none; }
.hidden-md { display: none; }
.hidden-lg { display: none; }
.hidden-xl { display: none; }

.visible-sm { display: block; }
.visible-md { display: block; }
.visible-lg { display: block; }
.visible-xl { display: block; }

/* Responsive Text Sizes */
.text-sm-sm { font-size: 0.875rem; }
.text-sm-md { font-size: 1rem; }
.text-sm-lg { font-size: 1.125rem; }

.text-md-sm { font-size: 0.875rem; }
.text-md-md { font-size: 1rem; }
.text-md-lg { font-size: 1.125rem; }

.text-lg-sm { font-size: 0.875rem; }
.text-lg-md { font-size: 1rem; }
.text-lg-lg { font-size: 1.125rem; }

/* Responsive Spacing */
.p-sm-sm { padding: var(--spacing-sm); }
.p-sm-md { padding: var(--spacing-md); }
.p-sm-lg { padding: var(--spacing-lg); }

.p-md-sm { padding: var(--spacing-sm); }
.p-md-md { padding: var(--spacing-md); }
.p-md-lg { padding: var(--spacing-lg); }

.p-lg-sm { padding: var(--spacing-sm); }
.p-lg-md { padding: var(--spacing-md); }
.p-lg-lg { padding: var(--spacing-lg); }
```

### **Advanced Layout Patterns**
```css
/* Masonry Layout */
.masonry-layout {
  columns: 3;
  column-gap: var(--spacing-md);
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: var(--spacing-md);
}

/* Sticky Layout */
.sticky-layout {
  position: sticky;
  top: 0;
  z-index: 10;
}

.sticky-sidebar {
  position: sticky;
  top: var(--spacing-lg);
  height: fit-content;
}

/* Overlay Layout */
.overlay-layout {
  position: relative;
}

.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* Centered Layout */
.centered-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.centered-content {
  text-align: center;
  max-width: 600px;
  padding: var(--spacing-xl);
}

/* Hero Layout */
.hero-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.hero-content {
  max-width: 800px;
}

/* Feature Layout */
.feature-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.feature-item {
  text-align: center;
  padding: var(--spacing-xl);
}
```

### **Layout Utilities & Helpers**
```css
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
.z-auto { z-index: auto; }

/* Overflow Utilities */
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-visible { overflow: visible; }
.overflow-scroll { overflow: scroll; }

.overflow-x-auto { overflow-x: auto; }
.overflow-y-auto { overflow-y: auto; }

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
```

### **Layout Best Practices**
```css
/* Container Queries (Future-Proof) */
@container (min-width: 400px) {
  .card-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Aspect Ratio Utilities */
.aspect-square {
  aspect-ratio: 1 / 1;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.aspect-photo {
  aspect-ratio: 4 / 3;
}

/* Safe Area Support */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

/* Print Layout */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
  
  .print-avoid-break {
    page-break-inside: avoid;
  }
}
```

## **6. ANIMATION & INTERACTION SYSTEM**

### **Micro-Interactions**
```css
/* Smooth Transitions */
.transition-modern {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Loading States */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Skeleton Loading */
.skeleton-modern {
  background: linear-gradient(90deg, 
    rgba(38, 38, 50, 0.5) 25%, 
    rgba(51, 51, 64, 0.5) 50%, 
    rgba(38, 38, 50, 0.5) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
```

### **Page Transitions**
```css
/* Smooth Page Transitions */
.page-transition {
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## **7. USER PROFILE-SPECIFIC DESIGNS**

### **Mechanics Dashboard**
```css
/* Job Management Cards */
.job-card-mechanic {
  background: linear-gradient(135deg, 
    rgba(26, 26, 36, 0.95) 0%, 
    rgba(38, 38, 50, 0.95) 100%);
  border-left: 4px solid #10b981;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.job-card-mechanic:hover {
  transform: translateX(8px);
  border-left-color: #34d399;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
}

/* Status Indicators */
.status-urgent {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}
```

### **Office Staff Dashboard**
```css
/* Administrative Cards */
.admin-card {
  background: linear-gradient(135deg, 
    rgba(26, 26, 36, 0.9) 0%, 
    rgba(38, 38, 50, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.admin-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
}

/* Data Tables */
.table-modern {
  background: rgba(26, 26, 36, 0.8);
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.table-modern th {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
  padding: 1rem;
}
```

### **Vehicle Owner Portal**
```css
/* Service Tracking Cards */
.service-card {
  background: linear-gradient(135deg, 
    rgba(26, 26, 36, 0.9) 0%, 
    rgba(38, 38, 50, 0.9) 100%);
  border: 1px solid rgba(245, 158, 11, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.1);
}

/* Progress Indicators */
.progress-bar {
  background: rgba(38, 38, 50, 0.5);
  border-radius: 0.5rem;
  height: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
  height: 100%;
  transition: width 0.5s ease;
}
```

## **8. IMPLEMENTATION PRIORITY**

### **Phase 1: Core Design System (Week 1-2)**
1. Update global CSS variables and color system
2. Enhance typography and spacing
3. Implement new button and card components
4. Update navigation and sidebar styling

### **Phase 2: Component Enhancement (Week 3-4)**
1. Redesign dashboard cards and layouts
2. Enhance form components and inputs
3. Implement new table designs
4. Add micro-interactions and animations

### **Phase 3: User Profile Optimization (Week 5-6)**
1. Customize mechanics dashboard
2. Enhance office staff interface
3. Optimize vehicle owner portal
4. Add profile-specific animations

### **Phase 4: Polish & Testing (Week 7-8)**
1. Performance optimization
2. Accessibility improvements
3. Cross-browser testing
4. User feedback integration

## **9. TECHNICAL SPECIFICATIONS**

### **CSS Architecture**
- CSS Custom Properties for theming
- Tailwind CSS with custom extensions
- CSS Grid and Flexbox for layouts
- CSS-in-JS for dynamic styling

### **Performance Considerations**
- CSS containment for better rendering
- Optimized animations with `will-change`
- Lazy loading for non-critical styles
- Critical CSS inlining

### **Accessibility Features**
- High contrast ratios (WCAG AA compliant)
- Focus indicators and keyboard navigation
- Screen reader support
- Reduced motion preferences

## **10. COMPONENT LIBRARY**

### **Core Components to Update**
- [ ] Button system (primary, secondary, accent, danger)
- [ ] Card components (basic, elevated, glass, stats)
- [ ] Navigation (sidebar, header, breadcrumbs)
- [ ] Form elements (inputs, selects, textareas)
- [ ] Data tables (basic, enhanced, responsive)
- [ ] Modal system (overlay, content, animations)
- [ ] Status indicators (badges, dots, progress bars)
- [ ] Loading states (skeletons, spinners, overlays)

### **New Components to Create**
- [ ] Dashboard widgets (stats, charts, quick actions)
- [ ] Enhanced navigation menus (mega menu, context menu)
- [ ] Advanced form layouts (multi-step, wizard)
- [ ] Data visualization (charts, graphs, metrics)
- [ ] Notification system (toasts, alerts, banners)
- [ ] File upload components (drag & drop, progress)
- [ ] Search components (autocomplete, filters, results)

## **11. DESIGN TOKENS**

### **Color Tokens**
```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
--color-primary-950: #172554;

/* Neutral Colors */
--color-neutral-50: #f8fafc;
--color-neutral-100: #f1f5f9;
--color-neutral-200: #e2e8f0;
--color-neutral-300: #cbd5e1;
--color-neutral-400: #94a3b8;
--color-neutral-500: #64748b;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1e293b;
--color-neutral-900: #0f172a;
--color-neutral-950: #020617;
```

### **Spacing Tokens**
```css
/* Base Spacing */
--spacing-0: 0;
--spacing-px: 1px;
--spacing-0.5: 0.125rem;  /* 2px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-1.5: 0.375rem;  /* 6px */
--spacing-2: 0.5rem;      /* 8px */
--spacing-2.5: 0.625rem;  /* 10px */
--spacing-3: 0.75rem;     /* 12px */
--spacing-3.5: 0.875rem;  /* 14px */
--spacing-4: 1rem;        /* 16px */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-7: 1.75rem;     /* 28px */
--spacing-8: 2rem;        /* 32px */
--spacing-9: 2.25rem;     /* 36px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-11: 2.75rem;    /* 44px */
--spacing-12: 3rem;       /* 48px */
--spacing-14: 3.5rem;     /* 56px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
--spacing-28: 7rem;       /* 112px */
--spacing-32: 8rem;       /* 128px */
--spacing-36: 9rem;       /* 144px */
--spacing-40: 10rem;      /* 160px */
--spacing-44: 11rem;      /* 176px */
--spacing-48: 12rem;      /* 192px */
--spacing-52: 13rem;      /* 208px */
--spacing-56: 14rem;      /* 224px */
--spacing-60: 15rem;      /* 240px */
--spacing-64: 16rem;      /* 256px */
--spacing-72: 18rem;      /* 288px */
--spacing-80: 20rem;      /* 320px */
--spacing-96: 24rem;      /* 384px */
```

### **Shadow Tokens**
```css
/* Shadow System */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-none: 0 0 #0000;
```

## **12. RESPONSIVE DESIGN STRATEGY**

### **Mobile First Approach**
```css
/* Base styles (mobile) */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Small screens and up */
@media (min-width: 640px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Medium screens and up */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}

/* Large screens and up */
@media (min-width: 1024px) {
  .component {
    padding: 2.5rem;
    font-size: 1.25rem;
  }
}
```

### **Breakpoint Strategy**
- **Mobile**: 320px - 639px (single column, stacked)
- **Tablet**: 640px - 1023px (two columns, side-by-side)
- **Desktop**: 1024px - 1279px (three columns, grid layout)
- **Large Desktop**: 1280px+ (four columns, expanded layout)

## **13. ACCESSIBILITY REQUIREMENTS**

### **WCAG 2.1 AA Compliance**
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus indicators for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility for all functionality
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Motion Preferences**: Respect `prefers-reduced-motion` setting

### **Accessibility Features**
- Skip navigation links
- Proper heading hierarchy
- Alt text for images
- Form labels and error messages
- Loading states and progress indicators

## **14. PERFORMANCE OPTIMIZATION**

### **CSS Performance**
- Critical CSS inlining
- CSS containment for better rendering
- Optimized animations with `will-change`
- Reduced paint and layout operations

### **Asset Optimization**
- SVG icons for scalability
- Optimized images and graphics
- Lazy loading for non-critical resources
- Efficient font loading strategies

## **15. TESTING STRATEGY**

### **Cross-Browser Testing**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### **Device Testing**
- iOS Safari (iPhone, iPad)
- Android Chrome
- Desktop browsers
- Responsive design validation

### **Accessibility Testing**
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- Focus management testing

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Planning Phase  
**Next Review**: Implementation Start 
**Next Review**: Implementation Start 
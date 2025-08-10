import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { EnhancedForm } from '@/components/ui/EnhancedForm';
import { EnhancedTable } from '@/components/ui/EnhancedTable';
import { EnhancedModal } from '@/components/ui/EnhancedModal';
import { StatusIndicators } from '@/components/ui/StatusIndicators';
import { EnhancedLoadingStates } from '@/components/ui/EnhancedLoadingStates';

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadingToggle = () => {
    setLoading(!loading);
    setTimeout(() => setLoading(false), 3000);
  };

  const sampleData = [
    { id: 1, name: 'John Doe', status: 'active', role: 'Mechanic', email: 'john@garage.com' },
    { id: 2, name: 'Jane Smith', status: 'busy', role: 'Engineer', email: 'jane@garage.com' },
    { id: 3, name: 'Bob Johnson', status: 'offline', role: 'Manager', email: 'bob@garage.com' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="container-modern">
        <h1 className="text-h1 text-text-primary mb-8">🎨 Component Showcase - Section 4</h1>
        
        {/* Enhanced Cards Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Cards</h2>
          <div className="dashboard-grid">
            <Card variant="default" elevated>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard elevated card with hover effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">This card demonstrates the modern card system with glassmorphism effects.</p>
              </CardContent>
            </Card>

            <Card variant="stats">
              <CardHeader>
                <CardTitle>Stats Card</CardTitle>
                <CardDescription>Success-themed statistics card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">2,847</div>
                <p className="text-text-secondary">Total Jobs Completed</p>
              </CardContent>
            </Card>

            <Card variant="warning">
              <CardHeader>
                <CardTitle>Warning Card</CardTitle>
                <CardDescription>Attention-required information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">5 pending approvals require your attention.</p>
              </CardContent>
            </Card>

            <Card variant="danger">
              <CardHeader>
                <CardTitle>Danger Card</CardTitle>
                <CardDescription>Critical system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">System maintenance required immediately.</p>
              </CardContent>
            </Card>

            <Card variant="info">
              <CardHeader>
                <CardTitle>Info Card</CardTitle>
                <CardDescription>Informational content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">New features available in the latest update.</p>
              </CardContent>
            </Card>

            <Card variant="default" glass>
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Transparent glass effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">Backdrop blur and transparency effects.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Buttons Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button loading={loading} onClick={handleLoadingToggle}>
              {loading ? 'Loading...' : 'Toggle Loading'}
            </Button>
          </div>
        </section>

        {/* Enhanced Form Elements Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text-secondary mb-2">Modern Input</label>
              <input 
                type="text" 
                placeholder="Enter text here..." 
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2">Modern Select</label>
              <select className="select-modern w-full">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-secondary mb-2">Modern Textarea</label>
              <textarea 
                placeholder="Enter description here..." 
                className="textarea-modern w-full"
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Enhanced Tables Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Tables</h2>
          <div className="table-modern">
            <table className="w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>
                      <span className={`status-dot status-dot-${row.status === 'active' ? 'online' : row.status === 'busy' ? 'busy' : 'offline'}`}></span>
                      {row.status}
                    </td>
                    <td>{row.role}</td>
                    <td>{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Enhanced Status Indicators Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Status Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="badge badge-success mb-2">Success</div>
              <div className="text-text-secondary text-sm">Success status</div>
            </div>
            <div className="text-center">
              <div className="badge badge-warning mb-2">Warning</div>
              <div className="text-text-secondary text-sm">Warning status</div>
            </div>
            <div className="text-center">
              <div className="badge badge-danger mb-2">Danger</div>
              <div className="text-text-secondary text-sm">Error status</div>
            </div>
            <div className="text-center">
              <div className="badge badge-info mb-2">Info</div>
              <div className="text-text-secondary text-sm">Information</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-h4 text-text-primary mb-4">Status Dots</h3>
            <div className="flex gap-6">
              <div className="flex items-center">
                <span className="status-dot status-dot-online"></span>
                <span className="text-text-secondary">Online</span>
              </div>
              <div className="flex items-center">
                <span className="status-dot status-dot-busy"></span>
                <span className="text-text-secondary">Busy</span>
              </div>
              <div className="flex items-center">
                <span className="status-dot status-dot-offline"></span>
                <span className="text-text-secondary">Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Loading States Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-h4 text-text-primary mb-4">Skeleton Loading</h3>
              <div className="skeleton-card">
                <div className="skeleton skeleton-avatar mb-4"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h4 text-text-primary mb-4">Spinner</h3>
              <div className="flex justify-center">
                <div className="spinner"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h4 text-text-primary mb-4">Progress Bar</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '65%' }}></div>
              </div>
              <p className="text-text-secondary text-sm mt-2">65% Complete</p>
            </div>
          </div>
        </section>

        {/* Enhanced Modal Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Enhanced Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          
          {isModalOpen && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Enhanced Modal</h3>
                  <button 
                    className="modal-close"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-text-secondary">
                    This modal demonstrates the enhanced modal system with backdrop blur, 
                    smooth animations, and professional styling.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Grid System Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Grid System</h2>
          <div className="grid-modern">
            <div className="bg-surface-secondary p-6 rounded-lg">Grid Item 1</div>
            <div className="bg-surface-secondary p-6 rounded-lg">Grid Item 2</div>
            <div className="bg-surface-secondary p-6 rounded-lg">Grid Item 3</div>
            <div className="bg-surface-secondary p-6 rounded-lg">Grid Item 4</div>
          </div>
        </section>

        {/* Responsive Design Section */}
        <section className="mb-12">
          <h2 className="text-h2 text-text-primary mb-6">Responsive Design</h2>
          <div className="bg-surface-secondary p-6 rounded-lg">
            <p className="text-text-secondary">
              This page demonstrates responsive design with the enhanced design system. 
              Try resizing your browser window to see the responsive behavior.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-surface-tertiary p-4 rounded">Mobile: 1 column</div>
              <div className="bg-surface-tertiary p-4 rounded">Tablet: 2 columns</div>
              <div className="bg-surface-tertiary p-4 rounded">Desktop: 3 columns</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 
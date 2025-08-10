import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  AdvancedGrid,
  LayoutSplit,
  ThreeColumnLayout,
  SidebarLayout,
  StackLayout,
  HorizontalLayout,
  CenterLayout,
  BetweenLayout,
  Container,
  ResponsiveGrid,
  CardGrid,
  Section,
  Divider,
  Spacer,
  AspectRatio,
  StickyContainer,
  ScrollContainer,
  OverlayContainer,
  FloatingContainer
} from '@/components/ui/LayoutComponents';

export default function LayoutShowcase() {
  const [activeTab, setActiveTab] = useState('grids');
  const [showFloating, setShowFloating] = useState(false);

  const tabs = [
    { id: 'grids', label: 'Grid Systems', icon: '🔲' },
    { id: 'layouts', label: 'Layout Components', icon: '📐' },
    { id: 'spacing', label: 'Spacing Utilities', icon: '📏' },
    { id: 'containers', label: 'Containers', icon: '📦' },
    { id: 'responsive', label: 'Responsive Design', icon: '📱' },
    { id: 'advanced', label: 'Advanced Features', icon: '⚡' }
  ];

  const sampleCards = [
    { title: 'Card 1', content: 'This is a sample card content', variant: 'default' },
    { title: 'Card 2', content: 'Another sample card with different content', variant: 'stats' },
    { title: 'Card 3', content: 'Third card in the grid layout', variant: 'warning' },
    { title: 'Card 4', content: 'Fourth card demonstrating spacing', variant: 'info' },
    { title: 'Card 5', content: 'Fifth card showing grid behavior', variant: 'danger' },
    { title: 'Card 6', content: 'Sixth card completing the grid', variant: 'default' }
  ];

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <Container variant="advanced">
        <div className="text-center mb-12">
          <h1 className="text-h1 text-text-primary mb-4">🎨 Section 5: Layout & Spacing System</h1>
          <p className="text-text-secondary text-lg max-w-3xl mx-auto">
            Advanced layout components, grid systems, and spacing utilities for professional automotive interfaces.
            Built with CSS Grid, Flexbox, and responsive design principles.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Grid Systems */}
        {activeTab === 'grids' && (
          <StackLayout spacing="xl">
            <Section
              title="Advanced Grid Systems"
              subtitle="Professional grid layouts with auto-fit columns and responsive behavior"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Default Grid</h3>
                  <AdvancedGrid variant="default">
                    {sampleCards.slice(0, 4).map((card, index) => (
                      <Card key={index} variant={card.variant}>
                        <CardHeader>
                          <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">{card.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </AdvancedGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Compact Grid</h3>
                  <AdvancedGrid variant="compact">
                    {sampleCards.slice(0, 6).map((card, index) => (
                      <Card key={index} variant={card.variant}>
                        <CardHeader>
                          <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">{card.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </AdvancedGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Spacious Grid</h3>
                  <AdvancedGrid variant="spacious">
                    {sampleCards.slice(0, 3).map((card, index) => (
                      <Card key={index} variant={card.variant}>
                        <CardHeader>
                          <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">{card.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </AdvancedGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Masonry Grid</h3>
                  <AdvancedGrid variant="masonry">
                    {sampleCards.map((card, index) => (
                      <Card key={index} variant={card.variant} className="h-auto">
                        <CardHeader>
                          <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">{card.content}</p>
                          {index % 2 === 0 && (
                            <div className="mt-4 p-3 bg-surface-secondary rounded-lg">
                              <p className="text-sm text-text-tertiary">Additional content for taller cards</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </AdvancedGrid>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Layout Components */}
        {activeTab === 'layouts' && (
          <StackLayout spacing="xl">
            <Section
              title="Layout Components"
              subtitle="Professional layout patterns for different interface needs"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Split Layout</h3>
                  <LayoutSplit>
                    <Card>
                      <CardHeader>
                        <CardTitle>Left Panel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">This is the left side of a split layout.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Right Panel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">This is the right side of a split layout.</p>
                      </CardContent>
                    </Card>
                  </LayoutSplit>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Three Column Layout</h3>
                  <ThreeColumnLayout
                    left={
                      <Card>
                        <CardHeader>
                          <CardTitle>Sidebar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Navigation and controls</p>
                        </CardContent>
                      </Card>
                    }
                    main={
                      <Card>
                        <CardHeader>
                          <CardTitle>Main Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Primary content area with full width</p>
                        </CardContent>
                      </Card>
                    }
                    right={
                      <Card>
                        <CardHeader>
                          <CardTitle>Sidebar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Additional information and actions</p>
                        </CardContent>
                      </Card>
                    }
                  />
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Sidebar Layout</h3>
                  <SidebarLayout
                    sidebar={
                      <Card>
                        <CardHeader>
                          <CardTitle>Navigation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StackLayout spacing="sm">
                            <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                            <Button variant="ghost" className="w-full justify-start">Jobs</Button>
                            <Button variant="ghost" className="w-full justify-start">Vehicles</Button>
                            <Button variant="ghost" className="w-full justify-start">Settings</Button>
                          </StackLayout>
                        </CardContent>
                      </Card>
                    }
                    main={
                      <Card>
                        <CardHeader>
                          <CardTitle>Main Content Area</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">This is the main content area that takes up the remaining space.</p>
                        </CardContent>
                      </Card>
                    }
                  />
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Stack Layout</h3>
                  <StackLayout spacing="lg">
                    <Card>
                      <CardHeader>
                        <CardTitle>First Item</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">This item has consistent spacing below it.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Second Item</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">This item also has consistent spacing.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Third Item</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">The spacing is automatically applied between all items.</p>
                      </CardContent>
                    </Card>
                  </StackLayout>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Horizontal Layout</h3>
                  <HorizontalLayout spacing="lg" align="center">
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle>Left Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">This card is aligned horizontally.</p>
                      </CardContent>
                    </Card>
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle>Center Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">All cards are evenly spaced.</p>
                      </CardContent>
                    </Card>
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle>Right Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary">Perfect for action buttons or status displays.</p>
                      </CardContent>
                    </Card>
                  </HorizontalLayout>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Spacing Utilities */}
        {activeTab === 'spacing' && (
          <StackLayout spacing="xl">
            <Section
              title="Spacing Utilities"
              subtitle="Comprehensive spacing system using CSS custom properties"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Margin System</h3>
                  <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="md">
                    <Card className="m-0">
                      <CardContent className="p-4">
                        <p className="text-text-secondary">No margin (m-0)</p>
                      </CardContent>
                    </Card>
                    <Card className="m-1">
                      <CardContent className="p-4">
                        <p className="text-text-secondary">Small margin (m-1)</p>
                      </CardContent>
                    </Card>
                    <Card className="m-2">
                      <CardContent className="p-4">
                        <p className="text-text-secondary">Medium margin (m-2)</p>
                      </CardContent>
                    </Card>
                    <Card className="m-3">
                      <CardContent className="p-4">
                        <p className="text-text-secondary">Large margin (m-3)</p>
                      </CardContent>
                    </Card>
                  </ResponsiveGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Padding System</h3>
                  <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="md">
                    <Card>
                      <CardContent className="p-0">
                        <p className="text-text-secondary">No padding (p-0)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-1">
                        <p className="text-text-secondary">Small padding (p-1)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-2">
                        <p className="text-text-secondary">Medium padding (p-2)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-text-secondary">Large padding (p-3)</p>
                      </CardContent>
                    </Card>
                  </ResponsiveGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Gap System</h3>
                  <ResponsiveGrid cols={{ default: 2, md: 3 }} gap="xs">
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">Extra small gap</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">Extra small gap</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">Extra small gap</p>
                      </CardContent>
                    </Card>
                  </ResponsiveGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Space Utilities</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">This card uses space-y-4 for consistent vertical spacing.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">The space-y-4 class automatically adds margin-top to all children except the first.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <p className="text-text-secondary">Perfect for lists, forms, and content sections.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Containers */}
        {activeTab === 'containers' && (
          <StackLayout spacing="xl">
            <Section
              title="Container System"
              subtitle="Flexible container components for different content widths"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Container Variants</h3>
                  <StackLayout spacing="md">
                    <Container variant="narrow">
                      <Card>
                        <CardHeader>
                          <CardTitle>Narrow Container</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Maximum width: 800px. Perfect for focused content like forms and articles.</p>
                        </CardContent>
                      </Card>
                    </Container>

                    <Container variant="default">
                      <Card>
                        <CardHeader>
                          <CardTitle>Default Container</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Standard container with responsive padding and max-width constraints.</p>
                        </CardContent>
                      </Card>
                    </Container>

                    <Container variant="wide">
                      <Card>
                        <CardHeader>
                          <CardTitle>Wide Container</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Maximum width: 1600px. Ideal for dashboards and data-heavy interfaces.</p>
                        </CardContent>
                      </Card>
                    </Container>

                    <Container variant="fluid">
                      <Card>
                        <CardHeader>
                          <CardTitle>Fluid Container</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Full width with responsive padding. Great for hero sections and full-width layouts.</p>
                        </CardContent>
                      </Card>
                    </Container>
                  </StackLayout>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Container Nesting</h3>
                  <Container variant="wide">
                    <Card>
                      <CardHeader>
                        <CardTitle>Wide Container</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-secondary mb-4">This wide container contains a nested narrow container:</p>
                        <Container variant="narrow">
                          <Card variant="stats">
                            <CardContent>
                              <p className="text-text-secondary">Nested narrow container with different styling.</p>
                            </CardContent>
                          </Card>
                        </Container>
                      </CardContent>
                    </Card>
                  </Container>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Responsive Design */}
        {activeTab === 'responsive' && (
          <StackLayout spacing="xl">
            <Section
              title="Responsive Design"
              subtitle="Mobile-first responsive layouts with breakpoint-specific behavior"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Responsive Grid</h3>
                  <ResponsiveGrid 
                    cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
                    gap="md"
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <Card key={i} variant={i % 2 === 0 ? 'default' : 'stats'}>
                        <CardContent className="p-4">
                          <p className="text-text-secondary">Grid Item {i + 1}</p>
                          <p className="text-sm text-text-tertiary">
                            Responsive: 1 → 2 → 3 → 4 → 6 columns
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </ResponsiveGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Responsive Layout</h3>
                  <div className="layout-sidebar-main md:layout-three-column">
                    <div className="sidebar">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sidebar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">This becomes a left column on larger screens.</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="main-content">
                      <Card>
                        <CardHeader>
                          <CardTitle>Main Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">Main content area that adapts to available space.</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="right-column hidden md:block">
                      <Card>
                        <CardHeader>
                          <CardTitle>Right Panel</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">This panel only appears on medium screens and larger.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Breakpoint Testing</h3>
                  <Card>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="p-3 bg-surface-secondary rounded-lg text-center">
                          <p className="text-sm font-medium text-text-primary">Mobile</p>
                          <p className="text-xs text-text-secondary">1 column</p>
                        </div>
                        <div className="p-3 bg-surface-secondary rounded-lg text-center">
                          <p className="text-sm font-medium text-text-primary">Small</p>
                          <p className="text-xs text-text-secondary">2 columns</p>
                        </div>
                        <div className="p-3 bg-surface-secondary rounded-lg text-center">
                          <p className="text-sm font-medium text-text-primary">Medium</p>
                          <p className="text-xs text-text-secondary">3 columns</p>
                        </div>
                        <div className="p-3 bg-surface-secondary rounded-lg text-center">
                          <p className="text-sm font-medium text-text-primary">Large</p>
                          <p className="text-xs text-text-secondary">4 columns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Advanced Features */}
        {activeTab === 'advanced' && (
          <StackLayout spacing="xl">
            <Section
              title="Advanced Features"
              subtitle="Specialized layout components for complex interface requirements"
            >
              <StackLayout spacing="lg">
                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Aspect Ratio Container</h3>
                  <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
                    <AspectRatio ratio="16/9">
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <p className="text-white font-medium">16:9 Aspect Ratio</p>
                      </div>
                    </AspectRatio>
                    <AspectRatio ratio="4/3">
                      <div className="w-full h-full bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center">
                        <p className="text-white font-medium">4:3 Aspect Ratio</p>
                      </div>
                    </AspectRatio>
                  </ResponsiveGrid>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Sticky Container</h3>
                  <div className="relative h-96 bg-surface-secondary rounded-lg p-4">
                    <div className="h-64 overflow-y-auto">
                      <div className="space-y-4">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Card key={i} className="p-3">
                            <p className="text-text-secondary">Scrollable content item {i + 1}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <StickyContainer top="1rem" className="absolute top-4 right-4">
                      <Card className="w-48">
                        <CardContent className="p-3">
                          <p className="text-sm text-text-secondary">This card stays visible while scrolling</p>
                        </CardContent>
                      </Card>
                    </StickyContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Scroll Container</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-h4 text-text-primary mb-3">Vertical Scroll</h4>
                      <ScrollContainer direction="vertical" className="h-48 border border-border-primary rounded-lg p-4">
                        {Array.from({ length: 15 }, (_, i) => (
                          <div key={i} className="p-2 border-b border-border-primary/20">
                            <p className="text-text-secondary">Scrollable item {i + 1}</p>
                          </div>
                        ))}
                      </ScrollContainer>
                    </div>
                    <div>
                      <h4 className="text-h4 text-text-primary mb-3">Horizontal Scroll</h4>
                      <ScrollContainer direction="horizontal" className="h-48 border border-border-primary rounded-lg p-4">
                        <div className="flex gap-4 min-w-max">
                          {Array.from({ length: 8 }, (_, i) => (
                            <Card key={i} className="w-48 flex-shrink-0">
                              <CardContent className="p-3">
                                <p className="text-text-secondary">Wide card {i + 1}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollContainer>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-h3 text-text-primary mb-4">Overlay & Floating</h3>
                  <div className="relative h-64 bg-surface-secondary rounded-lg p-4">
                    <p className="text-text-secondary mb-4">This container has relative positioning for overlay testing</p>
                    
                    <OverlayContainer className="bg-black/20 rounded-lg flex items-center justify-center">
                      <Card className="w-64">
                        <CardHeader>
                          <CardTitle>Overlay Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-text-secondary">This card overlays the background content</p>
                        </CardContent>
                      </Card>
                    </OverlayContainer>

                    <Button 
                      onClick={() => setShowFloating(!showFloating)}
                      className="absolute bottom-4 left-4"
                    >
                      Toggle Floating
                    </Button>

                    {showFloating && (
                      <FloatingContainer position="bottom-left">
                        <Card className="w-64">
                          <CardHeader>
                            <CardTitle>Floating Card</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-text-secondary">This card floats above all content</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowFloating(false)}
                              className="mt-2"
                            >
                              Close
                            </Button>
                          </CardContent>
                        </Card>
                      </FloatingContainer>
                    )}
                  </div>
                </div>
              </StackLayout>
            </Section>
          </StackLayout>
        )}

        {/* Footer */}
        <Divider />
        <div className="text-center py-8">
          <p className="text-text-secondary">
            Section 5 Layout & Spacing System - Professional automotive interface design
          </p>
        </div>
      </Container>
    </div>
  );
} 
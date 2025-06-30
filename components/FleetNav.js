import React from 'react';

export function FleetNav() {
  const links = [
    { href: '#jobs', label: 'Jobs' },
    { href: '#quotes', label: 'Quotes' },
    { href: '#invoices', label: 'Invoices' },
    { href: '#vehicles', label: 'Vehicles' },
  ];
  return (
    <nav className="fleet-nav">
      {links.map(link => (
        <a key={link.href} href={link.href} className="fleet-nav-link">
          {link.label}
        </a>
      ))}
    </nav>
  );
}

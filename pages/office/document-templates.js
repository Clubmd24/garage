import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../components/OfficeLayout';

function TemplateBox({ title, company }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title} Template</h2>
      <div className="border rounded p-4 bg-white text-black space-y-2">
        {company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16" />
        )}
        {company.company_name && (
          <p className="font-bold">{company.company_name}</p>
        )}
        {company.address && <p className="text-sm">{company.address}</p>}
        <p className="text-sm italic mt-4">
          This preview uses your company settings.
        </p>
      </div>
    </div>
  );
}

export default function DocumentTemplatesPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/company-settings')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setSettings(data || {}))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <OfficeLayout>
      <p>Loading…</p>
    </OfficeLayout>
  );

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Document Templates</h1>
      <TemplateBox title="Invoice" company={settings} />
      <TemplateBox title="Quotation" company={settings} />
      <TemplateBox title="Job Card" company={settings} />
      <TemplateBox title="Purchase Order" company={settings} />
    </OfficeLayout>
  );
}

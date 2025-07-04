import React from 'react';

const mockDashboards = [
  { id: 1, name: 'Vendas 2024', updated: 'há 2 dias' },
  { id: 2, name: 'Marketing Digital', updated: 'há 1 semana' },
  { id: 3, name: 'Financeiro', updated: 'há 3 semanas' },
];

export default function MyDashboards() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meus Dashboards</h2>
        <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">+ Novo Dashboard</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDashboards.map(d => (
          <div key={d.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">{d.name}</h3>
            <p className="text-sm text-muted-foreground">Atualizado {d.updated}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 
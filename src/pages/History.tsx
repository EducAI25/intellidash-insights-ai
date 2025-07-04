import React from 'react';

const mockHistory = [
  { id: 1, action: 'Upload de planilha', date: '2024-07-01 10:23' },
  { id: 2, action: 'Criou dashboard "Vendas 2024"', date: '2024-06-28 15:10' },
  { id: 3, action: 'Compartilhou dashboard', date: '2024-06-25 09:45' },
];

export default function History() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Histórico de Atividades</h2>
      <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
        <thead>
          <tr className="bg-muted">
            <th className="py-3 px-4 text-left">Ação</th>
            <th className="py-3 px-4 text-left">Data</th>
          </tr>
        </thead>
        <tbody>
          {mockHistory.map(item => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="py-2 px-4">{item.action}</td>
              <td className="py-2 px-4 text-muted-foreground">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
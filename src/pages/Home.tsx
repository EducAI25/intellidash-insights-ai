import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Mirtilo Insights!</h1>
      <p className="text-lg text-muted-foreground mb-8">Transforme dados em decisões inteligentes. Explore seus dashboards e descubra insights incríveis.</p>
      <a href="/dashboard/boards" className="inline-block px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition">Explorar Dashboards</a>
    </div>
  );
} 
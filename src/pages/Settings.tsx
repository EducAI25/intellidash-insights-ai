import React, { useState } from 'react';

export default function Settings() {
  const [name, setName] = useState('Usuário Mirtilo');
  const [email, setEmail] = useState('usuario@mirtilo.com');

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Configurações da Conta</h2>
      <form className="space-y-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block mb-1 font-medium">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">Salvar Alterações</button>
      </form>
    </div>
  );
} 
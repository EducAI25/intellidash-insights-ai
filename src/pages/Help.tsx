import React from 'react';

export default function Help() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajuda & Suporte</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Perguntas Frequentes</h3>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Como faço upload de uma planilha?</li>
          <li>Como crio um novo dashboard?</li>
          <li>Como compartilho meus dashboards?</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Precisa de mais ajuda?</h3>
        <p className="mb-2">Entre em contato pelo e-mail <a href="mailto:suporte@mirtilo.com" className="text-primary underline">suporte@mirtilo.com</a></p>
        <p>Ou acesse nosso <a href="#" className="text-primary underline">Centro de Suporte</a>.</p>
      </div>
    </div>
  );
} 
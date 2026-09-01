"use client";

import Image from "next/image";
import React, { useState } from "react";
import { generateResponse } from "./actions";

export default function Home() {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const objective = (e.target as any).objective.value;
    const tone = (e.target as any).tone.value;
    const inputText = (e.target as any).inputText.value;

    try {
      const response = await generateResponse({ objective, tone, inputText });
      setStatus("success");
      // Aqui poderia exibir a resposta ou redirecionar
    } catch (error: any) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main
        className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start"
      >
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="resposta-certa logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            respostas-certas
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Gere respostas IA para seus textos
          </p>
        </div>

        {status && (
          <div className="mt-8 p-6 rounded bg-green-100 text-green-800 animate-fade-in">
            <p>{status === "success" ? "Resposta gerada com sucesso!" : "Ocorreu um erro"}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 max-w-md w-full space-y-4 p-6 rounded bg-zinc-100 dark:bg-zinc-800"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Objetivo
            </label>
            <input
              type="text"
              name="objective"
              required
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Ex: fechamento de venda, agradecimento, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tom
            </label>
            <select
              name="tone"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="professional">Profissional</option>
              <option value="friendly">Amigável</option>
              <option value="urgent">Urgente</option>
              <option value="empathetic">Empático</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto de entrada
            </label>
            <textarea
              name="inputText"
              rows={3}
              required
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize transition-colors"
              placeholder="Digite o texto que deseja gerar uma resposta..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Gerando..." : "Gerar Resposta IA"}
          </button>
        </form>
      </main>
    </div>
  );
}
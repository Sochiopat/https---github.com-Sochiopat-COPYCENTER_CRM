"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOffices, createOffice } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [offices, setOffices] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getOffices();
    setOffices(data);
  }

  async function addOffice() {
    if (!name) return;
    await createOffice(name);
    setName("");
    load();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">CopyCenter CRM</h1>

      <div className="mb-6">
        <input className="border p-2 mr-2" value={name} onChange={e => setName(e.target.value)} placeholder="Название офиса" />
        <button className="bg-black text-white px-4 py-2" onClick={addOffice}>Добавить</button>
      </div>

      <ul className="space-y-2">
        {offices.map(o => (
          <li key={o.id} className="border p-3 cursor-pointer hover:bg-gray-100" onClick={() => router.push(`/office/${o.id}`)}>
            #{o.id} — {o.name}
          </li>
        ))}
      </ul>
    </main>
  );
}

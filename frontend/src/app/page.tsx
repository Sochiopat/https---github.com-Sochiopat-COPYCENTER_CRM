"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOffices, createOffice } from "@/lib/api";

interface Office {
  id: number;
  name: string;
  address?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Форма создания офиса
  const [showForm, setShowForm] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState("");
  const [newOfficeAddress, setNewOfficeAddress] = useState("");

  useEffect(() => {
    loadOffices();
  }, []);

  async function loadOffices() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOffices();
      setOffices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить список офисов");
    }
    setLoading(false);
  }

  async function handleCreateOffice(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newOfficeName.trim()) {
      alert("Введите название офиса");
      return;
    }

    try {
      await createOffice(newOfficeName, newOfficeAddress || undefined);
      setNewOfficeName("");
      setNewOfficeAddress("");
      setShowForm(false);
      loadOffices(); // Перезагружаем список
    } catch (e) {
      console.error(e);
      alert("Не удалось создать офис");
    }
  }

  function goToOffice(officeId: number) {
    router.push(`/office/${officeId}`);
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadOffices}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Список офисов</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showForm ? "Отмена" : "Создать офис"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateOffice} className="border p-4 mb-6 rounded">
          <h2 className="font-semibold mb-3">Новый офис</h2>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm">Название офиса*</label>
              <input
                type="text"
                value={newOfficeName}
                onChange={(e) => setNewOfficeName(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Например: Офис на Невском"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Адрес (необязательно)</label>
              <input
                type="text"
                value={newOfficeAddress}
                onChange={(e) => setNewOfficeAddress(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Например: Невский проспект, 123"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Создать
            </button>
          </div>
        </form>
      )}

      {offices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">Офисов пока нет</p>
          <p>Нажмите "Создать офис" чтобы добавить первый</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <div
              key={office.id}
              onClick={() => goToOffice(office.id)}
              className="border p-4 rounded hover:shadow-lg cursor-pointer transition-shadow"
            >
              <h3 className="font-bold text-lg mb-1">{office.name}</h3>
              {office.address && (
                <p className="text-sm text-gray-600 mb-2">{office.address}</p>
              )}
              <p className="text-xs text-gray-500">ID: {office.id}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
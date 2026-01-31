"use client";

import { useEffect, useState } from "react";
import { getTodayReport, addRevenue, getRevenue } from "@/lib/api";

interface Props {
  officeId: string;
}

export default function OfficeDayClient({ officeId }: Props) {
  const [report, setReport] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState<string | null>(null);

  const id = parseInt(officeId, 10);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Неверный ID офиса");
      return;
    }
    load();
  }, [id]);

  async function load() {
    try {
      const reportData = await getTodayReport(id);
      setReport(reportData);

      const revenue = await getRevenue(reportData.id);
      setEntries(Array.isArray(revenue) ? revenue : []);
    } catch (e) {
      setError("Ошибка загрузки данных");
      console.error(e);
    }
  }

  async function handleAdd() {
    if (!amount || !report) return;

    try {
      await addRevenue(report.id, parseFloat(amount), method);
      setAmount("");
      load();
    } catch (e) {
      console.error(e);
      setError("Ошибка добавления выручки");
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!report) return <div className="p-6">Загрузка…</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Офис #{report.office_id}</h1>
      <p className="mb-4">
        Отчёт за дату: <b>{report.date}</b>
      </p>

      <div className="border p-4 mb-6">
        <h2 className="font-semibold mb-2">Добавить выручку</h2>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="number"
            className="border p-2"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="border p-2"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="cash">Наличные</option>
            <option value="card">Безнал</option>
            <option value="other">Прочее</option>
          </select>

          <button
            className="bg-black text-white px-4 py-2"
            onClick={handleAdd}
          >
            Добавить
          </button>
        </div>

        <h3 className="font-semibold mt-4">Записи за день:</h3>
        <ul className="mt-2 space-y-1">
          {entries.length > 0 ? (
            entries.map((e) => (
              <li key={e.id}>
                {e.amount} — {e.payment_type}
              </li>
            ))
          ) : (
            <li className="text-gray-500">Пока нет записей</li>
          )}
        </ul>
      </div>
    </main>
  );
}

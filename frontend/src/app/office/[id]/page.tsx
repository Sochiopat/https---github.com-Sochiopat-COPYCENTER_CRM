"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getTodayReport, addRevenue, getRevenue } from "@/lib/api";

interface RevenueEntry {
  id: number;
  amount: number;
  payment_type: string;
}

export default function Page() {
  const params = useParams();
  const pathname = usePathname();
  
  // Попробуем разные способы получить ID
  const officeId = params?.id || params?.officeId || (params as any)?.['[id]'];
  
  console.log('=== ROUTING DEBUG ===');
  console.log('Full params object:', params);
  console.log('Pathname:', pathname);
  console.log('Extracted officeId:', officeId);
  console.log('All param keys:', params ? Object.keys(params) : 'params is null/undefined');
  
  const [report, setReport] = useState<any>(null);
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [totalCheck, setTotalCheck] = useState(0);
  const [totalDay, setTotalDay] = useState(0);
  const [readonly, setReadonly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!officeId) {
      console.error('officeId is falsy:', officeId);
      setError('ID офиса не найден в URL');
      setLoading(false);
      return;
    }
    loadReport();
  }, [officeId]);

  useEffect(() => {
    const cashNum = parseFloat(cash) || 0;
    const cardNum = parseFloat(card) || 0;
    const accountNum = parseFloat(toAccount) || 0;

    setTotalCheck(cashNum + cardNum);
    setTotalDay(cashNum + cardNum + accountNum);
  }, [cash, card, toAccount]);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading report for officeId:', officeId);
      const data = await getTodayReport(officeId as string);
      setReport(data);

      const revenue = await getRevenue(data.id);
      const entries: RevenueEntry[] = Array.isArray(revenue) ? revenue : [];

      let hasData = false;
      entries.forEach((entry) => {
        hasData = true;
        switch (entry.payment_type) {
          case "cash":
            setCash(String(entry.amount));
            break;
          case "card":
            setCard(String(entry.amount));
            break;
          case "other":
          case "account":
            setToAccount(String(entry.amount));
            break;
        }
      });

      if (hasData) {
        setReadonly(true);
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка загрузки отчета: " + (e as Error).message);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!report) return;
    const cashNum = parseFloat(cash) || 0;
    const cardNum = parseFloat(card) || 0;
    const accountNum = parseFloat(toAccount) || 0;

    try {
      if (cashNum > 0) {
        await addRevenue(report.id, cashNum, "cash");
      }
      if (cardNum > 0) {
        await addRevenue(report.id, cardNum, "card");
      }
      if (accountNum > 0) {
        await addRevenue(report.id, accountNum, "other");
      }

      setReadonly(true);
    } catch (e) {
      console.error(e);
      setError("Не удалось добавить выручку");
    }
  }

  const handleEdit = (type: "cash" | "card" | "account") => {
    setReadonly(false);
    if (type === "cash") setCash("");
    if (type === "card") setCard("");
    if (type === "account") setToAccount("");
  };

  // Показываем debug информацию если ID не найден
  if (!officeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">ID офиса не найден в URL</h1>
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">Debug информация:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              pathname,
              params,
              paramKeys: params ? Object.keys(params) : null,
            }, null, 2)}
          </pre>
        </div>
        <div className="space-y-2">
          <p><strong>Текущий URL:</strong> {pathname}</p>
          <p><strong>Ожидаемый формат:</strong> /office/123</p>
          <p><strong>Структура папок должна быть:</strong></p>
          <pre className="bg-gray-200 p-2 text-sm">
src/app/office/[id]/page.tsx
          </pre>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Загрузка…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!report) return <div className="p-6">Отчет не найден</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Офис #{report.office_id}</h1>
      <p className="mb-4">
        Отчет за дату: <b>{report.date}</b>
      </p>

      <div className="border p-4 space-y-4">
        <h2 className="font-semibold">Выручка за день</h2>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="w-48">Наличные:</label>
            <input
              type="number"
              className="border p-1 flex-1"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              readOnly={readonly}
            />
            {readonly && (
              <button
                className="text-blue-600 underline"
                onClick={() => handleEdit("cash")}
              >
                Изменить
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="w-48">Платежи картой:</label>
            <input
              type="number"
              className="border p-1 flex-1"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              readOnly={readonly}
            />
            {readonly && (
              <button
                className="text-blue-600 underline"
                onClick={() => handleEdit("card")}
              >
                Изменить
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="w-48">ИТОГО выручка по чеку:</label>
            <input
              type="number"
              className="border p-1 flex-1 bg-gray-100"
              value={totalCheck}
              readOnly
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="w-48">Платежи на счет:</label>
            <input
              type="number"
              className="border p-1 flex-1"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              readOnly={readonly}
            />
            {readonly && (
              <button
                className="text-blue-600 underline"
                onClick={() => handleEdit("account")}
              >
                Изменить
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="w-48">ВСЕГО выручка за день:</label>
            <input
              type="number"
              className="border p-1 flex-1 bg-gray-100"
              value={totalDay}
              readOnly
            />
          </div>

          <button
            className={`bg-black text-white px-4 py-2 ${
              readonly ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={readonly}
          >
            {readonly ? "Выручка внесена" : "Внести в отчет"}
          </button>
        </div>
      </div>
    </main>
  );
}
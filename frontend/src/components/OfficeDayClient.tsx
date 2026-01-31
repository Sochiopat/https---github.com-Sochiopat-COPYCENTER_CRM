"use client";

import { useEffect, useState } from "react";
import { getTodayReport, addRevenue, getRevenue } from "@/lib/api";

interface Props {
  officeId: string;
}

interface RevenueEntry {
  id: number;
  amount: number;
  payment_type: string;
}

export default function OfficeDayClient({ officeId }: Props) {
  console.log('OfficeDayClient mounted with officeId:', officeId);
  
  const [report, setReport] = useState<any>(null);

  // Поля формы
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [toAccount, setToAccount] = useState("");

  // Итоговые суммы
  const [totalCheck, setTotalCheck] = useState(0);
  const [totalDay, setTotalDay] = useState(0);

  // Управление состоянием формы
  const [readonly, setReadonly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!officeId) {
      console.error('officeId is undefined or empty!');
      setError('ID офиса не указан');
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
      console.log('loadReport called with officeId:', officeId, 'type:', typeof officeId);
      
      // Передаем officeId как строку, функция сама конвертирует
      const data = await getTodayReport(officeId);
      setReport(data);

      // Загружаем существующую выручку
      const revenue = await getRevenue(data.id);
      const entries: RevenueEntry[] = Array.isArray(revenue) ? revenue : [];

      // Заполняем поля существующими данными
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

      // Если есть данные, блокируем форму
      if (hasData) {
        setReadonly(true);
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка загрузки отчета");
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

      setReadonly(true); // блокируем поля
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
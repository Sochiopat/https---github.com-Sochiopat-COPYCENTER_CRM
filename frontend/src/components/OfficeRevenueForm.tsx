"use client";

import { useState, useEffect } from "react";
import { getRevenue, addRevenue } from "@/lib/api";

interface Props {
  reportId: number;
}

export default function OfficeRevenueForm({ reportId }: Props) {
  // состояния для трёх типов платежей
  const [cash, setCash] = useState<number | "">("");
  const [card, setCard] = useState<number | "">("");
  const [toAccount, setToAccount] = useState<number | "">("");

  // состояния для блокировки полей
  const [readonlyCash, setReadonlyCash] = useState(false);
  const [readonlyCard, setReadonlyCard] = useState(false);
  const [readonlyAccount, setReadonlyAccount] = useState(false);

  // кнопка "Внести в отчет"
  const [canSubmit, setCanSubmit] = useState(true);

  // итоговые суммы
  const totalCheck = (Number(cash) || 0) + (Number(card) || 0);
  const totalDay = totalCheck + (Number(toAccount) || 0);

  // загружаем уже внесенную выручку
  useEffect(() => {
    async function load() {
      try {
        const revenue = await getRevenue(reportId);
        
        // Проверяем, что revenue - это массив
        const entries = Array.isArray(revenue) ? revenue : [];
        
        entries.forEach((e) => {
          switch (e.payment_type) {
            case "cash":
              setCash(e.amount);
              setReadonlyCash(true);
              break;
            case "card":
              setCard(e.amount);
              setReadonlyCard(true);
              break;
            case "other":
              setToAccount(e.amount);
              setReadonlyAccount(true);
              break;
          }
        });

        // если есть данные, блокируем кнопку
        if (entries.length > 0) setCanSubmit(false);
      } catch (error) {
        console.error("Ошибка загрузки выручки:", error);
      }
    }
    load();
  }, [reportId]);

  async function handleSubmit() {
    // вносим только ненулевые суммы
    if (cash && !readonlyCash) await addRevenue(reportId, Number(cash), "cash");
    if (card && !readonlyCard) await addRevenue(reportId, Number(card), "card");
    if (toAccount && !readonlyAccount) await addRevenue(reportId, Number(toAccount), "other");

    // блокируем поля и кнопку после внесения
    setReadonlyCash(true);
    setReadonlyCard(true);
    setReadonlyAccount(true);
    setCanSubmit(false);
  }

  function handleEdit(type: "cash" | "card" | "account") {
    switch (type) {
      case "cash":
        setReadonlyCash(false);
        break;
      case "card":
        setReadonlyCard(false);
        break;
      case "account":
        setReadonlyAccount(false);
        break;
    }
    setCanSubmit(true);
  }

  return (
    <div className="border p-4">
      <h2 className="font-semibold mb-2">Выручка за день</h2>

      <div className="space-y-2 mb-4">
        {/* Наличные */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="border p-2 w-32"
            value={cash}
            onChange={(e) => setCash(e.target.value === "" ? "" : Number(e.target.value))}
            readOnly={readonlyCash}
            placeholder="Наличные"
          />
          <button
            className="text-blue-600 underline"
            type="button"
            onClick={() => handleEdit("cash")}
          >
            Изменить
          </button>
        </div>

        {/* Карта */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="border p-2 w-32"
            value={card}
            onChange={(e) => setCard(e.target.value === "" ? "" : Number(e.target.value))}
            readOnly={readonlyCard}
            placeholder="Платежи картой"
          />
          <button
            className="text-blue-600 underline"
            type="button"
            onClick={() => handleEdit("card")}
          >
            Изменить
          </button>
        </div>

        {/* ИТОГО выручка по чеку */}
        <div>
          <span className="font-semibold">ИТОГО выручка по чеку: </span>
          <span>{totalCheck}</span>
        </div>

        {/* Платежи на счет */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="border p-2 w-32"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value === "" ? "" : Number(e.target.value))}
            readOnly={readonlyAccount}
            placeholder="Платежи на счет"
          />
          <button
            className="text-blue-600 underline"
            type="button"
            onClick={() => handleEdit("account")}
          >
            Изменить
          </button>
        </div>

        {/* ВСЕГО выручка за день */}
        <div>
          <span className="font-semibold">ВСЕГО выручка за день: </span>
          <span>{totalDay}</span>
        </div>
      </div>

      <button
        className={`px-4 py-2 text-white ${canSubmit ? "bg-black" : "bg-gray-400"} `}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Внести в отчет
      </button>
    </div>
  );
}
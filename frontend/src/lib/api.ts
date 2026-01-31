const API_URL = "http://127.0.0.1:8000";

// ======================
// ОФИСЫ
// ======================
export async function getOffices() {
  const res = await fetch(`${API_URL}/offices`);
  if (!res.ok) throw new Error("Не удалось загрузить офисы");
  return res.json();
}

export async function createOffice(name: string, address?: string) {
  const res = await fetch(`${API_URL}/offices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, address }),
  });
  if (!res.ok) throw new Error("Не удалось создать офис");
  return res.json();
}

// ======================
// ОТЧЕТ ЗА ДЕНЬ
// ======================
export async function getTodayReport(officeId: number | string) {
  console.log('getTodayReport called with:', officeId, 'type:', typeof officeId);
  
  // Конвертируем в число
  const id = typeof officeId === 'string' ? parseInt(officeId, 10) : officeId;
  
  console.log('Converted to:', id, 'isNaN:', Number.isNaN(id));
  
  if (!id || Number.isNaN(id) || id <= 0) {
    throw new Error(`Invalid officeId: received "${officeId}", converted to ${id}`);
  }

  try {
    const res = await fetch(`${API_URL}/offices/${id}/today`);
    console.log('getTodayReport response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('getTodayReport error response:', errorText);
      throw new Error(`Не удалось получить отчет за день (${res.status}): ${errorText}`);
    }
    
    const data = await res.json();
    console.log('getTodayReport data:', data);
    return data;
  } catch (error) {
    console.error('getTodayReport catch error:', error);
    throw error;
  }
}

// ======================
// ВЫРУЧКА
// ======================
export async function addRevenue(
  reportId: number,
  amount: number,
  payment_type: string
) {
  console.log('addRevenue called with:', { reportId, amount, payment_type });
  
  try {
    // ИСПРАВЛЕНО: используем правильный endpoint из бэкенда
    const res = await fetch(`${API_URL}/reportdays/${reportId}/revenue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_day_id: reportId, // Бэкенд ожидает это поле в schema
        amount,
        payment_type,
      }),
    });

    console.log('addRevenue response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('addRevenue error response:', errorText);
      throw new Error(`Не удалось добавить выручку (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log('addRevenue success:', data);
    return data;
  } catch (error) {
    console.error('addRevenue catch error:', error);
    throw error;
  }
}

export async function getRevenue(reportId: number) {
  console.log('getRevenue called with reportId:', reportId);
  
  try {
    // ИСПРАВЛЕНО: используем правильный endpoint из бэкенда
    const res = await fetch(`${API_URL}/reportdays/${reportId}/revenue`);
    console.log('getRevenue response status:', res.status);
    
    // Если 404, значит выручки ещё нет — это нормально
    if (res.status === 404) {
      console.log('No revenue found yet, returning empty array');
      return [];
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('getRevenue error response:', errorText);
      throw new Error(`Не удалось получить выручку (${res.status}): ${errorText}`);
    }
    
    const data = await res.json();
    console.log('getRevenue data:', data);
    return data;
  } catch (error) {
    console.error('getRevenue catch error:', error);
    // Если ошибка сети, возвращаем пустой массив
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Network error, returning empty array');
      return [];
    }
    throw error;
  }
}
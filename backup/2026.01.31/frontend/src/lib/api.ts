const API_URL = "http://127.0.0.1:8000";

export async function getOffices() {
  const res = await fetch(`${API_URL}/offices`);
  return res.json();
}

export async function createOffice(name: string) {
  const res = await fetch(`${API_URL}/offices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function getTodayReport(officeId: number) {
  const res = await fetch(`${API_URL}/offices/${officeId}/today`);
  return res.json();
}

export async function addRevenue(reportId: number, amount: number, method: string) {
  const res = await fetch(`${API_URL}/reportdays/${reportId}/revenue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report_day_id: reportId, amount, payment_type: method }),
  });
  return res.json();
}

export async function getRevenue(reportId: number) {
  const res = await fetch(`${API_URL}/reportdays/${reportId}/revenue`);
  return res.json();
}

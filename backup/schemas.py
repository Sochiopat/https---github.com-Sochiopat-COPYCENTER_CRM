from pydantic import BaseModel
import datetime


# ======================
# OFFICES
# ======================
class OfficeCreate(BaseModel):
    name: str
    address: str | None = None


class OfficeOut(BaseModel):
    id: int
    name: str
    address: str | None = None

    class Config:
        from_attributes = True


# ======================
# REPORT DAYS
# ======================
class ReportDayCreate(BaseModel):
    office_id: int
    report_date: datetime.date | None = None


class ReportDayOut(BaseModel):
    id: int
    office_id: int
    date: datetime.date

    class Config:
        from_attributes = True


# ======================
# REVENUE ENTRIES
# ======================
class RevenueEntryCreate(BaseModel):
    report_day_id: int
    amount: float
    payment_type: str | None = "cash"
    description: str | None = None


class RevenueEntryOut(BaseModel):
    id: int
    report_day_id: int
    amount: float
    payment_type: str
    description: str | None = None

    class Config:
        from_attributes = True


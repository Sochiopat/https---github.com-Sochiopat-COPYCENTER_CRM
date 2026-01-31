from pydantic import BaseModel
from typing import Optional
import datetime

class OfficeCreate(BaseModel):
    name: str
    address: Optional[str] = None

class OfficeOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    class Config:
        from_attributes = True

class ReportDayCreate(BaseModel):
    office_id: int
    report_date: Optional[datetime.date] = None

class ReportDayOut(BaseModel):
    id: int
    office_id: int
    date: datetime.date
    class Config:
        from_attributes = True

class RevenueEntryCreate(BaseModel):
    report_day_id: int
    amount: float
    payment_type: Optional[str] = "cash"
    description: Optional[str] = None

class RevenueEntryOut(BaseModel):
    id: int
    report_day_id: int
    amount: float
    payment_type: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

from .database import SessionLocal, engine
from .models import Base, Office, ReportDay, RevenueEntry
from .schemas import OfficeCreate, OfficeOut, ReportDayCreate, ReportDayOut, RevenueEntryCreate, RevenueEntryOut

Base.metadata.create_all(bind=engine)
app = FastAPI(title="COPYCENTER CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OFFICES
@app.post("/offices", response_model=OfficeOut)
def create_office(office: OfficeCreate, db: Session = Depends(get_db)):
    db_office = Office(name=office.name, address=office.address)
    db.add(db_office)
    db.commit()
    db.refresh(db_office)
    return db_office

@app.get("/offices", response_model=list[OfficeOut])
def list_offices(db: Session = Depends(get_db)):
    return db.query(Office).all()

# REPORT DAYS
@app.get("/offices/{office_id}/today", response_model=ReportDayOut)
def get_or_create_today_report(office_id: int, db: Session = Depends(get_db)):
    today = date.today()
    report = db.query(ReportDay).filter(ReportDay.office_id == office_id, ReportDay.date == today).first()
    if not report:
        report = ReportDay(office_id=office_id, date=today)
        db.add(report)
        db.commit()
        db.refresh(report)
    return report

# REVENUE ENTRIES
@app.post("/reportdays/{report_id}/revenue", response_model=RevenueEntryOut)
def add_revenue(report_id: int, entry: RevenueEntryCreate, db: Session = Depends(get_db)):
    db_entry = RevenueEntry(
        report_day_id=report_id,
        amount=entry.amount,
        payment_type=entry.payment_type or "cash",
        description=entry.description
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/reportdays/{report_id}/revenue", response_model=list[RevenueEntryOut])
def list_revenue(report_id: int, db: Session = Depends(get_db)):
    return db.query(RevenueEntry).filter(RevenueEntry.report_day_id == report_id).all()

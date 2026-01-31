from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import date

from .database import SessionLocal, engine
from .models import Base, Office, ReportDay, RevenueEntry
from .schemas import (
    OfficeCreate,
    OfficeOut,
    ReportDayCreate,
    ReportDayOut,
    RevenueEntryCreate,
    RevenueEntryOut,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="COPYCENTER CRM")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# OFFICES
# ======================
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


# ======================
# REPORT DAYS
# ======================
@app.post("/report-days", response_model=ReportDayOut)
def create_report_day(data: ReportDayCreate, db: Session = Depends(get_db)):
    report_date = data.report_date or date.today()

    existing = (
        db.query(ReportDay)
        .filter(ReportDay.office_id == data.office_id, ReportDay.date == report_date)
        .first()
    )

    if existing:
        return existing

    report_day = ReportDay(office_id=data.office_id, date=report_date)
    db.add(report_day)
    db.commit()
    db.refresh(report_day)
    return report_day


@app.get("/report-days", response_model=list[ReportDayOut])
def list_report_days(db: Session = Depends(get_db)):
    return db.query(ReportDay).order_by(ReportDay.date.desc()).all()


# ======================
# REVENUE ENTRIES
# ======================
@app.post("/revenue-entries", response_model=RevenueEntryOut)
def create_revenue_entry(data: RevenueEntryCreate, db: Session = Depends(get_db)):
    entry = RevenueEntry(
        report_day_id=data.report_day_id,
        amount=data.amount,
        payment_type=data.payment_type or "cash",
        description=data.description,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/revenue-entries", response_model=list[RevenueEntryOut])
def list_revenue_entries(report_day_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(RevenueEntry)
    if report_day_id:
        query = query.filter(RevenueEntry.report_day_id == report_day_id)
    return query.all()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from datetime import date
from fastapi import HTTPException

@app.get("/offices/{office_id}/today")
def get_or_create_today_report(office_id: int, db: Session = Depends(get_db)):
    today = date.today()

    report = (
        db.query(ReportDay)
        .filter(
            ReportDay.office_id == office_id,
            ReportDay.date == today
        )
        .first()
    )

    if not report:
        report = ReportDay(
            office_id=office_id,
            date=today
        )
        db.add(report)
        db.commit()
        db.refresh(report)

    return report


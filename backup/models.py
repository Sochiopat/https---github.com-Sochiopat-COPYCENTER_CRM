from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
from .database import Base


# ======================
# OFFICES
# ======================
class Office(Base):
    __tablename__ = "offices"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)

    report_days = relationship("ReportDay", back_populates="office")


# ======================
# REPORT DAYS
# ======================
class ReportDay(Base):
    __tablename__ = "report_days"

    id = Column(Integer, primary_key=True)
    date = Column(Date, default=date.today)
    office_id = Column(Integer, ForeignKey("offices.id"))

    office = relationship("Office", back_populates="report_days")
    revenue_entries = relationship(
        "RevenueEntry", back_populates="report_day", cascade="all, delete-orphan"
    )


# ======================
# REVENUE ENTRIES
# ======================
class RevenueEntry(Base):
    __tablename__ = "revenue_entries"

    id = Column(Integer, primary_key=True)
    report_day_id = Column(Integer, ForeignKey("report_days.id"))
    amount = Column(Float, nullable=False)
    payment_type = Column(String(50), default="cash")
    description = Column(String(255), nullable=True)

    report_day = relationship("ReportDay", back_populates="revenue_entries")

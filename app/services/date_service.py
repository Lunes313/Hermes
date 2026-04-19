from datetime import date, timedelta


def add_business_days(start_date: date, business_days: int) -> date:
    current_date = start_date
    remaining_days = business_days

    while remaining_days > 0:
        current_date += timedelta(days=1)
        if current_date.weekday() < 5:
            remaining_days -= 1

    return current_date

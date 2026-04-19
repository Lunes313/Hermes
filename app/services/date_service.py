from datetime import date, timedelta

try:
    import holidays
except ModuleNotFoundError:
    holidays = None

def add_business_days(start_date: date, business_days: int) -> date:
    """
    Calcula la fecha final sumando dias habiles, excluyendo fines de semana 
    y festivos de Colombia.
    """
    co_holidays = holidays.Colombia() if holidays else set()
    current_date = start_date
    days_added = 0
    
    while days_added < business_days:
        current_date += timedelta(days=1)
        # 0-4 son Lunes a Viernes
        if current_date.weekday() < 5 and current_date not in co_holidays:
            days_added += 1
            
    return current_date

from flask import Blueprint, render_template

from datetime import datetime, timedelta
from flask import render_template


main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/calendar')
def calendar():
    # Получаем текущую неделю
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())

    # Создаем список дней недели
    week_days = []
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        week_days.append({
            'name': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
            'date': day_date.strftime('%Y-%m-%d'),
            'display_date': day_date.strftime('%d.%m')
        })

    return render_template('table.html', week_days=week_days)
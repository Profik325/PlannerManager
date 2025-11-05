from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'my-super-secret-key-12345-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calendar.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Модель события
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    color = db.Column(db.String(7), default='#4285f4')
    created_at = db.Column(db.DateTime, default=datetime)
    user_id = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start': self.start_time.isoformat(),
            'end': self.end_time.isoformat(),
            'color': self.color
        }


# Главная страница
@app.route('/')
def index():
    return render_template('index.html')


# Страница календаря
@app.route('/calendar')
def calendar_view():
    return render_template('calendar/month_view.html')


# Создание события
@app.route('/events/create', methods=['GET', 'POST'])
def create_event():
    if request.method == 'POST':
        try:
            # Получаем данные из формы
            title = request.form['title']
            description = request.form['description']
            start_time_str = request.form['start_time']
            end_time_str = request.form['end_time']
            color = request.form.get('color', '#4285f4')

            # Исправляем формат даты для Python
            start_time = datetime.fromisoformat(start_time_str.replace('T', ' '))
            end_time = datetime.fromisoformat(end_time_str.replace('T', ' '))

            # Создаем событие
            event = Event(
                title=title,
                description=description,
                start_time=start_time,
                end_time=end_time,
                color=color
            )

            # Сохраняем в базу
            db.session.add(event)
            db.session.commit()

            return redirect(url_for('calendar_view'))

        except Exception as e:
            print(f"Ошибка при создании события: {e}")
            return f"Ошибка при создании события: {e}", 400

    # GET запрос - показываем форму
    return render_template('events/event_form.html')


# API для получения событий
@app.route('/api/events')
def api_events():
    try:
        events = Event.query.all()
        return jsonify([event.to_dict() for event in events])
    except Exception as e:
        print(f"Ошибка при получении событий: {e}")
        return jsonify([])


# Инициализация базы данных
with app.app_context():
    db.create_all()
    print("✅ База данных инициализирована!")

if __name__ == '__main__':
    app.run(debug=True)
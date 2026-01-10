from flask import Blueprint, request, jsonify, flash
from datetime import datetime, timedelta
from flask import render_template, session
from data import db_session, User
from data import Event, Table

main = Blueprint('main', __name__)

@main.route('/')
def index():
    user_id = session.get('user_id')

    if not user_id:
        return render_template('index.html',
                               has_tables=False,
                               user_id=0)

    db_sess = db_session.create_session()

    user = db_sess.query(User).get(user_id)
    tables = user.owned_tables

    # db_sess.close() # сессию не закрываем чтобы работал lazy=dynamic

    # 3. Передаем в шаблон
    return render_template('index.html',
                           tables=tables,
                           has_tables=len(tables) > 0,
                           user_id=user_id)

@main.route('/calendar')
@main.route('/calendar/<int:table_id>')
def calendar(table_id=None):
    # Получаем текущую неделю
    start_date = datetime.now()
    start_of_week = start_date - timedelta(days=start_date.weekday())

    db_sess = db_session.create_session()

    table = db_sess.query(Table).get(table_id)

    # Создаем список дней недели
    week_days = []
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        week_days.append({
            'name': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
            'date': day_date.strftime('%Y-%m-%d'),
            'display_date': day_date.strftime('%d'),
            'full_date': day_date.strftime('%d.%m.%Y'),
            'is_today': day_date.date() == datetime.now().date(),
            'day_index': i
        })

    return render_template('table.html', week_days=week_days,
                           current_date=start_date.strftime('%Y-%m-%d'))

@main.route('/api/tables', methods=['GET', 'POST'])
def create_table():
    db_sess = db_session.create_session()

    ID, method = request.args.get('id'), request.args.get('method')
    if method == 'get-name':
        table = db_sess.query(Table).get(ID)
        db_sess.close()
        if not table:
            return jsonify({
                'success': False,
                'title': 'Undefined'
            }), 404
        return jsonify({
            'success': True,
            'title': table.title
        })
    '''elif method == 'get-user-tables':
        tables = db_sess.query(Table).get(creator_id=ID)
        db_sess.close()
        if not ID:
            return jsonify({
                'success': False,
                'title': 'None'
            }), 404
        return jsonify({
            'success': True,
            'tables': tables
        })'''

    if not ID:
        try:
            data = request.get_json()

            user_id = session.get('user_id', 0)
            if not user_id:
                flash('Войдите, чтобы создать таблицу', 'error')
                return jsonify({
                    'success': False,
                    'message': 'unauthorized'
                }), 401



            new_table = Table(title = data['title'],
                              description = data['description'],
                              creator_id = user_id)

            db_sess.add(new_table)
            db_sess.commit()

            table_id = new_table.id

            db_sess.close()

            # Возвращаем успешный ответ
            return jsonify({
                'success': True,
                'message': 'Таблица сохранена',
                'table_id': table_id
            }), 200

        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500


@main.route('/api/tables?table_id=5&>', methods=['GET'])  # ← GET, а не POST!
def get_table(table_id):
    """Получить информацию о таблице по ID"""
    try:
        db_sess = db_session.create_session()

        # Ищем таблицу по ID
        table = db_sess.query(Table).get(table_id)

        if not table:
            return jsonify({
                'success': False,
                'error': 'Таблица не найдена'
            }), 404

        db_sess.close()

        # Возвращаем данные таблицы
        return jsonify({
            'success': True,
            'id': table.id,
            'title': table.title,
            'description': table.description,
            'creator_id': table.creator_id,
            'created_at': table.created_at.isoformat() if table.created_at else None
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main.route('/api/events', methods=['GET', 'POST'])
def save_event():
    db_sess = db_session.create_session()

    ID, method = request.args.get('id'), request.args.get('method')
    if method == 'get-week-events':
        events = db_sess.query(Table).get(table_id=ID).all()
        db_sess.close()
        if not events:
            return jsonify({
                'success': False,
                'title': 'None'
            }), 404
        return jsonify({
            'success': True
        })

    if not ID:
        try:
            # Получаем данные из запроса
            data = request.get_json()

            date_str = data['date']  # "2024-12-01"
            time_str = data['startTime']  # "10:00" или "10:00:00"

            # Если время в формате HH:MM, добавляем секунды
            if len(time_str) == 5:  # "10:00"
                time_str = time_str + ":00"

            # Создаем datetime объект
            start_datetime_str = f"{date_str}T{time_str}"
            start_datetime = datetime.fromisoformat(start_datetime_str)

            # 2. Вычисляем время окончания
            duration_minutes = int(data['duration'])
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)

            # 3. Получаем user_id (если есть аутентификация)
            user_id = session.get('user_id') if session.get('user_id') else 0

            new_event = Event(title = data['title'],
                              description = data['description'],
                              start_time = start_datetime,
                              end_time = end_datetime,
                              creator_id = user_id,
                              table_id = data['table_id'])

            db_sess.add(new_event)
            db_sess.commit()
            db_sess.close()

            # Возвращаем успешный ответ
            return jsonify({
                'success': True,
            }), 200

        except Exception as e:
            print(e)
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
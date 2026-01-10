from datetime import datetime
import sqlalchemy
from sqlalchemy import orm
from data.db_session import SqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin

class Event(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'events'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    title = sqlalchemy.Column(sqlalchemy.String(100), nullable=False)
    description = sqlalchemy.Column(sqlalchemy.Text)
    start_time = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    end_time = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    table_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('tables.id'), nullable=False)
    creator_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'), nullable=False)
    created_at = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.utcnow)
    # color = sqlalchemy.Column(sqlalchemy.String(7), default='#4a6fa5')
    
    # Простая логика участников (без отдельной таблицы)
    # participants_list = sqlalchemy.Column(sqlalchemy.Text, default='[]')
    # max_participants = sqlalchemy.Column(sqlalchemy.Integer, default=0)  # 0 = без ограничений

    # Связи:
    table = orm.relationship('Table', back_populates='events')
    # creator = orm.relationship('User', back_populates='created_events')

    serialize_rules = ('-table', '-creator')

    '''def get_participants(self):
        """Получить список ID участников"""
        import json
        return json.loads(self.participants_list)

    def set_participants(self, participants_ids):
        """Установить список ID участников"""
        import json
        self.participants_list = json.dumps(participants_ids)

    def add_participant(self, user_id):
        """Добавить участника"""
        participants = self.get_participants()
        if user_id not in participants:
            participants.append(user_id)
            self.set_participants(participants)
            return True
        return False

    def remove_participant(self, user_id):
        """Удалить участника"""
        participants = self.get_participants()
        if user_id in participants:
            participants.remove(user_id)
            self.set_participants(participants)
            return True
        return False

    def is_full(self):
        """Проверка, заполнено ли мероприятие"""
        if self.max_participants == 0:
            return False
        return len(self.get_participants()) >= self.max_participants

    def get_participant_count(self):
        """Количество участников"""
        return len(self.get_participants())

    def user_is_participant(self, user_id):
        """Проверить, является ли пользователь участником"""
        return user_id in self.get_participants()'''

    def get_duration_minutes(self):
        """Получить длительность в минутах"""
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            return int(duration.total_seconds() / 60)
        return 0

    def to_dict(self):
        """Для API/JavaScript"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'date': self.start_time.strftime('%Y-%m-%d') if self.start_time else None,
            'color': self.color,
            'created_at': self.created_at,
            'creator_id': self.creator_id,
            'table_id': self.table_id,
            # 'max_participants': self.max_participants,
            # 'participant_count': self.get_participant_count(),
            # 'is_full': self.is_full(),
            'duration': self.get_duration_minutes()
        }

    def to_calendar_format(self):
        """Формат для FullCalendar и подобных"""
        return {
            'id': self.id,
            'title': self.title,
            'start': self.start_time.isoformat() if self.start_time else None,
            'end': self.end_time.isoformat() if self.end_time else None,
            'color': self.color,
            'extendedProps': {
                'description': self.description,
                'location': self.location,
                'creator_id': self.creator_id
            }
        }
'''from app import db
from datetime import datetime

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime)
    created_by = db.Column(db.Text)'''

from datetime import datetime
import sqlalchemy
from flask_login import UserMixin
from sqlalchemy import orm
from data.db_session import SqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin

class Event(SqlAlchemyBase, UserMixin, SerializerMixin):
    __tablename__ = 'events'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(100), nullable=False)
    description = sqlalchemy.Column(sqlalchemy.Text)
    start_time = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    end_time = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    table_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('tables.id'), nullable=False)
    creator_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'), nullable=False)
    created_at = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.utcnow)
    max_participants = sqlalchemy.Column(sqlalchemy.Integer, default=0)  # 0 = без ограничений
    current_participants = sqlalchemy.Column(sqlalchemy.Integer, default=0)

    # Связи:
    # Таблица, к которой принадлежит мероприятие
    table = orm.relationship('Table', back_populates='events')

    # Создатель мероприятия
    creator = orm.relationship('User', back_populates='created_events')

    # Участники мероприятия
    #participants = orm.relationship('Participant', back_populates='event',
    #                               lazy='dynamic', cascade='all, delete-orphan')

    # Методы:
    '''def is_full(self):
        if self.max_participants == 0:
            return False
        return self.current_participants >= self.max_participants

    def has_user_joined(self, user):
        for participant in self.participants:
            if participant.user_id == user.id and participant.status == 'accepted':
                return True
        return False

    def get_participants_list(self):
        return [participant.user for participant in self.participants.filter_by(status='accepted')]'''
from datetime import datetime
import sqlalchemy
from sqlalchemy import orm
from data.db_session import SqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin

class Table(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'tables'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(100), nullable=False)
    description = sqlalchemy.Column(sqlalchemy.Text)
    creator_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'), nullable=False)
    created_at = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.utcnow)
    # settings = sqlalchemy.Column(sqlalchemy.JSON)  # настройки в формате JSON??

    # Связи:
    owner = orm.relationship('User', back_populates='owned_tables')

    events = orm.relationship('Event', back_populates='table', lazy='dynamic', cascade='all, delete-orphan')

    '''def can_view(self, user):
        if user.id == self.owner_id:
            return True
        return TablePermission.query.filter_by(
            table_id=self.id, user_id=user.id
        ).first() is not None

    def can_edit(self, user):
        if user.id == self.owner_id:
            return True
        permission = TablePermission.query.filter_by(
            table_id=self.id, user_id=user.id
        ).first()
        return permission and permission.permission_level in ['edit', 'manage']

    def can_manage(self, user):
        return user.id == self.owner_id'''
import sqlalchemy
from flask_login import UserMixin
from sqlalchemy import orm
from data.db_session import SqlAlchemyBase
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy_serializer import SerializerMixin


class User(SqlAlchemyBase, UserMixin, SerializerMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    # username = sqlalchemy.Column(sqlalchemy.String(80), unique=True, nullable=False)
    email = sqlalchemy.Column(sqlalchemy.String(120), unique=True, nullable=False)
    hashed_password = sqlalchemy.Column(sqlalchemy.String(128))
    # created_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)
    owned_tables = orm.relationship("Table", back_populates='owner', cascade='all, delete-orphan')

    # created_events = orm.relationship('Event', back_populates='creator')

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        if not self.hashed_password:
            return False
        return check_password_hash(self.hashed_password, password)

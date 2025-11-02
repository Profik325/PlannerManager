from flask_login import UserMixin
from app import db, login_manager


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    events = db.relationship('Event', backref='author', lazy=True)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
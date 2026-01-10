from flask_login import LoginManager
from data import db_session
from data.models.user import User

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'
login_manager.login_message = 'Авторизуйтесь, чтобы попасть на эту страницу.'

def setup_adm():
    try:
        db_sess = db_session.create_session()

        email = 'admin@dayfall.db'

        existing_user = db_sess.query(User).filter_by(email=email).first()

        new_user = User(email=email)
        new_user.set_password('Adayfallmin328')

        db_sess.add(new_user)
        db_sess.commit()
        db_sess.close()

    except Exception:
        return
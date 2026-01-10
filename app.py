from flask import Flask
from config import Config
from extensions import login_manager, setup_adm

from data import db_session
from routes.home_route import main
from routes.user_route import users

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    login_manager.init_app(app)
    # db_session.global_init("instance/dayfall.db")
    db_session.global_init("instance/calendar.db")
    setup_adm()

    # регистрация веток блюпринта
    app.register_blueprint(main)
    app.register_blueprint(users)

    return app
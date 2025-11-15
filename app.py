from flask import Flask, render_template, redirect, url_for, request, jsonify, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

# from models.user import User, load_user

app = Flask(__name__)
app.config['SECRET_KEY'] = 'my-super-secret-key-12345-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calendar.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager(app)  # ← СОЗДАЕМ ОБЪЕКТ
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    # timezone = db.Column(db.String(50), default='Europe/Moscow')  # ← добавить это
    # events = db.relationship('Event', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))



#///
#///
# Главная страница
@app.route('/')
def index():
    return render_template('index.html')


# Страница входа
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            flash('Вход выполнен!', 'success')

            return redirect(next_page) if next_page else redirect(url_for('index'))

        else:
            flash('Неверный email или пароль', 'error')

    return render_template('auth/login.html')


# Страница регистрации (не готова)
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        # timezone = request.form['timezone']

        # Проверка совпадения паролей
        if password != confirm_password:
            flash('Пароли не совпадают', 'error')
            return render_template('auth/register.html')

        # Проверяем, нет ли уже такого пользователя
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Этот Email уже использован', 'error')
            return render_template('auth/register.html')

        # Создаем нового пользователя
        new_user = User(email=email)
        new_user.set_password(password)



        db.session.add(new_user)
        db.session.commit()

        flash('Регистрация успешна!', 'success')
        return redirect(url_for('login'))

    return render_template('auth/register.html')


#Страница восстановления пароля (не готова)
@app.route('/recover-password', methods=['GET', 'POST'])
def recover_password():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        check_password = request.form['password']

        if not password == check_password:
            flash('Пароли не совпадают', 'error')
            return redirect(url_for('recover-password'))



        return redirect(url_for('login'))

    return render_template('auth/recover-password.html')

#Выход из аккаунта
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


# Инициализация базы данных
with app.app_context():
    db.create_all()
    print("✅ База данных инициализирована!")

if __name__ == '__main__':
    app.run(debug=True)
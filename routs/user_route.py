from flask import Blueprint, render_template, redirect, url_for, request, jsonify, flash
from flask_login import current_user, login_required, login_user, logout_user

from data.db_session import create_session
from extensions import login_manager
from data import db_session
from data.models.user import User

users = Blueprint('users', __name__) # регистрирую ветку блупринта


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    try:
        return db_sess.get(User, user_id)
    finally:
        db_sess.close()

# Страница входа
@users.route('/login', methods=['GET', 'POST']) # теперь users.route
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        db_sess = db_session.create_session()


        user = db_sess.query(User).filter(User.email == email).first() # то что желтым подсвечивается это норм

        if user and user.check_password(password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            flash('Вход выполнен!', 'success')

            return redirect(next_page) if next_page else redirect(url_for('main.index')) # тут теперь home.index, по блупринту
                                                                                         # не home, а main, по имени блупринта, а не переменной
                                                                                         # я все исправил если что
        else:
            flash('Неверный email или пароль', 'error')

    return render_template('auth/login.html')


# Страница регистрации (не готова)
@users.route('/register', methods=['GET', 'POST'])
def register(): # регистрацию и восстановление пароля я не трогала, пока работать не будет
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
        db_sess = db_session.create_session()

        # Используем сессию для запроса
        existing_user = db_sess.query(User).filter_by(email=email).first()

        if existing_user:
            flash('Этот Email уже использован', 'error')
            return render_template('auth/register.html')

        # Создаем нового пользователя
        new_user = User(email=email)
        new_user.set_password(password)



        db_sess.add(new_user)
        db_sess.commit()
        db_sess.close()

        flash('Регистрация успешна!', 'success')
        return redirect(url_for('users.login'))

    return render_template('auth/register.html')


#Страница восстановления пароля (не готова)
@users.route('/recover-password', methods=['GET', 'POST'])
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
@users.route('/logout') #переделана
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))
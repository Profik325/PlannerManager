from flask import Blueprint, render_template

home = Blueprint('main', __name__)

@home.route('/')
def index():
    return render_template('index.html')
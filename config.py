class Config:
    SECRET_KEY = 'my-super-secret-key-12345-change-in-production'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///calendar.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
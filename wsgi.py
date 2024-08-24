import sys
import os

# Insert the path to your flask-app directory
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from application import application

if __name__ == "__main__":
    application.run()

"""Run backend regression tests against a disposable SQLite database."""
import os
import sys
import tempfile
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'backend'))
# Prevent a configured remote database from being used by tests.
os.environ['MONGO_URI'] = ''
import app
from database import GrievanceDB

with tempfile.TemporaryDirectory(prefix='project-zero-tests-') as directory:
    db = object.__new__(GrievanceDB)
    db.db_type = 'sqlite'
    db.sqlite_path = str(Path(directory) / 'tests.db')
    db.init_sqlite_db()
    app.db = db
    suite = unittest.defaultTestLoader.discover(str(root / 'backend'), pattern='test_*.py')
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)

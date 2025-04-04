web: gunicorn backend.wsgi:application
frontend: cd frontend && npm run build && npm install -g serve && serve -s dist
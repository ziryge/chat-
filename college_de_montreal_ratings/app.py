from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import datetime
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'
app.config['DATABASE'] = 'college_ratings.db'

# Database setup
def get_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Teachers table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            email TEXT,
            added_by INTEGER,
            average_rating REAL DEFAULT 0,
            total_ratings INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Ratings table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            user_id INTEGER,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            is_anonymous INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES teachers (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Chat rooms table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            room_type TEXT DEFAULT 'public',
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')

    # Chat messages table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            user_id INTEGER,
            message TEXT NOT NULL,
            username TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Check if admin exists, if not create one
    admin = conn.execute('SELECT * FROM users WHERE username = ?', ('devstral',)).fetchone()
    if not admin:
        hashed_pwd = generate_password_hash('jebogy84')
        conn.execute('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
                     ('devstral', hashed_pwd, 1))
    
    conn.commit()
    conn.close()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        if not session.get('is_admin'):
            flash('Sorry, this page is for admins only', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    query = request.args.get('q', '')
    conn = get_db()
    
    if query:
        teachers = conn.execute('''
            SELECT * FROM teachers 
            WHERE name LIKE ? OR department LIKE ?
            ORDER BY average_rating DESC
        ''', (f'%{query}%', f'%{query}%')).fetchall()
    else:
        teachers = conn.execute('SELECT * FROM teachers ORDER BY average_rating DESC').fetchall()
    
    conn.close()
    return render_template('index.html', teachers=teachers, query=query)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin']
            flash('Hey there! You are logged in', 'success')
            return redirect(url_for('index'))
        else:
            flash('Oops, wrong username or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('See you later!', 'info')
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Hey, you forgot to fill something in', 'error')
            return render_template('register.html')
        
        conn = get_db()
        try:
            hashed_pwd = generate_password_hash(password)
            conn.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                        (username, hashed_pwd))
            conn.commit()
            flash('All set! Now go ahead and log in', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('That username is already taken, try another', 'error')
        finally:
            conn.close()
    
    return render_template('register.html')

@app.route('/teacher/<int:teacher_id>')
def teacher_detail(teacher_id):
    conn = get_db()
    teacher = conn.execute('SELECT * FROM teachers WHERE id = ?', (teacher_id,)).fetchone()
    ratings = conn.execute('''
        SELECT r.*, u.username, u.is_admin
        FROM ratings r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.teacher_id = ?
        ORDER BY r.created_at DESC
    ''', (teacher_id,)).fetchall()
    conn.close()
    
    return render_template('teacher_detail.html', teacher=teacher, ratings=ratings)

@app.route('/rate/<int:teacher_id>', methods=['POST'])
def rate_teacher(teacher_id):
    rating = request.form.get('rating')
    comment = request.form.get('comment')
    is_anonymous = request.form.get('anonymous') == 'on'
    
    if not rating or not rating.isdigit() or int(rating) < 1 or int(rating) > 5:
        flash('Something went wrong with your rating', 'error')
        return redirect(url_for('teacher_detail', teacher_id=teacher_id))
    
    user_id = session.get('user_id')
    
    if not user_id and not is_anonymous:
        flash('You need to log in to leave a review', 'error')
        return redirect(url_for('login'))
    
    score = int(rating)
    
    conn = get_db()
    
    # Check if user already rated this teacher
    if user_id and not is_anonymous:
        existing = conn.execute(
            'SELECT * FROM ratings WHERE teacher_id = ? AND user_id = ? AND is_anonymous = 0',
            (teacher_id, user_id)
        ).fetchone()
        
        if existing:
            flash('You have already reviewed this teacher!', 'error')
            conn.close()
            return redirect(url_for('teacher_detail', teacher_id=teacher_id))
    
    # Add rating
    conn.execute('''
        INSERT INTO ratings (teacher_id, user_id, rating, comment, is_anonymous)
        VALUES (?, ?, ?, ?, ?)
    ''', (teacher_id, user_id, score, comment, 1 if is_anonymous else 0))
    
    # Update teacher average rating
    ratings = conn.execute('SELECT rating FROM ratings WHERE teacher_id = ?', (teacher_id,)).fetchall()
    avg = sum(r['rating'] for r in ratings) / len(ratings) if ratings else 0
    conn.execute('UPDATE teachers SET average_rating = ?, total_ratings = ? WHERE id = ?',
                (round(avg, 2), len(ratings), teacher_id))
    
    conn.commit()
    conn.close()
    
    flash('Thanks for your review!', 'success')
    return redirect(url_for('teacher_detail', teacher_id=teacher_id))

@app.route('/admin')
@admin_required
def admin_dashboard():
    conn = get_db()
    teachers = conn.execute('SELECT * FROM teachers ORDER BY created_at DESC').fetchall()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    
    return render_template('admin.html', teachers=teachers, users=users)

@app.route('/admin/add_teacher', methods=['GET', 'POST'])
@admin_required
def add_teacher():
    if request.method == 'POST':
        name = request.form.get('name')
        department = request.form.get('department')
        email = request.form.get('email')
        
        if not name or not department:
            flash('You need to include a name and department', 'error')
            return render_template('add_teacher.html')
        
        conn = get_db()
        conn.execute('''
            INSERT INTO teachers (name, department, email, added_by)
            VALUES (?, ?, ?, ?)
        ''', (name, department, email, session['user_id']))
        conn.commit()
        conn.close()
        
        flash('The teacher has been added!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('add_teacher.html')

@app.route('/admin/delete_teacher/<int:teacher_id>', methods=['POST'])
@admin_required
def delete_teacher(teacher_id):
    conn = get_db()
    conn.execute('DELETE FROM ratings WHERE teacher_id = ?', (teacher_id,))
    conn.execute('DELETE FROM teachers WHERE id = ?', (teacher_id,))
    conn.commit()
    conn.close()
    
    flash('Teacher has been removed', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/api/teachers', methods=['GET'])
def api_teachers():
    query = request.args.get('q', '')
    conn = get_db()
    
    if query:
        teachers = conn.execute('''
            SELECT id, name, department, average_rating, total_ratings 
            FROM teachers 
            WHERE name LIKE ? OR department LIKE ?
        ''', (f'%{query}%', f'%{query}%')).fetchall()
    else:
        teachers = conn.execute('''
            SELECT id, name, department, average_rating, total_ratings FROM teachers
        ''').fetchall()
    
    conn.close()
    return jsonify([dict(t) for t in teachers])

# Initialize database and populate with teachers
@app.before_request
def before_request():
    if not hasattr(app, 'initialized'):
        init_db()
        app.initialized = True
        
        # Add sample College de Montreal teachers on first run
        conn = get_db()
        existing_teachers = conn.execute('SELECT COUNT(*) as count FROM teachers').fetchone()['count']
        
        if existing_teachers == 0:
            teachers_data = [
                # Département des Arts
                ('Julie Beaulé', 'Arts', None),
                ('Rémi Bolduc', 'Arts', None),
                ('Marilyse Chaussée', 'Arts', None),
                ('Emmanuelle Cloutier-Carrier', 'Arts', None),
                ('Vanessa Gagnon', 'Arts', None),
                ('Lara Bénédicte Griscelli', 'Arts', None),
                ('Odette Lalonde', 'Arts', None),
                ('Florianne Lauzon Loyer', 'Arts', None),
                ('Pascal Palomino', 'Arts', None),
                ('Julie Reydellet', 'Arts', None),
                ('Annick Terral', 'Arts', None),
                # Département d'Anglais et Espagnol
                ('Jade Boily', 'Anglais et Espagnol', None),
                ('Dominique Calma', 'Anglais et Espagnol', None),
                ('Austin Denham', 'Anglais et Espagnol', None),
                ('Veronica Freeman', 'Anglais et Espagnol', None),
                ('Farhin Hassan', 'Anglais et Espagnol', None),
                ('Elena Marcovecchio', 'Anglais et Espagnol', None),
                ('Rosemary McConnell', 'Anglais et Espagnol', None),
                ('Kyla Sedore', 'Anglais et Espagnol', None),
                ('Bruce Tunney', 'Anglais et Espagnol', None),
                ('Ian Wilbur', 'Anglais et Espagnol', None),
                # Département d'Éducation Physique
                ('Amélie Francoeur', 'Éducation Physique', None),
                ('Mathieu Lacombe', 'Éducation Physique', None),
                ('Jean-François Lalonde', 'Éducation Physique', None),
                ('Éric Namts', 'Éducation Physique', None),
                ('Marie-Odile Racon', 'Éducation Physique', None),
                ('Julien Rochon-Bourassa', 'Éducation Physique', None),
                # Département de Culture et Citoyenneté Québécoise
                ('Luc Bergeron', 'Culture et Citoyenneté Québécoise', None),
                ('Dominique Dominique', 'Culture et Citoyenneté Québécoise', None),
                ('Marcia Duranceau', 'Culture et Citoyenneté Québécoise', None),
                ('David Palin-Montpetit', 'Culture et Citoyenneté Québécoise', None),
                ('Sean Penner', 'Culture et Citoyenneté Québécoise', None),
                ('Benjamin Picaud', 'Culture et Citoyenneté Québécoise', None),
                # Département de Français
                ('David Boudreault-Désiré', 'Français', None),
                ('Gwladys Breault', 'Français', None),
                ('Marie-Joëlle Champagne', 'Français', None),
                ('Gabrielle Comtois', 'Français', None),
                ('Justine Duguay', 'Français', None),
                ('Marcia Duranceau', 'Français', None),
                ('Marc-André Forget', 'Français', None),
                ('Andrée Goulet-Jobin', 'Français', None),
                ('Marie-Noël Lanthier', 'Français', None),
                ('Kitrie Marin-Auger', 'Français', None),
                ('Marie-Ève Miville-Deschênes', 'Français', None),
                ('Jade Robichaud-Laurin', 'Français', None),
                ('Christine Saurette', 'Français', None),
                ('Jasmine Soulignac', 'Français', None),
                ('Valérie Tremblay', 'Français', None),
                # Département de Mathématique
                ('Simona Carmen Anescu', 'Mathématique', None),
                ('Raphaël Bellavance Ménard', 'Mathématique', None),
                ('Jean-Yves Boulais', 'Mathématique', None),
                ('Boris Clain', 'Mathématique', None),
                ('Danny Dallaire', 'Mathématique', None),
                ('Stéphane Laplante', 'Mathématique', None),
                ('Yuliya Pokhil', 'Mathématique', None),
                ('Audrey Purcell St-Michel', 'Mathématique', None),
                ('Léanne Robitaille', 'Mathématique', None),
                ('Régent Jr Roy', 'Mathématique', None),
                ('Khaled Taibi', 'Mathématique', None),
                ('Maude Tétrault', 'Mathématique', None),
                ('Audrey Zielinski', 'Mathématique', None),
                # Département des Sciences et Technologies
                ('Valérie Baldacchino', 'Sciences et Technologies', None),
                ('Jean-Sébastien Beaulieu', 'Sciences et Technologies', None),
                ('Olivier Bourque', 'Sciences et Technologies', None),
                ('Karène Brindle', 'Sciences et Technologies', None),
                ('Maxime Brisbois', 'Sciences et Technologies', None),
                ('Antoine Buscarlet', 'Sciences et Technologies', None),
                ('Yannick Cyr', 'Sciences et Technologies', None),
                ('Amélia Darsigny', 'Sciences et Technologies', None),
                ('Odrey Dufort', 'Sciences et Technologies', None),
                ('Éloïse Massé', 'Sciences et Technologies', None),
                ('Anne-Marie Talbot-Fournier', 'Sciences et Technologies', None),
                ('Marc Vendette', 'Sciences et Technologies', None),
                ('Audrey Zielinski', 'Sciences et Technologies', None),
                # Département de l'Univers Social
                ('Benjamin Astresses', 'Univers Social', None),
                ('Christopher Atkins', 'Univers Social', None),
                ('Antoine Basque', 'Univers Social', None),
                ('Jeffrey Brown-Pagé', 'Univers Social', None),
                ('Isabelle Casademont', 'Univers Social', None),
                ('Jean-Sébastien Cotnoir', 'Univers Social', None),
                ('Olivia Farley', 'Univers Social', None),
                ('Sylvain Larose', 'Univers Social', None),
                ('Benjamin Picaud', 'Univers Social', None),
                ('Geneviève Quirion-Hardy', 'Univers Social', None),
                ('Razmik Varoujean', 'Univers Social', None),
            ]

            for teacher in teachers_data:
                conn.execute('INSERT INTO teachers (name, department, email) VALUES (?, ?, ?)', teacher)

            conn.commit()
            print("Database populated with Collège de Montréal teachers")

        conn.close()

# Chat routes
@app.route('/chat')
@login_required
def chat_list():
    conn = get_db()
    public_rooms = conn.execute('''
        SELECT cr.*, u.username as creator,
               (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) as message_count
        FROM chat_rooms cr
        LEFT JOIN users u ON cr.created_by = u.id
        WHERE cr.room_type = 'public'
        ORDER BY cr.created_at DESC
    ''').fetchall()

    private_rooms = conn.execute('''
        SELECT DISTINCT cr.*, u.username as creator,
               (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) as message_count
        FROM chat_rooms cr
        LEFT JOIN users u ON cr.created_by = u.id
        LEFT JOIN chat_messages cm ON cm.room_id = cr.id
        WHERE cr.room_type = 'private'
        AND (cr.created_by = ? OR cm.user_id = ?)
        ORDER BY cr.created_at DESC
    ''', (session['user_id'], session['user_id'])).fetchall()

    conn.close()
    return render_template('chat_list.html', public_rooms=public_rooms, private_rooms=private_rooms)

@app.route('/chat/new', methods=['GET', 'POST'])
@login_required
def new_chat():
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description', '')
        room_type = request.form.get('room_type', 'public')

        conn = get_db()
        conn.execute('''
            INSERT INTO chat_rooms (name, description, room_type, created_by)
            VALUES (?, ?, ?, ?)
        ''', (name, description, room_type, session['user_id']))
        conn.commit()
        conn.close()

        return redirect(url_for('chat_list'))

    return render_template('new_chat.html')

@app.route('/chat/<int:room_id>')
@login_required
def chat_room(room_id):
    conn = get_db()
    room = conn.execute('SELECT * FROM chat_rooms WHERE id = ?', (room_id,)).fetchone()

    if not room:
        conn.close()
        return redirect(url_for('chat_list'))

    # Check if user has access to private room
    if room['room_type'] == 'private':
        has_access = conn.execute('''
            SELECT COUNT(*) FROM chat_messages
            WHERE room_id = ? AND (user_id = ? OR ? = ?)
        ''', (room_id, session['user_id'], room['created_by'], session['user_id'])).fetchone()[0] > 0

        if not has_access:
            conn.close()
            return redirect(url_for('chat_list'))

    messages = conn.execute('''
        SELECT * FROM chat_messages
        WHERE room_id = ?
        ORDER BY created_at ASC
    ''', (room_id,)).fetchall()

    teachers = conn.execute('SELECT id, name FROM teachers ORDER BY name LIMIT 20').fetchall()
    conn.close()

    return render_template('chat_room.html', room=room, messages=messages, teachers=teachers)

@app.route('/chat/<int:room_id>/send', methods=['POST'])
@login_required
def send_message(room_id):
    message = request.form.get('message', '').strip()

    if message:
        conn = get_db()
        conn.execute('''
            INSERT INTO chat_messages (room_id, user_id, message, username)
            VALUES (?, ?, ?, ?)
        ''', (room_id, session['user_id'], message, session.get('username', 'Anonymous')))
        conn.commit()
        conn.close()

    return redirect(url_for('chat_room', room_id=room_id))

@app.route('/chat/teachers/<int:teacher_id>', methods=['POST'])
@login_required
def create_teacher_chat(teacher_id):
    conn = get_db()
    teacher = conn.execute('SELECT * FROM teachers WHERE id = ?', (teacher_id,)).fetchone()

    if teacher:
        # Check if chat room already exists for this teacher
        existing = conn.execute('''
            SELECT * FROM chat_rooms
            WHERE name = ? AND room_type = 'private'
        ''', (f"{teacher['name']} - Discussion",)).fetchone()

        if not existing:
            conn.execute('''
                INSERT INTO chat_rooms (name, description, room_type, created_by)
                VALUES (?, ?, ?, ?)
            ''', (f"{teacher['name']} - Discussion", f"Discussion about {teacher['name']}", 'private', session['user_id']))
            conn.commit()

    conn.close()
    return redirect(url_for('chat_list'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# College de Montreal Teacher Ratings Platform

A full-featured web application for rating and reviewing College de Montreal teachers. Students can share their experiences anonymously or with accounts, while administrators can manage the teacher database.

## Features

- 👨‍🏫 **Teacher Database**: Complete list of College de Montreal personnel with departments and contact info
- ⭐ **Rating System**: 1-5 star ratings for teachers with visual feedback
- 💬 **Comments**: Students can write detailed reviews and comments
- 🔍 **Search**: Real-time search by teacher name or department
- 🔒 **Anonymous Mode**: Users can rate anonymously without revealing their identity
- 👤 **User Accounts**: Full authentication system with registration and login
- 👑 **Admin Panel**: Admin dashboard for adding/removing teachers and viewing statistics
- 📊 **Statistics**: Average ratings and review counts for each teacher

## Tech Stack

- **Backend**: Python Flask (Lightweight web framework)
- **Database**: SQLite (No external database required)
- **Frontend**: HTML/CSS/JavaScript (Modern, responsive design)
- **Authentication**: Password hashing with Werkzeug security

## Quick Start

### 1. Install Python Dependencies

```bash
cd college_de_montreal_ratings
pip install -r requirements.txt
```

### 2. Run the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

### 3. Access the Website

Open your browser and go to:
```
http://localhost:5000
```

## Admin Access

Login with admin credentials:
- **Username**: `devstral`
- **Password**: `jebogy84`

After login, you'll see an **Admin Panel** link in the navigation bar. From there, you can:
- Add new teachers
- View all teachers and their ratings
- Delete teachers
- Manage user accounts

## Hosting on Your Computer

### Method 1: Running Locally (Development Mode)

```bash
python app.py
```

This runs the app in debug mode. Access it from your computer at `http://localhost:5000`.

### Method 2: Running on Local Network (Share with others on same network)

Edit `app.py` and find the last line. Change it to:

```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

Then run:
```bash
python app.py
```

Now people on the same network can access it using your computer's IP address:
```
http://YOUR_LOCAL_IP:5000
```

To find your local IP (Linux):
```bash
hostname -I
```

### Method 3: Running as Background Service (Linux)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/college-ratings.service
```

Add this content (change paths as needed):
```ini
[Unit]
Description=College de Montreal Ratings
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/Devstral/Documents/chess/college_de_montreal_ratings
ExecStart=/usr/bin/python3 /home/Devstral/Documents/chess/college_de_montreal_ratings/app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable college-ratings
sudo systemctl start college-ratings
sudo systemctl status college-ratings
```

The service will automatically start on boot and restart if it crashes.

### Method 4: Using Screen/Tmux (Quick Background Mode)

```bash
screen -S ratings
python app.py
# Press Ctrl+A then D to detach
```

To resume:
```bash
screen -r ratings
```

## Security Notes for Production

1. **Change the secret key** in `app.py`:
   ```python
   app.secret_key = 'your-very-long-random-secret-key-here'
   ```

2. **Disable debug mode** in production:
   ```python
   app.run(debug=False, host='0.0.0.0', port=5000)
   ```

3. **Use HTTPS** if hosting publicly (set up with Nginx + SSL)

4. **Regular backups**: The SQLite database file is `college_ratings.db`. Back it up regularly:
   ```bash
   cp college_ratings.db college_ratings_backup.db
   ```

## Database Structure

The application uses SQLite with the following tables:

### Users
- `id`: User ID
- `username`: Unique username
- `password`: Hashed password
- `is_admin`: Admin flag (0 or 1)
- `created_at`: Account creation timestamp

### Teachers
- `id`: Teacher ID
- `name`: Full name
- `department`: Department/subject
- `email`: Contact email
- `average_rating`: Computed average (1-5)
- `total_ratings`: Number of ratings
- `created_at`: Creation timestamp

### Ratings
- `id`: Rating ID
- `teacher_id`: Reference to teacher
- `user_id`: Reference to user (nullable for anonymous)
- `rating`: Score (1-5)
- `comment`: Review text
- `is_anonymous`: Anonymous flag
- `created_at`: Rating timestamp

## Default Teachers Included

The database is pre-populated with 20 sample College de Montreal teachers across various departments:
- Mathematics, Physics, Chemistry
- History, English, French
- Computer Science, Engineering
- Biology, Psychology
- Economics, Business
- And more...

## API Endpoints

### Public API
- `GET /api/teachers?q=search` - Search teachers (JSON response)

### Web Routes
- `GET /` - Home page with teacher list
- `GET /teacher/<id>` - Teacher details and ratings
- `GET/POST /login` - User login
- `GET/POST /register` - User registration
- `GET /logout` - User logout
- `GET /admin` - Admin dashboard (admin only)
- `GET/POST /admin/add_teacher` - Add teacher (admin only)
- `POST /admin/delete_teacher/<id>` - Delete teacher (admin only)
- `POST /rate/<id>` - Submit teacher rating

## Troubleshooting

### Port already in use
If port 5000 is busy, edit `app.py` and change the port:
```python
app.run(debug=True, host='0.0.0.0', port=8000)
```

### Database locked
Make sure only one instance is running. Kill any background processes:
```bash
pkill -f "python app.py"
```

### Can't access from other computers
- Check firewall settings
- Ensure app is running with `host='0.0.0.0'`
- Verify your local IP address

## License

Built for College de Montreal students. Use responsibly!

## Support

For issues or questions, check the application logs or contact the administrator.

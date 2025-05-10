from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Servir manifest.webmanifest da pasta static, mas na URL /manifest.webmanifest
@app.route('/manifest.webmanifest')
def serve_manifest_at_root():
    # app.static_folder aponta para a pasta 'static' por defeito
    return send_from_directory(app.static_folder, 'manifest.webmanifest', mimetype='application/manifest+json')

# Servir sw.js da pasta static, mas na URL /sw.js
@app.route('/sw.js')
def serve_sw_at_root():
    return send_from_directory(app.static_folder, 'sw.js', mimetype='application/javascript')

if __name__ == '__main__':
    app.run(debug=True)


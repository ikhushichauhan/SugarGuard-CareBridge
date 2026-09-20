import json
import os
import sys
import mimetypes
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lambda_function import lambda_handler

PORT = int(os.environ.get("PORT", 8080))
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

class ProdHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
        self.end_headers()

    def do_GET(self):
        # Serve static files, fallback to index.html for SPA routing
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = '/index.html'
        super().do_GET()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith("/api") or "/functions/function/invocations" in parsed_path.path:
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            
            try:
                body_json = json.loads(body_bytes.decode('utf-8'))
            except Exception:
                body_json = {}

            # The frontend might send it wrapped or raw.
            # Lambda expects event={"body": "..."}
            event = {"body": json.dumps(body_json.get("body", body_json))}
            lambda_res = lambda_handler(event, None)

            self.send_response(lambda_res.get("statusCode", 200))
            for key, val in lambda_res.get("headers", {}).items():
                self.send_header(key, val)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            response_body = lambda_res.get("body", "{}")
            self.wfile.write(response_body.encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

    def log_message(self, format, *args):
        print(f"[Prod Server] {format % args}")

def run():
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, ProdHandler)
    print(f"✅ Production server running on port {PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == '__main__':
    run()

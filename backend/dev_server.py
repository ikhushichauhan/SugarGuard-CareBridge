import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambda_function import lambda_handler

PORT = 9000

class ScreeningDevHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)
        
        try:
            body_json = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            body_json = {}

        event = {"body": json.dumps(body_json.get("body", body_json))}
        lambda_res = lambda_handler(event, None)

        self.send_response(lambda_res.get("statusCode", 200))
        for key, val in lambda_res.get("headers", {}).items():
            self.send_header(key, val)
        self.end_headers()

        response_body = lambda_res.get("body", "{}")
        
        # Format as RIE wrapper if requested as RIE body wrapper
        if "body" in body_json:
            wrapper = json.dumps({"statusCode": lambda_res.get("statusCode", 200), "body": response_body})
            self.wfile.write(wrapper.encode('utf-8'))
        else:
            self.wfile.write(response_body.encode('utf-8'))

    def log_message(self, format, *args):
        print(f"[SugarGuard Dev Server] {format % args}")

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, ScreeningDevHandler)
    print(f"✅ SugarGuard local dev backend server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down dev server.")
        httpd.server_close()

if __name__ == '__main__':
    run()

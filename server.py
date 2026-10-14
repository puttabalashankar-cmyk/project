"""
AutoHelp AI — Lightweight Python Backend Server
Serves static frontend files and securely proxies AI diagnosis requests to Google Gemini API
without exposing the API key to client code.
"""

import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error
from urllib.parse import urlparse

PORT = 8000

# Helper to read .env file manually without external dependencies
def load_dotenv():
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

load_dotenv()
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '').strip()

class AutoHelpHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            status_data = {
                "online": True,
                "hasApiKey": bool(GEMINI_API_KEY),
                "model": "gemini-1.5-flash" if GEMINI_API_KEY else "Offline Knowledge Base"
            }
            self.wfile.write(json.dumps(status_data).encode('utf-8'))
            return
        
        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/diagnose':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')

            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON format"}).encode('utf-8'))
                return

            if not GEMINI_API_KEY:
                # No Gemini API key provided; signal frontend to use its verified local expert engine
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "offline_fallback",
                    "message": "GEMINI_API_KEY not configured in .env. Falling back to local multilingual expert knowledge base."
                }).encode('utf-8'))
                return

            # Call Gemini API securely
            ai_response = self.call_gemini(data)
            if ai_response:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(ai_response).encode('utf-8'))
            else:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Gemini API failed or timed out"}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def call_gemini(self, data):
        vehicle = f"{data.get('brand', '')} {data.get('model', '')} ({data.get('vehicleType', 'vehicle')}, {data.get('fuelType', 'petrol')})".strip()
        symptoms = data.get('symptoms', '')
        lang = data.get('language', 'en')

        lang_instruction = {
            'te': "Respond entirely in natural, fluent Telugu (తెలుగు లిపి). Provide accurate automotive terms.",
            'hi': "Respond entirely in natural, fluent Hindi (हिन्दी देवनागरी लिपि).",
            'en': "Respond in clear, accessible English."
        }.get(lang, "Respond in the language of the user input.")

        prompt = f"""
You are the expert automotive technician and roadside breakdown safety AI for "AutoHelp AI".
A vehicle breakdown has occurred on the road.

VEHICLE DETAILS: {vehicle}
DRIVER SYMPTOMS REPORTED: {symptoms}
PREFERRED LANGUAGE: {lang} ({lang_instruction})

Analyze the symptoms and return ONLY valid JSON matching this exact schema:
{{
  "title": "Short title describing the issue in {lang}",
  "summary": "1-2 sentence clear breakdown explanation in {lang}",
  "severity": "critical" | "high" | "medium" | "low",
  "urgencyBadge": "Brief badge in {lang} (e.g. CRITICAL - DO NOT DRIVE / SAFE TO DRIVE TO GARAGE)",
  "possibleCauses": [
    {{ "cause": "Cause 1 in {lang}", "probability": "60%" }},
    {{ "cause": "Cause 2 in {lang}", "probability": "30%" }}
  ],
  "troubleshootingSteps": [
    {{ "step": 1, "title": "Step 1 title", "instruction": "Safe roadside instruction in {lang}" }},
    {{ "step": 2, "title": "Step 2 title", "instruction": "Safe roadside instruction in {lang}" }}
  ],
  "followUpQuestions": [
    {{ "question": "Relevant question to narrow problem in {lang}", "options": ["Option 1", "Option 2", "Option 3"] }}
  ],
  "mechanicRecommendation": "Specific recommendation whether towing is required or if it can be driven to a garage in {lang}",
  "estimatedCost": "Approximate realistic repair cost range in INR (e.g. ₹1,500 – ₹4,000) in {lang}",
  "disclaimer": "Clear safety reminder that this is AI assistance and not a certified mechanical guarantee in {lang}",
  "speechScript": "Natural, clear 2-3 sentence summary in {lang} designed to be read aloud via Text-to-Speech immediately to the driver."
}}

SAFETY RULES:
1. NEVER recommend opening hot radiator caps or touching high-voltage EV components.
2. Emphasize pulling over safely and turning on hazard lights.
3. Return ONLY clean JSON without markdown code block ticks.
"""

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                text_content = res_data['candidates'][0]['content']['parts'][0]['text']

                # Remove any markdown code blocks if model added them
                cleaned = text_content.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

                return json.loads(cleaned)
        except Exception as e:
            print("Gemini API call exception:", e)
            return None

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AutoHelpHandler) as httpd:
        print("============================================================")
        print(f"[*] AutoHelp AI Server is live at: http://localhost:{PORT}")
        print(f"[*] Gemini API Key configured: {'YES (Live AI)' if GEMINI_API_KEY else 'NO (Using Offline Multilingual Engine)'}")
        print("[*] Multilingual Support: English, Hindi, Telugu")
        print("[*] Press Ctrl+C to stop the server")
        print("============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == '__main__':
    run_server()

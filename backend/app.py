from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from config import Config
from datetime import datetime, timezone
from pymongo import MongoClient
from bson.objectid import ObjectId
from urllib.parse import urlparse
from ai_guardian_routes import ai_guardian_bp
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import random
from dotenv import load_dotenv

load_dotenv()

from modules.phrase_detection import detect_exact_phrases
from modules.extractor import extract_text
from modules.cleaner import clean_text
from modules.similarity import calculate_similarity
from modules.semantic_highlight import semantic_highlight
from modules.ai_detection import ai_detection_score, AIDetector

app = Flask(__name__)
app.register_blueprint(ai_guardian_bp)
app.config.from_object(Config)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '72759cd8f4b592a9a61af51b4f43f48937629779745bdede')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '72759cd8f4b592a9a61af51b4f43f48937629779745bdede')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://plagiarism-project-pfyl.vercel.app"
], supports_credentials=True)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client["plagiarismDB"]
    users_collection = db.users
    ai_analyses_collection = db.ai_analyses
    print("Connected to MongoDB: plagiarismDB")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    class InMemCol:
        def __init__(self): self.data = []
        def find_one(self, q):
            for item in self.data:
                if all(str(item.get(k)) == str(v) or item.get(k) == v for k,v in q.items()): return item
            return None
        def insert_one(self, doc):
            doc['_id'] = ObjectId(); self.data.append(doc)
            return type('R',(object,),{'inserted_id':doc['_id']})()
        def update_one(self, q, upd):
            for item in self.data:
                if all(item.get(k)==v for k,v in q.items() if k!='_id'):
                    if '$set' in upd: item.update(upd['$set']); break
        def find(self, q=None, sort=None, limit=None):
            r = self.data.copy()
            return r[:limit] if limit else r
    users_collection = InMemCol()
    ai_analyses_collection = InMemCol()

UPLOAD_FOLDER = "uploads"
AI_UPLOAD_FOLDER = "ai_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AI_UPLOAD_FOLDER, exist_ok=True)

ai_detector = AIDetector()

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER', '')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD', '')

email_enabled = False
if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
    try:
        mail = Mail(app)
        email_enabled = True
    except: pass

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
otp_store = {}

@jwt.unauthorized_loader
def unauthorized_response(cb): return jsonify({"error": "Missing or invalid token"}), 401
@jwt.invalid_token_loader
def invalid_token_response(cb): return jsonify({"error": "Invalid token"}), 422
@jwt.expired_token_loader
def expired_token_response(h, p): return jsonify({"error": "Token expired"}), 401

@app.route("/")
def home():
    return jsonify({"message": "PlagiGuard Backend running", "database": "plagiarismDB"}), 200

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name","").strip()
    email = data.get("email","").strip().lower()
    password = data.get("password","")
    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    users_collection.insert_one({
        "name": name, "email": email, "password_hash": hashed, "role": "user",
        "department": "", "location": "", "profession": "", "studyField": "",
        "educationLevel": "", "university": "", "jobRole": "", "company": "",
        "industry": "", "experience": "", "otherSpecify": "", "profileCompleted": False,
        "created_at": datetime.now(timezone.utc)
    })
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email","").strip().lower()
    password = data.get("password","")
    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity=str(user["_id"]))
    return jsonify({
        "access_token": token,
        "user": {
            "id": str(user["_id"]), "name": user["name"], "email": user["email"],
            "role": user.get("role","user"), "department": user.get("department",""),
            "location": user.get("location",""), "profession": user.get("profession",""),
            "studyField": user.get("studyField",""), "educationLevel": user.get("educationLevel",""),
            "university": user.get("university",""), "jobRole": user.get("jobRole",""),
            "company": user.get("company",""), "industry": user.get("industry",""),
            "experience": user.get("experience",""), "otherSpecify": user.get("otherSpecify",""),
            "profileCompleted": user.get("profileCompleted", False),
            "memberSince": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d") if user.get("created_at") else "2024"
        }
    })

@app.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS': return _cors_preflight()
    data = request.json
    email = data.get('email','').strip().lower()
    if not email: return jsonify({"error": "Email required"}), 400
    user = users_collection.find_one({"email": email})
    if not user: return jsonify({"error": "No account found with this email"}), 404
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {'otp': otp, 'expires_at': datetime.now(timezone.utc).timestamp() + 300}
    if email_enabled:
        try:
            msg = Message('Password Reset OTP - PlagiGuard', sender=app.config['MAIL_USERNAME'], recipients=[email])
            msg.body = f'Your OTP for password reset is: {otp}\nValid for 5 minutes.'
            mail.send(msg)
        except Exception as e:
            print(f"Email error: {e}")
    print(f"\n{'='*40}\nOTP for {email}: {otp}\n{'='*40}\n")
    return jsonify({"message": "OTP sent successfully"}), 200

@app.route('/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS': return _cors_preflight()
    data = request.json
    email = data.get('email','').strip().lower()
    otp = data.get('otp','').strip()
    if not email or not otp: return jsonify({"error": "Email and OTP required"}), 400
    stored = otp_store.get(email)
    if not stored: return jsonify({"error": "No OTP request found"}), 400
    if datetime.now(timezone.utc).timestamp() > stored['expires_at']:
        del otp_store[email]; return jsonify({"error": "OTP expired"}), 400
    if stored['otp'] != otp: return jsonify({"error": "Invalid OTP"}), 400
    reset_token = serializer.dumps(email, salt='password-reset')
    del otp_store[email]
    return jsonify({"message": "OTP verified", "reset_token": reset_token}), 200

@app.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS': return _cors_preflight()
    data = request.json
    reset_token = data.get('reset_token','')
    new_password = data.get('new_password','')
    if not reset_token or not new_password: return jsonify({"error": "Reset token and new password required"}), 400
    try:
        email = serializer.loads(reset_token, salt='password-reset', max_age=3600)
    except SignatureExpired: return jsonify({"error": "Reset link expired"}), 400
    except BadSignature: return jsonify({"error": "Invalid reset token"}), 400
    if len(new_password) < 6: return jsonify({"error": "Password must be at least 6 characters"}), 400
    hashed = bcrypt.generate_password_hash(new_password).decode("utf-8")
    users_collection.update_one({"email": email}, {"$set": {"password_hash": hashed}})
    return jsonify({"message": "Password reset successful"}), 200

def _cors_preflight():
    r = jsonify({'message': 'CORS preflight'})
    r.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    r.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    r.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    r.headers.add('Access-Control-Allow-Credentials', 'true')
    return r

@app.route("/api/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    try:
        user = users_collection.find_one({"_id": ObjectId(get_jwt_identity())})
        if not user: return jsonify({"error": "User not found"}), 404
        return jsonify({
            "id": str(user["_id"]), "name": user["name"], "email": user["email"],
            "role": user.get("role","user"), "department": user.get("department",""),
            "location": user.get("location",""), "profession": user.get("profession",""),
            "studyField": user.get("studyField",""), "educationLevel": user.get("educationLevel",""),
            "university": user.get("university",""), "jobRole": user.get("jobRole",""),
            "company": user.get("company",""), "industry": user.get("industry",""),
            "experience": user.get("experience",""), "otherSpecify": user.get("otherSpecify",""),
            "profileCompleted": user.get("profileCompleted", False),
            "memberSince": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d") if user.get("created_at") else "2024"
        }), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    try:
        data = request.json
        fields = ["name","role","department","location","profession","studyField",
                  "educationLevel","university","jobRole","company","industry","experience","otherSpecify"]
        upd = {k: data[k] for k in fields if k in data}
        if "profession" in data and data["profession"]: upd["profileCompleted"] = True
        users_collection.update_one({"_id": ObjectId(get_jwt_identity())}, {"$set": upd})
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/user/history", methods=["GET"])
@jwt_required()
def get_user_history():
    try:
        analyses = list(ai_analyses_collection.find(
            {"user_id": ObjectId(get_jwt_identity())}, sort=[("created_at",-1)], limit=30))
        history = [{
            "id": str(a["_id"]), "fileName": a.get("file_name","Unknown"),
            "timestamp": a.get("created_at", datetime.now(timezone.utc)).isoformat(),
            "plagiarismScore": a.get("result",{}).get("plagiarism",{}).get("score",0),
            "aiProbability": a.get("result",{}).get("ai",{}).get("probability",0)
        } for a in analyses]
        return jsonify({"history": history}), 200
    except Exception as e: return jsonify({"history": []}), 200

@app.route("/api/user/history", methods=["POST"])
@jwt_required()
def save_to_history():
    try:
        data = request.json
        ai_analyses_collection.insert_one({
            "user_id": ObjectId(get_jwt_identity()), "file_name": data.get("fileName"),
            "result": {"plagiarism": {"score": data.get("plagiarismScore",0)}, "ai": {"probability": data.get("aiProbability",0)}},
            "created_at": datetime.now(timezone.utc)
        })
        return jsonify({"message": "History saved"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/check-plagiarism", methods=["POST"])
@jwt_required()
def check_plagiarism():
    try:
        current_user = get_jwt_identity()
        if "file1" not in request.files: return jsonify({"error": "Main document required"}), 400
        file1 = request.files["file1"]
        reference_files = [f for f in request.files.getlist("file2") if f.filename]
        if not reference_files: return jsonify({"error": "At least one reference document required"}), 400

        file1_data = extract_text(file1)
        text1_raw = file1_data["clean_text"]
        html1 = file1_data["html_text"]
        text1_clean = clean_text(text1_raw)
        total_words = len(text1_raw.split())
        matched_sentence_count_total = 0
        comparisons = []

        for ref in reference_files:
            ref_data = extract_text(ref)
            ref_raw = ref_data["clean_text"]
            ref_html = ref_data["html_text"]
            ref_clean = clean_text(ref_raw)
            score = calculate_similarity(text1_clean, ref_clean)
            phrases = list(set(detect_exact_phrases(text1_raw, ref_raw, min_words=5)))
            matched_sentence_count_total += len(phrases)
            direct_words = sum(len(p.split()) for p in phrases)
            direct_pct = round(min(100, (direct_words / max(1, total_words)) * 100), 2)
            semantic_pct = round(max(0, score - direct_pct), 2)
            unique_pct = round(100 - score, 2)
            doc_risk = "High" if score > 60 else "Moderate" if score > 30 else "Low"
            h_main, h_ref = html1, ref_html
            for phrase in phrases[:30]:
                pat = re.compile(re.escape(phrase), re.IGNORECASE)
                h_main = pat.sub(f"<span style='background:#fee2e2;color:#991b1b;font-weight:500;padding:2px 4px;border-radius:4px;'>{phrase}</span>", h_main)
                h_ref = pat.sub(f"<span style='background:#fee2e2;color:#991b1b;font-weight:500;padding:2px 4px;border-radius:4px;'>{phrase}</span>", h_ref)
            try: h_main, h_ref = semantic_highlight(h_main, h_ref)
            except: pass
            comparisons.append({"filename": ref.filename, "score": score, "direct": direct_pct,
                "semantic": semantic_pct, "unique": unique_pct, "risk_level": doc_risk,
                "highlighted_main": h_main, "highlighted_ref": h_ref})

        if not comparisons: return jsonify({"error": "No valid files processed"}), 400
        comparisons.sort(key=lambda x: x["score"], reverse=True)
        highest_match = comparisons[0]
        avg_similarity = round(sum(x["score"] for x in comparisons) / len(comparisons), 2)
        overall_originality = round(100 - highest_match["score"], 2)
        risk = "High Plagiarism Risk" if highest_match["score"] > 60 else "Moderate Risk" if highest_match["score"] > 30 else "Low Risk"
        ai_result = ai_detector.analyze(text1_raw)
        try:
            ai_analyses_collection.insert_one({
                "user_id": ObjectId(current_user), "file_name": file1.filename,
                "result": {"plagiarism": {"score": highest_match["score"]}, "ai": {"probability": ai_result['probability']}},
                "created_at": datetime.now(timezone.utc)
            })
        except: pass
        return jsonify({
            "comparisons": comparisons, "highest_match": highest_match,
            "average_similarity": avg_similarity, "risk_level": risk, "confidence_level": risk,
            "ai_probability": ai_result['probability'],
            "ai_detailed": {"probability": ai_result['probability'], "risk_level": ai_result['risk_level'],
                "models": ai_result['models'], "total_indicators": ai_result['total_indicators']},
            "word_count": total_words, "matched_sentence_count": matched_sentence_count_total,
            "overall_originality": overall_originality,
            "similarity_ranking": [{"filename": c["filename"], "score": c["score"]} for c in comparisons],
            "match_density": round(matched_sentence_count_total / max(1, total_words), 4)
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def secure_fn(f): return re.sub(r'[^a-zA-Z0-9_.\-]','_', f)
def count_syllables(w):
    w=w.lower(); c=0; v='aeiou'
    if w and w[0] in v: c+=1
    for i in range(1,len(w)):
        if w[i] in v and w[i-1] not in v: c+=1
    if w.endswith('e'): c-=1
    if w.endswith('le') and len(w)>2 and w[-3] not in v: c+=1
    return max(1,c)
def count_complex(words): return sum(1 for w in words if count_syllables(w)>=3)
def extract_keywords(text, limit=20):
    stop={'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','is','are','was','were','been','has','had','did','does','am'}
    wf={}
    for w in text.lower().split():
        w=re.sub(r'[^\w]','',w)
        if w and len(w)>3 and w not in stop: wf[w]=wf.get(w,0)+1
    return [{'word':w,'count':c} for w,c in sorted(wf.items(),key=lambda x:-x[1])[:limit]]

def analyze_text_deep(text):
    import math
    words=text.split(); sentences=[s for s in text.split('.') if s.strip()]; paragraphs=[p for p in text.split('\n\n') if p.strip()]
    wc=len(words); sc=len(sentences) or 1; pc=len(paragraphs)
    uw=len(set(w.lower() for w in words))
    ld=(uw/wc*100) if wc else 0
    awl=sum(len(w) for w in words)/wc if wc else 0
    asl=wc/sc
    syl=sum(count_syllables(w) for w in words) if words else 0
    fk=206.835-1.015*asl-84.6*(syl/max(1,wc))
    gf=0.4*(asl+100*(count_complex(words)/max(1,wc)))
    return {'wordCount':wc,'charCount':len(text),'sentenceCount':sc,'paragraphCount':pc,
            'uniqueWords':uw,'lexicalDiversity':round(ld,2),'avgWordLength':round(awl,2),
            'avgSentenceLength':round(asl,2),'fleschKincaid':round(fk,2),'gunningFog':round(gf,2),
            'keywords':extract_keywords(text)[:10]}

def detect_ai_g(text):
    r=ai_detector.analyze(text)
    return {'probability':r['probability'],'riskLevel':r['risk_level'],'isAIGenerated':r['probability']>40,'models':r['models'],'indicators':[]}

def detect_sources(text):
    sources=[]
    for i,url in enumerate(re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', text)):
        try:
            p=urlparse(url)
            sources.append({'id':f'url-{i}','type':'URL','title':p.netloc.replace('www.',''),'url':url,'confidence':95,'relevance':85})
        except: pass
    for pat,fmt in [(r'\(([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?),\s*(\d{4})\)','APA'),(r'\[(\d+)\]','Numbered')]:
        for i,m in enumerate(re.finditer(pat, text)):
            sources.append({'id':f'cite-{len(sources)}','type':'Citation','title':m.group(),'format':fmt,'confidence':85,'relevance':90})
    return sources

def detect_images(text):
    imgs=[]
    def src(url):
        u=url.lower()
        if 'unsplash' in u: return 'Unsplash (Free)'
        if 'pexels' in u: return 'Pexels (Free)'
        if 'shutterstock' in u: return 'Shutterstock (Paid)'
        if 'wikimedia' in u or 'wikipedia' in u: return 'Wikimedia Commons'
        return 'Unknown Source'
    for i,m in enumerate(re.finditer(r'!\[.*?\]\((.*?)\)', text)):
        imgs.append({'id':f'img-{i}','url':m.group(1),'type':'Markdown','source':src(m.group(1))})
    for i,m in enumerate(re.finditer(r'<img.*?src=["\'](.*?)["\']', text, re.IGNORECASE)):
        imgs.append({'id':f'html-{i}','url':m.group(1),'type':'HTML','source':src(m.group(1))})
    return imgs

def detect_plagiarism_g(text):
    words=text.split(); seen=set(); dupes=[]
    for i in range(len(words)-5):
        ph=' '.join(words[i:i+5]).lower()
        if ph in seen:
            if ph not in dupes: dupes.append(ph)
        else: seen.add(ph)
    cit=len(re.findall(r'\([A-Za-z]+,\s*\d{4}\)|\[\d+\]', text))
    score=min(100, min(40,len(dupes)*5) + (30 if cit==0 and len(words)>200 else 0))
    risk='Critical' if score>70 else 'High' if score>50 else 'Medium' if score>30 else 'Low'
    return {'score':score,'originality':100-score,'riskLevel':risk,'duplicatePhrases':dupes[:5],'citationCount':cit,'quoteCount':len(re.findall(r'[""].*?[""]',text))}

def key_findings(stats, ai, plag):
    f=[]
    if plag['score']>50: f.append(f"⚠️ High plagiarism risk ({plag['score']}%)")
    if ai['probability']>50: f.append(f"🤖 Strong AI indicators ({ai['probability']}%)")
    if plag.get('duplicatePhrases'): f.append(f"🔄 {len(plag['duplicatePhrases'])} repeated phrases found")
    if stats['lexicalDiversity']<30: f.append(f"📝 Low vocabulary diversity ({stats['lexicalDiversity']}%)")
    return f[:5]

@app.route("/api/ai-guardian/analyze", methods=["POST"])
@jwt_required()
def ai_guardian_analyze():
    try:
        user_id = get_jwt_identity()
        if 'file' not in request.files: return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '': return jsonify({'error': 'No file selected'}), 400
        file_data = extract_text(file)
        content = file_data["clean_text"]
        stats = analyze_text_deep(content)
        ai_det = detect_ai_g(content)
        sources = detect_sources(content)
        images = detect_images(content)
        plag = detect_plagiarism_g(content)
        result = {
            'fileName': file.filename, 'uploadTime': datetime.now(timezone.utc).isoformat(),
            'stats': stats, 'ai': ai_det, 'sources': sources, 'images': images, 'plagiarism': plag,
            'summary': {'overallRisk': plag['riskLevel'] if plag['score']>ai_det['probability'] else ai_det['riskLevel'],
                        'keyFindings': key_findings(stats, ai_det, plag)}
        }
        try:
            ai_analyses_collection.insert_one({'user_id':ObjectId(user_id),'file_name':file.filename,'result':result,'created_at':datetime.now(timezone.utc)})
        except: pass
        return jsonify(result), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route("/api/ai-guardian/analyze-text", methods=["POST"])
@jwt_required()
def ai_guardian_analyze_text():
    try:
        text = request.json.get('text','')
        if not text: return jsonify({'error': 'No text provided'}), 400
        return jsonify({'stats':analyze_text_deep(text),'ai':detect_ai_g(text),'sources':detect_sources(text),'plagiarism':detect_plagiarism_g(text)}), 200
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route("/api/ai-guardian/history", methods=["GET"])
@jwt_required()
def ai_guardian_history():
    try:
        analyses = list(ai_analyses_collection.find({'user_id':ObjectId(get_jwt_identity())},sort=[('created_at',-1)],limit=20))
        return jsonify({'analyses':[{'id':str(a['_id']),'fileName':a.get('file_name'),'date':a.get('created_at').isoformat() if a.get('created_at') else None,'plagiarismScore':a.get('result',{}).get('plagiarism',{}).get('score'),'aiProbability':a.get('result',{}).get('ai',{}).get('probability')} for a in analyses]}), 200
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route("/api/ai-guardian/analysis/<analysis_id>", methods=["GET"])
@jwt_required()
def get_ai_analysis(analysis_id):
    try:
        a = ai_analyses_collection.find_one({'_id': ObjectId(analysis_id)})
        if not a: return jsonify({'error': 'Not found'}), 404
        return jsonify(a.get('result',{})), 200
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route("/health", methods=["GET"])
def health(): return jsonify({'status':'healthy','database':'plagiarismDB','timestamp':datetime.now(timezone.utc).isoformat()}), 200

if __name__ == "__main__":
    print("\n🚀 PlagiGuard Backend Starting on http://127.0.0.1:5000\n")
    app.run(debug=True, host='0.0.0.0', port=5000)

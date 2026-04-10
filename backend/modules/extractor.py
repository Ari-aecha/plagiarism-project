import os
import io

def extract_text(file):
    """Extract text and HTML from uploaded file."""
    filename = file.filename.lower()
    
    # Read file bytes
    file_bytes = file.read()
    file.seek(0)
    
    raw_text = ""
    
    try:
        if filename.endswith('.txt'):
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            
        elif filename.endswith('.pdf'):
            try:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    raw_text += page.extract_text() + "\n"
            except Exception as e:
                try:
                    from pdfminer.high_level import extract_text_to_fp
                    from pdfminer.layout import LAParams
                    output = io.StringIO()
                    extract_text_to_fp(io.BytesIO(file_bytes), output, laparams=LAParams())
                    raw_text = output.getvalue()
                except:
                    raw_text = file_bytes.decode('utf-8', errors='ignore')
                    
        elif filename.endswith('.docx'):
            try:
                from docx import Document
                doc = Document(io.BytesIO(file_bytes))
                for para in doc.paragraphs:
                    raw_text += para.text + "\n"
            except Exception as e:
                raw_text = file_bytes.decode('utf-8', errors='ignore')
                
        elif filename.endswith('.doc'):
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            
        elif filename.endswith('.rtf'):
            text = file_bytes.decode('utf-8', errors='ignore')
            import re
            raw_text = re.sub(r'\\[a-z]+\d* ?', '', text)
            raw_text = re.sub(r'[{}]', '', raw_text)
            
        else:
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            
    except Exception as e:
        raw_text = f"Error extracting text: {str(e)}"
    
    # Generate HTML version
    html_text = ""
    for para in raw_text.split('\n'):
        if para.strip():
            html_text += f"<p>{para.strip()}</p>\n"
    
    return {
        "clean_text": raw_text,
        "html_text": html_text or f"<p>{raw_text}</p>"
    }

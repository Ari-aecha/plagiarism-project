import re
import string

def clean_text(text):
    """Clean and normalize text for comparison."""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters but keep spaces and basic punctuation
    text = re.sub(r'[^\w\s.,!?;:-]', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove numbers (optional - helps with generic content matching)
    # text = re.sub(r'\b\d+\b', '', text)
    
    return text

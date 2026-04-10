import re

def detect_exact_phrases(text1, text2, min_words=5):
    """Detect exact matching phrases between two texts."""
    if not text1 or not text2:
        return []
    
    # Tokenize into sentences/phrases
    def get_ngrams(text, n):
        words = text.lower().split()
        ngrams = []
        for i in range(len(words) - n + 1):
            phrase = ' '.join(words[i:i+n])
            # Clean punctuation from phrase
            phrase = re.sub(r'[^\w\s]', '', phrase).strip()
            if phrase:
                ngrams.append(phrase)
        return ngrams
    
    matched_phrases = []
    
    # Get phrases of various lengths from text1
    text2_lower = text2.lower()
    
    for n in range(min_words, min(15, len(text1.split()) + 1)):
        ngrams = get_ngrams(text1, n)
        for phrase in ngrams:
            if len(phrase.split()) >= min_words and phrase in text2_lower:
                # Check it's not a substring of an already matched phrase
                is_sub = any(phrase in existing for existing in matched_phrases)
                if not is_sub:
                    # Remove shorter phrases that are substrings of this one
                    matched_phrases = [p for p in matched_phrases if p not in phrase]
                    matched_phrases.append(phrase)
    
    # Remove duplicates and sort by length
    unique_phrases = list(set(matched_phrases))
    unique_phrases.sort(key=len, reverse=True)
    
    return unique_phrases[:50]  # Return top 50 matches

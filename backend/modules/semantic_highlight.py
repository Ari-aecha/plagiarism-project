import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def semantic_highlight(html1, html2):
    """Add semantic similarity highlights to HTML content."""
    try:
        # Extract sentences from HTML
        def extract_sentences(html):
            text = re.sub(r'<[^>]+>', ' ', html)
            sentences = re.split(r'(?<=[.!?])\s+', text)
            return [s.strip() for s in sentences if len(s.strip()) > 20]
        
        sentences1 = extract_sentences(html1)
        sentences2 = extract_sentences(html2)
        
        if not sentences1 or not sentences2:
            return html1, html2
        
        # Find semantically similar sentence pairs
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        all_sentences = sentences1 + sentences2
        
        try:
            tfidf = vectorizer.fit_transform(all_sentences)
        except:
            return html1, html2
        
        tfidf1 = tfidf[:len(sentences1)]
        tfidf2 = tfidf[len(sentences1):]
        
        sim_matrix = cosine_similarity(tfidf1, tfidf2)
        
        highlighted_html1 = html1
        highlighted_html2 = html2
        
        SEMANTIC_THRESHOLD = 0.3
        
        for i, sent1 in enumerate(sentences1):
            for j, sent2 in enumerate(sentences2):
                sim = sim_matrix[i][j]
                if sim > SEMANTIC_THRESHOLD and sim < 0.95:  # Not exact match, but similar
                    if len(sent1) > 30:
                        escaped = re.escape(sent1[:50])
                        highlighted_html1 = re.sub(
                            escaped,
                            f"<span style='background:#fef3c7;color:#92400e;padding:2px 4px;border-radius:4px;'>{sent1[:50]}</span>",
                            highlighted_html1,
                            count=1
                        )
                    if len(sent2) > 30:
                        escaped = re.escape(sent2[:50])
                        highlighted_html2 = re.sub(
                            escaped,
                            f"<span style='background:#fef3c7;color:#92400e;padding:2px 4px;border-radius:4px;'>{sent2[:50]}</span>",
                            highlighted_html2,
                            count=1
                        )
        
        return highlighted_html1, highlighted_html2
        
    except Exception as e:
        return html1, html2

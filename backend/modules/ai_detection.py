import re
import math
from collections import Counter

class AIDetector:
    """Advanced AI content detection using multiple heuristics."""
    
    def __init__(self):
        self.ai_phrases = {
            'chatgpt': [
                (r'as an ai (?:language model|assistant)', 30),
                (r'i don\'t have personal opinions', 25),
                (r'based on my training data', 25),
                (r'i cannot provide|i\'m not able to provide', 20),
                (r'it\'s important to note that', 15),
                (r'in conclusion|to summarize|in summary', 12),
                (r'furthermore|moreover|additionally', 8),
                (r'as of my last (?:knowledge|update|training)', 20),
                (r'i hope this (?:helps|assists|is helpful)', 10),
                (r'please let me know if you (?:need|have|require)', 10),
                (r'i\'m here to (?:help|assist|support)', 10),
                (r'it\'s worth noting', 12),
                (r'it is important to consider', 12),
                (r'there are several (?:key|important|main)', 10),
            ],
            'claude': [
                (r'i aim to be (?:helpful|harmless|honest)', 25),
                (r'i\'d be happy to|i am happy to', 20),
                (r'i don\'t have enough (?:context|information)', 25),
                (r'that\'s an (?:excellent|great|good) question', 20),
                (r'i appreciate your (?:question|patience|understanding)', 15),
                (r'i\'ll do my best|i will do my best', 15),
                (r'let me (?:think about|consider|reflect on) that', 15),
                (r'i\'m (?:designed|built|programmed) to', 20),
                (r'i should note that', 12),
                (r'i want to be (?:clear|transparent)', 12),
            ],
            'gemini': [
                (r'i\'m still learning|i am still learning', 25),
                (r'i can\'t answer that|i cannot answer that', 25),
                (r'let me think about that', 15),
                (r'here\'s what i know|here is what i know', 15),
                (r'i understand your (?:question|concern|query)', 15),
                (r'that\'s a (?:great|good|interesting) (?:question|point)', 15),
                (r'as a large language model', 20),
            ],
            'llama': [
                (r'i think|i believe|in my opinion', 8),
                (r'from my perspective|as i see it', 12),
                (r'i would say|i would argue', 12),
                (r'let me explain|let me clarify', 8),
                (r'to be more specific', 10),
            ]
        }
    
    def _calculate_perplexity_score(self, text):
        """Estimate text predictability (lower = more AI-like)."""
        words = text.lower().split()
        if len(words) < 10:
            return 50
        
        word_freq = Counter(words)
        total = len(words)
        unique = len(word_freq)
        
        # High vocabulary diversity = more human
        diversity = unique / total
        
        # Measure sentence length variance
        sentences = re.split(r'[.!?]+', text)
        lengths = [len(s.split()) for s in sentences if s.strip()]
        
        if len(lengths) < 2:
            return 40
        
        mean_len = sum(lengths) / len(lengths)
        variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
        std_dev = math.sqrt(variance)
        
        # AI tends to have lower variance in sentence length
        variance_score = min(50, std_dev * 3)
        diversity_score = min(50, diversity * 100)
        
        return max(0, 100 - variance_score - diversity_score)
    
    def _detect_ai_patterns(self, text):
        """Detect known AI patterns."""
        text_lower = text.lower()
        word_count = len(text.split())
        
        results = {}
        total_score = 0
        
        for model, patterns in self.ai_phrases.items():
            model_score = 0
            matches = []
            
            for pattern, weight in patterns:
                found = re.findall(pattern, text_lower)
                if found:
                    model_score += len(found) * weight
                    matches.append({
                        'pattern': pattern,
                        'count': len(found)
                    })
            
            results[model] = {
                'score': model_score,
                'matches': matches,
                'confidence': min(100, int((model_score / max(1, word_count)) * 200))
            }
            total_score += model_score
        
        return results, total_score
    
    def _check_structural_patterns(self, text):
        """Check for AI structural patterns."""
        score = 0
        
        # Check for excessive bullet points / numbered lists
        bullet_count = len(re.findall(r'^\s*[-•*]\s|\d+\.\s', text, re.MULTILINE))
        if bullet_count > 5:
            score += min(20, bullet_count * 2)
        
        # Check for excessive headers
        header_count = len(re.findall(r'^#+\s|\*\*[^*]+\*\*:', text, re.MULTILINE))
        if header_count > 3:
            score += min(15, header_count * 3)
        
        # Check for overly formal transition words
        formal_transitions = ['furthermore', 'moreover', 'additionally', 'consequently',
                             'therefore', 'thus', 'hence', 'accordingly', 'subsequently',
                             'nevertheless', 'nonetheless', 'notwithstanding']
        trans_count = sum(1 for word in formal_transitions if word in text.lower())
        score += min(25, trans_count * 5)
        
        # Check for disclaimer-like language
        disclaimers = ['it should be noted', 'it is important to note', 'please note that',
                      'it is worth mentioning', 'it is crucial to understand']
        disc_count = sum(1 for d in disclaimers if d in text.lower())
        score += min(20, disc_count * 8)
        
        return score
    
    def analyze(self, text):
        """Full AI detection analysis."""
        if not text or len(text.strip()) < 50:
            return {
                'probability': 0,
                'risk_level': 'Low',
                'models': [],
                'total_indicators': 0,
                'perplexity_score': 0,
                'structural_score': 0
            }
        
        word_count = len(text.split())
        
        # Get pattern scores
        model_results, pattern_score = self._detect_ai_patterns(text)
        
        # Get perplexity score  
        perplexity_score = self._calculate_perplexity_score(text)
        
        # Get structural score
        structural_score = self._check_structural_patterns(text)
        
        # Combine scores
        max_pattern = word_count * 15
        pattern_probability = min(60, int((pattern_score / max(1, max_pattern)) * 100))
        perplexity_probability = min(25, int(perplexity_score * 0.25))
        structural_probability = min(15, int(structural_score * 0.15))
        
        total_probability = min(100, pattern_probability + perplexity_probability + structural_probability)
        
        # Determine risk level
        if total_probability > 70:
            risk_level = 'Critical'
        elif total_probability > 50:
            risk_level = 'High'
        elif total_probability > 30:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
        
        # Count total indicators
        total_indicators = sum(
            len(data['matches']) for data in model_results.values()
        )
        
        return {
            'probability': total_probability,
            'risk_level': risk_level,
            'models': [
                {
                    'name': 'ChatGPT/GPT-4',
                    'confidence': model_results['chatgpt']['confidence'],
                    'matches': len(model_results['chatgpt']['matches'])
                },
                {
                    'name': 'Claude',
                    'confidence': model_results['claude']['confidence'],
                    'matches': len(model_results['claude']['matches'])
                },
                {
                    'name': 'Gemini',
                    'confidence': model_results['gemini']['confidence'],
                    'matches': len(model_results['gemini']['matches'])
                },
                {
                    'name': 'LLaMA',
                    'confidence': model_results['llama']['confidence'],
                    'matches': len(model_results['llama']['matches'])
                }
            ],
            'total_indicators': total_indicators,
            'perplexity_score': perplexity_score,
            'structural_score': structural_score
        }


def ai_detection_score(text):
    """Legacy function for backward compatibility."""
    detector = AIDetector()
    result = detector.analyze(text)
    return result['probability']

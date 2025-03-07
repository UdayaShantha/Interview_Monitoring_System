from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import spacy

# Load models
sbert_model = SentenceTransformer('all-mpnet-base-v2')
nlp = spacy.load("en_core_web_sm")
nli_pipeline = pipeline("zero-shot-classification", model="roberta-large-mnli")

def keyword_score(answer, keywords, threshold=0.65):
    answer = nlp(answer.lower())
    matched = 0
    for keyword in keywords:
        keyword_embedding = sbert_model.encode([keyword], convert_to_tensor=True)
        for token in answer:
            token_embedding = sbert_model.encode([token.text], convert_to_tensor=True)
            similarity = util.pytorch_cos_sim(keyword_embedding, token_embedding).item()
            if similarity >= threshold:
                matched += 1
                break
    return matched / len(keywords)

def semantic_score(question, answer):
    # Sentence similarity
    embeddings = sbert_model.encode([question, answer])
    similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1]).item()

    # NLI entailment check
    # Updated hypothesis_template with {} placeholder
    result = nli_pipeline(answer, candidate_labels=["correct", "incorrect"],
                          hypothesis_template="This answer is {} to the question: {}.".format("{}", question))
    nli_score = result['scores'][result['labels'].index('correct')]

    return (similarity + nli_score) / 2  # Average of both

def final_accuracy(question, answer, keywords, keyword_weight=0.35):
    k_score = keyword_score(answer, keywords)
    s_score = semantic_score(question, answer)
    return (k_score * keyword_weight) + (s_score * (1 - keyword_weight))

# Example usage
question = "What are the benefits of using containerization in application deployment?"
answer = "Containerization offers benefits like improved application scalability, portability, and efficiency. It enables consistent environments across development, testing, and production by packaging applications along with their dependencies. This reduces compatibility issues, accelerates deployment cycles, and improves resource utilization. Tools like Docker and Kubernetes aid in managing containerized applications, making it easier to build, deploy, and scale applications in cloud-native architectures."
keywords = ['Containerization', 'Scalability', 'Portability', 'Efficiency', 'Docker', 'Kubernetes', 'Cloud-native', 'Application Deployment']

accuracy = final_accuracy(question, answer, keywords)
print(f"Accuracy: {accuracy * 100:.2f}%")
from flask import Flask, request, jsonify
import pandas as pd
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ast

app = Flask(__name__)
# Enable logging
logging.basicConfig(level=logging.INFO)

# Load data from CSV files
STUDENTS_CSV = 'students_with_recommendations.csv'
COURSES_CSV = 'courses_with_objectids.csv'

students_df = pd.read_csv(STUDENTS_CSV)
courses_df = pd.read_csv(COURSES_CSV)

# Convert 'courses' from stringified lists to actual lists
students_df['courses'] = students_df['courses'].apply(ast.literal_eval)

# Create a mapping of course IDs to titles from the courses dataset
course_id_to_title = dict(zip(courses_df['_id'], courses_df['title']))

# Add a textual feature vector for courses to calculate similarities (title + description)
courses_df['text_features'] = courses_df['title'] + ' ' + courses_df['description']
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(courses_df['text_features'])

# Calculate course similarities using cosine similarity
course_similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Map course IDs to their index in the similarity matrix
course_id_to_index = {course_id: idx for idx, course_id in enumerate(courses_df['_id'])}

def recommend_courses_for_student(enrolled_courses, num_recommendations=5):
    """Generate course recommendations for a single student."""
    if not enrolled_courses:
        return courses_df.sample(n=num_recommendations)['title'].tolist()

    # Collect indices of enrolled courses
    enrolled_indices = [course_id_to_index[course_id] for course_id in enrolled_courses if course_id in course_id_to_index]

    if not enrolled_indices:
        return courses_df.sample(n=num_recommendations)['title'].tolist()

    # Calculate average similarity scores for non-enrolled courses
    similarity_scores = course_similarity[enrolled_indices].mean(axis=0)
    non_enrolled_indices = set(range(len(courses_df))) - set(enrolled_indices)

    # Rank non-enrolled courses by similarity score
    ranked_indices = sorted(non_enrolled_indices, key=lambda idx: similarity_scores[idx], reverse=True)
    recommended_titles = [courses_df.iloc[idx]['title'] for idx in ranked_indices[:num_recommendations]]

    return recommended_titles

@app.route('/recommend', methods=['POST'])
def recommend():
    """Handle course recommendation requests."""
    data = request.get_json()

    # Log the incoming payload
    app.logger.info(f"Received payload: {data}")

    try:
        user_id = data['userId']
        user_courses = data.get('courses', [])
    except Exception as e:
        app.logger.error(f"Error parsing input data: {e}")
        return jsonify({"error": "Invalid input format"}), 400

    # Generate recommendations
    try:
        recommendations = recommend_courses_for_student(user_courses)
        app.logger.info(f"Recommendations: {recommendations}")
        return jsonify(recommendations)
    except Exception as e:
        app.logger.error(f"Error generating recommendations: {e}")
        return jsonify({"error": "Error generating recommendations"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=6000)

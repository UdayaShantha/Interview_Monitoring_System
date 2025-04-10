

import { useState } from "react"
import "./feedback.css"

export default function FeedbackPage() {
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ rating, comment })
    // Add your submission logic here
  }

  const handleCancel = () => {
    setRating(4)
    setComment("")
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-content">
          {/* Thank you message */}
          <div className="thank-you">
            <h1 className="thank-you__title">THANK YOU!</h1>
            <div className="thank-you__message">
              <div className="thank-you__icon">
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Your answers submitted successfully</p>
            </div>
          </div>

          {/* Feedback form */}
          <div className="feedback-form-container">
            <form onSubmit={handleSubmit} className="feedback-form">
              <h2 className="feedback-form__title">Share Your Experience in Scaling</h2>

              {/* Star rating */}
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="star-rating__button">
                    <svg
                      className={`star-icon ${star <= rating ? "star-icon--active" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Comment box */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comments..."
                className="feedback-form__textarea"
              />

              {/* Buttons */}
              <div className="feedback-form__buttons">
                <button type="button" onClick={handleCancel} className="button button--secondary">
                  Cancel
                </button>
                <button type="submit" className="button button--primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


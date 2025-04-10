"use client"

import { useState } from "react"
import { Star } from "lucide-react"

export default function FeedbackSuccess() {
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
    <div className="min-h-screen bg-[#98B2A0] p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#f5f5f5] rounded-3xl shadow-xl">
        <div className="p-8 space-y-6">
          {/* Thank you section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-emerald-600">THANK YOU!</h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg">Your answers submitted successfully</p>
            </div>
          </div>

          {/* Feedback form */}
          <div className="bg-gray-400/30 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-center text-gray-700 font-medium">Share Your Experience in Scaling</h2>

              {/* Star rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment box */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comments..."
                className="w-full min-h-[120px] p-3 rounded-lg bg-white border-0 focus:ring-2 focus:ring-emerald-600 resize-none"
              />

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                >
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


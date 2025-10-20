import React from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment Cancelled
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your payment was cancelled. You can try again anytime.
          </p>
          <div className="mt-6">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="text-sm text-yellow-700">
                <strong>No worries!</strong>
                <br />
                You can upgrade your account anytime from your dashboard.
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.history.back()}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Payment Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel


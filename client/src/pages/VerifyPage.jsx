import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

const VerifyPage = () => {
  const [searchParams] = useSearchParams()
  const [testData, setTestData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const tid = searchParams.get('tid')

  useEffect(() => {
    if (tid) {
      fetchTestData()
    } else {
      setError('No test ID provided')
      setLoading(false)
    }
  }, [tid])

  const fetchTestData = async () => {
    try {
      const response = await axios.get(`/api/certificate/verify/${tid}`)
      setTestData(response.data)
    } catch (err) {
      console.error('Error fetching test data:', err)
      if (err.response?.status === 404) {
        setError('Certificate not found or invalid test ID')
      } else {
        setError('Failed to verify certificate')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              Verification Failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                IELTS Certificate Verification
              </h1>
              <p className="text-gray-600">
                This certificate has been verified and is authentic
              </p>
            </div>

            {/* Certificate Details */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Test Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Test Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Test ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{testData.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Skill</dt>
                      <dd className="text-sm text-gray-900 capitalize">{testData.skill}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Test Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(testData.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verification Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Scores */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Test Scores
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Overall Band Score</span>
                      <span className="text-lg font-bold text-blue-600">{testData.score.overall}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {testData.skill === 'writing' ? 'Task Response' : 'Fluency'}
                      </span>
                      <span className="text-lg font-bold text-green-600">{testData.score.task}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Coherence & Cohesion</span>
                      <span className="text-lg font-bold text-yellow-600">{testData.score.coherence}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Lexical Resource</span>
                      <span className="text-lg font-bold text-red-600">{testData.score.lexical}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Grammar Range & Accuracy</span>
                      <span className="text-lg font-bold text-purple-600">{testData.score.grammar}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AI Examiner Feedback
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {testData.feedback}
                  </p>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Verified by Antoree IELTS Platform</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    This certificate was generated and verified on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage

import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const ProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No test data available</div>
        <div className="text-sm text-gray-400">
          Complete some tests to see your progress chart
        </div>
      </div>
    )
  }

  // Check if we have Writing data
  const hasWritingData = data.some(item => item.writing !== null)

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            domain={[0, 9]} 
            stroke="#666"
            fontSize={12}
            tickCount={10}
            tick={{ fontSize: 11 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [
              `${value} Band`,
              name === 'overall' ? 'Overall Score' : 'Writing Score'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          
          {/* Overall Score Line */}
          <Line 
            type="monotone" 
            dataKey="overall" 
            stroke="#35b86d"
            strokeWidth={3}
            dot={{ fill: '#35b86d', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#35b86d', strokeWidth: 2 }}
            name="Overall Score"
          />
          
          {/* Writing Score Line (only if we have writing data) */}
          {hasWritingData && (
            <Line 
              type="monotone" 
              dataKey="writing" 
              stroke="#9ca3af"
              strokeWidth={2}
              dot={{ fill: '#9ca3af', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#9ca3af', strokeWidth: 2 }}
              name="Writing Score"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProgressChart


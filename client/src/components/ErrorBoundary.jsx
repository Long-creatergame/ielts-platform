import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Optional: send to monitoring service
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🛟</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Đang cập nhật hệ thống. Vui lòng thử lại sau vài phút.</h2>
            <p className="text-gray-600 mb-4">Chúng tôi đang nỗ lực sửa chữa. Nếu vấn đề vẫn tiếp diễn, hãy liên hệ hỗ trợ.</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Tải lại trang
              </button>
              <button 
                onClick={() => (window.location.href = '/dashboard')} 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Về Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
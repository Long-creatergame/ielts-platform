import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const helpContent = {
  overview: {
    title: "Tổng quan (Overview)",
    steps: [
      "Xem tiến độ học và điểm trung bình hiện tại.",
      "Theo dõi mục tiêu Band và cấp độ hiện tại.",
      "Xem số bài test đã hoàn thành và chuỗi ngày học.",
      "Nhận thông báo từ AI Coach và đề xuất học tập."
    ]
  },
  skills: {
    title: "Luyện tập kỹ năng (Skills)",
    steps: [
      "Chọn kỹ năng Reading, Listening, Writing hoặc Speaking.",
      "Làm bài theo chuẩn Cambridge và nhận phản hồi từ AI.",
      "Bạn có thể chọn 'Full Test' để luyện 4 kỹ năng cùng lúc.",
      "Xem kết quả chi tiết và gợi ý cải thiện sau mỗi bài test."
    ]
  },
  insights: {
    title: "Phân tích & Gợi ý (Insights)",
    steps: [
      "Xem các điểm yếu theo từng kỹ năng.",
      "Nhận gợi ý học tập và bài luyện bổ sung.",
      "AI sẽ tự động đề xuất hướng cải thiện phù hợp nhất.",
      "Theo dõi tiến độ cải thiện qua thời gian."
    ]
  },
  path: {
    title: "Lộ trình học (Learning Path)",
    steps: [
      "Theo dõi lộ trình học dựa trên cấp độ hiện tại.",
      "Nhận nhiệm vụ từng tuần để đạt Band mục tiêu.",
      "Tự động cập nhật khi bạn hoàn thành bài luyện.",
      "Xem biểu đồ tiến độ và mục tiêu CEFR."
    ]
  },
  history: {
    title: "Kết quả & Bài test (History)",
    steps: [
      "Xem lại toàn bộ bài test đã làm.",
      "Kiểm tra điểm từng kỹ năng và phản hồi chi tiết từ AI.",
      "So sánh kết quả qua các lần thi để thấy tiến bộ.",
      "Bạn có thể tải lại bài test hoặc chia sẻ kết quả."
    ]
  }
};

export default function HelpPopover({ currentTab = "overview", title, content }) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Get contextual help content based on current tab
  const contextualHelp = helpContent[currentTab] || helpContent["overview"];

  // Use custom content if provided, otherwise use contextual help
  const displayContent = content || (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#35b86d] mb-4">
        {title || contextualHelp.title}
      </h3>
      <ol className="list-decimal pl-5 text-gray-700 space-y-2 text-sm">
        {contextualHelp.steps.map((step, i) => (
          <li key={i} className="leading-relaxed">{step}</li>
        ))}
      </ol>
      <div className="mt-4 p-3 bg-[#35b86d]/10 rounded-lg border border-[#35b86d]/20">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Hoàn thành bài test thường xuyên để theo dõi tiến độ và nhận gợi ý tốt hơn từ AI.
        </p>
      </div>
    </div>
  );

  const overlayContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      style={{
        WebkitBackdropFilter: 'blur(4px)', // iOS Safari support
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 animate-fadeIn relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {displayContent}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={() => setOpen(false)}
          aria-label="Close help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  const overlayRoot = document.getElementById('overlay-root');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#35b86d] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2ea25f] transition-colors shadow-sm flex items-center gap-1"
        aria-label="Show help"
      >
        <span>❓</span>
        <span>Help</span>
      </button>
      {open && overlayRoot && createPortal(overlayContent, overlayRoot)}
    </>
  );
}


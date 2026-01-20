export const dashboardSteps = [
  {
    target: '[data-tour="dashboard-welcome"]',
    content: 'Chào mừng bạn! Đây là Dashboard — nơi bạn xem tiến độ và bắt đầu làm bài.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-start-test"]',
    content: 'Bấm “Start a new Writing Task” để vào làm bài (phần viết).',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    content: 'Các chỉ số ở đây giúp bạn theo dõi số bài đã nộp và band trung bình.',
  },
  {
    target: '[data-tour="dashboard-history"]',
    content: 'Lịch sử bài nộp giúp bạn xem lại đề và kết quả gần đây.',
  },
  {
    target: '[data-tour="dashboard-replay"]',
    content: 'Bạn có thể “Xem lại hướng dẫn” bất cứ lúc nào.',
  },
];

export const testSteps = [
  {
    target: '[data-tour="test-intro"]',
    content: 'Đây là màn hình làm bài. Bạn nhập đề, chọn level và viết bài trước khi nộp.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="test-rules"]',
    content: 'Mẹo nhỏ: khi đang làm bài, hạn chế refresh trang để tránh mất nội dung.',
  },
  {
    target: '[data-tour="test-prompt"]',
    content: 'Dán/nhập đề bài ở đây. Bạn có thể thay đổi đề nếu muốn luyện thêm.',
  },
  {
    target: '[data-tour="test-level"]',
    content: 'Chọn level để feedback phù hợp hơn với trình độ hiện tại của bạn.',
  },
  {
    target: '[data-tour="test-essay"]',
    content: 'Viết bài tại đây. Gợi ý: cố gắng đủ ý và rõ lập luận trước khi nộp.',
  },
  {
    target: '[data-tour="test-submit"]',
    content: 'Bấm để nộp bài và nhận chấm điểm AI. Nếu mạng chậm, hãy chờ vài giây.',
  },
];

export const resultSteps = [
  {
    target: '[data-tour="result-card"]',
    content: 'Đây là phần kết quả sau khi nộp bài.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="result-overall"]',
    content: 'Band Overall là điểm tổng quan. Hãy dùng để theo dõi tiến bộ theo thời gian.',
  },
  {
    target: '[data-tour="result-metrics"]',
    content: 'Các tiêu chí giúp bạn biết yếu ở đâu: Task Response, Coherence, Lexical, Grammar.',
  },
  {
    target: '[data-tour="result-feedback"]',
    content: 'Đọc feedback và chọn 1–2 điểm cần sửa trước khi luyện bài tiếp theo.',
  },
  {
    target: '[data-tour="result-next"]',
    content: 'Bạn có thể làm lại bài khác và xem lịch sử trong Dashboard để so sánh tiến bộ.',
  },
];


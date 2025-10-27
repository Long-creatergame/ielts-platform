import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Language resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.tests': 'Tests',
      'nav.practice': 'Practice',
      'nav.history': 'History',
      'nav.profile': 'Profile',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      
      // Common
      'common.start': 'Start',
      'common.submit': 'Submit',
      'common.next': 'Next',
      'common.back': 'Back',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.name': 'Name',
      
      // Dashboard
      'dashboard.welcome': 'Welcome back!',
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.recentTests': 'Recent Tests',
      
      // Test
      'test.startTest': 'Start Test',
      'test.timeRemaining': 'Time Remaining',
      'test.submit': 'Submit Test',
      'test.result': 'Test Result',
      'test.bandScore': 'Band Score',
      
      // Common additional
      'common.help': 'Help',
      'common.tests': 'Take Test',
      'common.target': 'Target',
      'common.current': 'Current',
      'common.noTestsYet': 'No tests yet',
    }
  },
  vi: {
    translation: {
      // Navigation
      'nav.home': 'Trang chủ',
      'nav.dashboard': 'Bảng điều khiển',
      'nav.tests': 'Bài kiểm tra',
      'nav.practice': 'Luyện tập',
      'nav.history': 'Lịch sử',
      'nav.profile': 'Hồ sơ',
      'nav.login': 'Đăng nhập',
      'nav.register': 'Đăng ký',
      'nav.logout': 'Đăng xuất',
      
      // Common
      'common.start': 'Bắt đầu',
      'common.submit': 'Gửi',
      'common.next': 'Tiếp theo',
      'common.back': 'Quay lại',
      'common.save': 'Lưu',
      'common.cancel': 'Hủy',
      'common.loading': 'Đang tải...',
      'common.error': 'Lỗi',
      'common.success': 'Thành công',
      
      // Auth
      'auth.login': 'Đăng nhập',
      'auth.register': 'Đăng ký',
      'auth.email': 'Email',
      'auth.password': 'Mật khẩu',
      'auth.confirmPassword': 'Xác nhận mật khẩu',
      'auth.forgotPassword': 'Quên mật khẩu?',
      'auth.signIn': 'Đăng nhập',
      'auth.signUp': 'Đăng ký',
      'auth.name': 'Tên',
      
      // Dashboard
      'dashboard.welcome': 'Chào mừng trở lại!',
      'dashboard.quickActions': 'Thao tác nhanh',
      'dashboard.recentTests': 'Bài kiểm tra gần đây',
      
      // Test
      'test.startTest': 'Bắt đầu kiểm tra',
      'test.timeRemaining': 'Thời gian còn lại',
      'test.submit': 'Nộp bài',
      'test.result': 'Kết quả kiểm tra',
      'test.bandScore': 'Điểm Band',
      
      // Common additional
      'common.help': 'Trợ giúp',
      'common.tests': 'Chọn bài kiểm tra',
      'common.target': 'Mục tiêu',
      'common.current': 'Hiện tại',
      'common.noTestsYet': 'Chưa có bài kiểm tra',
    }
  },
  zh: {
    translation: {
      // Navigation
      'nav.home': '首页',
      'nav.dashboard': '仪表板',
      'nav.tests': '测试',
      'nav.practice': '练习',
      'nav.history': '历史记录',
      'nav.profile': '个人资料',
      'nav.login': '登录',
      'nav.register': '注册',
      'nav.logout': '登出',
      
      // Common
      'common.start': '开始',
      'common.submit': '提交',
      'common.next': '下一步',
      'common.back': '返回',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.loading': '加载中...',
      'common.error': '错误',
      'common.success': '成功',
      
      // Auth
      'auth.login': '登录',
      'auth.register': '注册',
      'auth.email': '电子邮件',
      'auth.password': '密码',
      'auth.confirmPassword': '确认密码',
      'auth.forgotPassword': '忘记密码？',
      'auth.signIn': '登录',
      'auth.signUp': '注册',
      'auth.name': '姓名',
      
      // Dashboard
      'dashboard.welcome': '欢迎回来！',
      'dashboard.quickActions': '快速操作',
      'dashboard.recentTests': '最近的测试',
      
      // Test
      'test.startTest': '开始测试',
      'test.timeRemaining': '剩余时间',
      'test.submit': '提交测试',
      'test.result': '测试结果',
      'test.bandScore': '分数等级',
    }
  },
  ja: {
    translation: {
      // Navigation
      'nav.home': 'ホーム',
      'nav.dashboard': 'ダッシュボード',
      'nav.tests': 'テスト',
      'nav.practice': '練習',
      'nav.history': '履歴',
      'nav.profile': 'プロフィール',
      'nav.login': 'ログイン',
      'nav.register': '登録',
      'nav.logout': 'ログアウト',
      
      // Common
      'common.start': '開始',
      'common.submit': '送信',
      'common.next': '次へ',
      'common.back': '戻る',
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'common.loading': '読み込み中...',
      'common.error': 'エラー',
      'common.success': '成功',
      
      // Auth
      'auth.login': 'ログイン',
      'auth.register': '登録',
      'auth.email': 'メール',
      'auth.password': 'パスワード',
      'auth.confirmPassword': 'パスワード確認',
      'auth.forgotPassword': 'パスワードをお忘れですか？',
      'auth.signIn': 'ログイン',
      'auth.signUp': '登録',
      'auth.name': '名前',
      
      // Dashboard
      'dashboard.welcome': 'おかえりなさい！',
      'dashboard.quickActions': 'クイックアクション',
      'dashboard.recentTests': '最近のテスト',
      
      // Test
      'test.startTest': 'テスト開始',
      'test.timeRemaining': '残り時間',
      'test.submit': '送信',
      'test.result': 'テスト結果',
      'test.bandScore': 'バンドスコア',
    }
  },
  ko: {
    translation: {
      // Navigation
      'nav.home': '홈',
      'nav.dashboard': '대시보드',
      'nav.tests': '테스트',
      'nav.practice': '연습',
      'nav.history': '기록',
      'nav.profile': '프로필',
      'nav.login': '로그인',
      'nav.register': '가입',
      'nav.logout': '로그아웃',
      
      // Common
      'common.start': '시작',
      'common.submit': '제출',
      'common.next': '다음',
      'common.back': '뒤로',
      'common.save': '저장',
      'common.cancel': '취소',
      'common.loading': '로딩 중...',
      'common.error': '오류',
      'common.success': '성공',
      
      // Auth
      'auth.login': '로그인',
      'auth.register': '가입',
      'auth.email': '이메일',
      'auth.password': '비밀번호',
      'auth.confirmPassword': '비밀번호 확인',
      'auth.forgotPassword': '비밀번호를 잊으셨나요?',
      'auth.signIn': '로그인',
      'auth.signUp': '가입',
      'auth.name': '이름',
      
      // Dashboard
      'dashboard.welcome': '다시 오신 것을 환영합니다!',
      'dashboard.quickActions': '빠른 작업',
      'dashboard.recentTests': '최근 테스트',
      
      // Test
      'test.startTest': '테스트 시작',
      'test.timeRemaining': '남은 시간',
      'test.submit': '제출',
      'test.result': '테스트 결과',
      'test.bandScore': '밴드 점수',
    }
  }
};

i18n
  .use(LanguageDetector) // Detect language from browser
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;

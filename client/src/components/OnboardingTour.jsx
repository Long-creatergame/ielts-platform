import Joyride, { STATUS, EVENTS } from 'react-joyride';

export default function OnboardingTour({ steps, run, onFinish, onSkip }) {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      disableOverlayClose
      scrollToFirstStep
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#2563eb',
          textColor: '#0f172a',
        },
      }}
      locale={{
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Xong',
        next: 'Tiếp',
        skip: 'Bỏ qua',
      }}
      callback={(data) => {
        const { status, type } = data;

        // Graceful fallback: if a target is missing, Joyride emits an error event.
        // We just let it continue; Joyride will advance to next step automatically.
        if (type === EVENTS.TARGET_NOT_FOUND) {
          return;
        }

        if (status === STATUS.SKIPPED) {
          onSkip?.();
          return;
        }
        if (status === STATUS.FINISHED) {
          onFinish?.();
        }
      }}
    />
  );
}


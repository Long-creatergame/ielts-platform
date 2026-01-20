import Joyride, { STATUS, EVENTS } from 'react-joyride';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function OnboardingTour({ steps, run, onFinish, onSkip }) {
  const { t } = useTranslation();
  const locale = useMemo(
    () => ({
      back: t('joyride.back', { defaultValue: 'Back' }),
      close: t('joyride.close', { defaultValue: 'Close' }),
      last: t('joyride.last', { defaultValue: 'Done' }),
      next: t('joyride.next', { defaultValue: 'Next' }),
      skip: t('joyride.skip', { defaultValue: 'Skip' }),
    }),
    [t]
  );

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
      locale={locale}
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


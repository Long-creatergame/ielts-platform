export function getDashboardSteps(t) {
  return [
    {
      target: '[data-tour="dashboard-welcome"]',
      content: t('onboarding.dashboard.step1'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-start-test"]',
      content: t('onboarding.dashboard.step2'),
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: t('onboarding.dashboard.step3'),
    },
    {
      target: '[data-tour="dashboard-history"]',
      content: t('onboarding.dashboard.step4'),
    },
    {
      target: '[data-tour="dashboard-replay"]',
      content: t('onboarding.dashboard.step5'),
    },
  ];
}

export function getTestSteps(t) {
  return [
    {
      target: '[data-tour="test-intro"]',
      content: t('onboarding.test.step1'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="test-rules"]',
      content: t('onboarding.test.step2'),
    },
    {
      target: '[data-tour="test-prompt"]',
      content: t('onboarding.test.step3'),
    },
    {
      target: '[data-tour="test-level"]',
      content: t('onboarding.test.step4'),
    },
    {
      target: '[data-tour="test-essay"]',
      content: t('onboarding.test.step5'),
    },
    {
      target: '[data-tour="test-submit"]',
      content: t('onboarding.test.step6'),
    },
  ];
}

export function getResultSteps(t) {
  return [
    {
      target: '[data-tour="result-card"]',
      content: t('onboarding.result.step1'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="result-overall"]',
      content: t('onboarding.result.step2'),
    },
    {
      target: '[data-tour="result-metrics"]',
      content: t('onboarding.result.step3'),
    },
    {
      target: '[data-tour="result-feedback"]',
      content: t('onboarding.result.step4'),
    },
    {
      target: '[data-tour="result-next"]',
      content: t('onboarding.result.step5'),
    },
  ];
}


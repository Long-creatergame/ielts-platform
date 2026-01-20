import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';

const LS_KEY = 'onboarding_v1';

const defaultFlags = {
  dashboardDone: false,
  testDone: false,
  resultDone: false,
};

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadLocal() {
  const raw = localStorage.getItem(LS_KEY);
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== 'object') return { ...defaultFlags };
  return {
    dashboardDone: !!parsed.dashboardDone,
    testDone: !!parsed.testDone,
    resultDone: !!parsed.resultDone,
  };
}

function saveLocal(flags) {
  localStorage.setItem(LS_KEY, JSON.stringify(flags));
}

function hasToken() {
  return !!localStorage.getItem('token');
}

export function useOnboarding() {
  const [flags, setFlags] = useState(() => loadLocal());
  const [loaded, setLoaded] = useState(false);

  // Force-run state for replay
  const [forcedSegment, setForcedSegment] = useState(null); // 'dashboard'|'test'|'result'|null
  const [persistOnFinish, setPersistOnFinish] = useState(true);

  const refresh = useCallback(async () => {
    const local = loadLocal();
    setFlags(local);

    if (!hasToken()) {
      setLoaded(true);
      return;
    }

    try {
      const { data } = await api.get('/dashboard/me');
      const remote = data?.data?.onboarding;
      const merged = {
        dashboardDone: !!(remote?.dashboardDone ?? local.dashboardDone),
        testDone: !!(remote?.testDone ?? local.testDone),
        resultDone: !!(remote?.resultDone ?? local.resultDone),
      };
      setFlags(merged);
      saveLocal(merged);
    } catch (_) {
      // Backend unavailable → local fallback only
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const patchRemote = useCallback(async (partial) => {
    if (!hasToken()) return;
    try {
      await api.patch('/dashboard/onboarding', partial);
    } catch (_) {
      // ignore, local fallback already set
    }
  }, []);

  const markDone = useCallback(
    async (segment, { persist = true } = {}) => {
      const next = { ...flags };
      if (segment === 'dashboard') next.dashboardDone = true;
      if (segment === 'test') next.testDone = true;
      if (segment === 'result') next.resultDone = true;

      setFlags(next);
      saveLocal(next);

      if (persist) {
        const payload = {};
        if (segment === 'dashboard') payload.dashboardDone = true;
        if (segment === 'test') payload.testDone = true;
        if (segment === 'result') payload.resultDone = true;
        await patchRemote(payload);
      }
    },
    [flags, patchRemote]
  );

  const replay = useCallback((segment) => {
    setForcedSegment(segment);
    setPersistOnFinish(false);
  }, []);

  const resetAll = useCallback(async () => {
    const next = { ...defaultFlags };
    setFlags(next);
    saveLocal(next);
    setPersistOnFinish(true);
    setForcedSegment(null);

    if (hasToken()) {
      await patchRemote({ dashboardDone: false, testDone: false, resultDone: false });
    }
  }, [patchRemote]);

  const clearForce = useCallback(() => {
    setForcedSegment(null);
    setPersistOnFinish(true);
  }, []);

  const shouldRunDashboardTour = useMemo(() => loaded && (!flags.dashboardDone || forcedSegment === 'dashboard'), [
    loaded,
    flags.dashboardDone,
    forcedSegment,
  ]);
  const shouldRunTestTour = useMemo(() => loaded && (!flags.testDone || forcedSegment === 'test'), [
    loaded,
    flags.testDone,
    forcedSegment,
  ]);
  const shouldRunResultTour = useMemo(() => loaded && (!flags.resultDone || forcedSegment === 'result'), [
    loaded,
    flags.resultDone,
    forcedSegment,
  ]);

  return {
    loaded,
    flags,
    forcedSegment,
    persistOnFinish,
    shouldRunDashboardTour,
    shouldRunTestTour,
    shouldRunResultTour,
    markDone,
    replay,
    resetAll,
    clearForce,
    refresh,
  };
}


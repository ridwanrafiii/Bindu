import { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { isSetupDone } from './src/services/storage';

type AppState = 'splash' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [setupDone, setSetupDone] = useState(false);

  const handleSplashFinish = useCallback(async () => {
    const done = await isSetupDone();
    setSetupDone(done);
    setAppState('app');
  }, []);

  if (appState === 'splash') {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator
        setupDone={setupDone}
        onSetupComplete={() => setSetupDone(true)}
      />
    </>
  );
}

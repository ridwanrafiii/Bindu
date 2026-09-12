import { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { isSetupDone } from './src/services/storage';

type AppState = 'splash' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [setupDone, setSetupDone] = useState(false);

  // One-time cleanup of corrupted water logs
  useEffect(() => {
    AsyncStorage.getAllKeys().then((keys) => {
      const corruptedKeys = keys.filter((k) => k.startsWith('bindu:intake:'));
      if (corruptedKeys.length > 0) {
        AsyncStorage.multiRemove(corruptedKeys);
      }
    });
  }, []);

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

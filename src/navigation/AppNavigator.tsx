import { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

import SetupNameScreen     from '../screens/setup/SetupNameScreen';
import SetupGoalScreen     from '../screens/setup/SetupGoalScreen';
import SetupIntervalScreen from '../screens/setup/SetupIntervalScreen';
import SetupHoursScreen    from '../screens/setup/SetupHoursScreen';
import SetupDoneScreen     from '../screens/setup/SetupDoneScreen';

// ─── SVG Tab Icons ────────────────────────────────────────────────────────────

function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
        fill={color}
      />
    </Svg>
  );
}

function HistoryIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth="2"
      />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.2" fill={color} />
      <Circle cx="12" cy="14" r="1.2" fill={color} />
      <Circle cx="16" cy="14" r="1.2" fill={color} />
      <Circle cx="8" cy="18" r="1.2" fill={color} />
      <Circle cx="12" cy="18" r="1.2" fill={color} />
    </Svg>
  );
}

function SettingsIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Refined Minimal Tab Bar ───────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? '#1A73E8' : 'rgba(255, 255, 255, 0.4)',
            size: 20,
          });

          const label = options.tabBarLabel?.toString() || route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              style={tabStyles.tabButton}
              activeOpacity={0.7}
            >
              <AnimatedTabItem isFocused={isFocused} icon={icon} label={label} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedTabItem({ isFocused, icon, label }: { isFocused: boolean; icon: any; label: string }) {
  const scale = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.05 : 0.95,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.55,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <Animated.View style={[tabStyles.tabItem, { transform: [{ scale }], opacity }]}>
      {/* Subtle top indicator dot for focused state */}
      {isFocused && <View style={tabStyles.activeDot} />}
      <View style={tabStyles.iconContainer}>{icon}</View>
      <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelActive]}>{label}</Text>
    </Animated.View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 22, 40, 0.94)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A73E8',
  },
  iconContainer: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#1A73E8',
    fontWeight: '700',
  },
});

// ─── Route param types ────────────────────────────────────────────────────────

export type SetupStackParamList = {
  SetupName:     undefined;
  SetupGoal:     { name: string };
  SetupInterval: { name: string; dailyGoalMl: number };
  SetupHours:    { name: string; dailyGoalMl: number; intervalMinutes: number };
  SetupDone:     { name: string; dailyGoalMl: number; intervalMinutes: number; startHour: number; endHour: number };
};

export type MainTabParamList = {
  Home:     undefined;
  History:  undefined;
  Settings: undefined;
};

// ─── Stacks ───────────────────────────────────────────────────────────────────

const SetupStack = createNativeStackNavigator<SetupStackParamList>();
const MainTabs   = createBottomTabNavigator<MainTabParamList>();

function SetupNavigator({ onSetupComplete }: { onSetupComplete: () => void }) {
  return (
    <SetupStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SetupName">
      <SetupStack.Screen name="SetupName"     component={SetupNameScreen} />
      <SetupStack.Screen name="SetupGoal"     component={SetupGoalScreen} />
      <SetupStack.Screen name="SetupInterval" component={SetupIntervalScreen} />
      <SetupStack.Screen name="SetupHours"    component={SetupHoursScreen} />
      <SetupStack.Screen name="SetupDone">
        {(props) => <SetupDoneScreen {...props} onSetupComplete={onSetupComplete} />}
      </SetupStack.Screen>
    </SetupStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTabs.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainTabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size || 20} />,
        }}
        component={HomeScreen}
      />
      <MainTabs.Screen
        name="History"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size || 20} />,
        }}
        component={HistoryScreen}
      />
      <MainTabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size || 20} />,
        }}
        component={SettingsScreen}
      />
    </MainTabs.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

interface Props {
  setupDone: boolean;
  onSetupComplete: () => void;
}

export default function AppNavigator({ setupDone, onSetupComplete }: Props) {
  return (
    <NavigationContainer>
      {setupDone
        ? <MainNavigator />
        : <SetupNavigator onSetupComplete={onSetupComplete} />}
    </NavigationContainer>
  );
}

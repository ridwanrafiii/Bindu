import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useSettings } from '../hooks/useSettings';
import { Theme } from '../types';
import { textStyles, fontSize } from '../theme/typography';
import { palette } from '../theme/colors';

export default function SettingsScreen() {
  const { settings, loading, update } = useSettings();
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [devModalVisible, setDevModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  const [tempStartHour, setTempStartHour] = useState(0);
  const [tempEndHour, setTempEndHour] = useState(0);

  const startEdit = useCallback((field: string, currentValue: string | number) => {
    setEditing(field);
    setTempValue(String(currentValue));
  }, []);

  const saveEdit = useCallback(
    async (field: keyof typeof settings) => {
      if (!tempValue.trim()) {
        Alert.alert('Invalid', 'Value cannot be empty');
        return;
      }

      let parsedValue: any = tempValue.trim();

      if (field !== 'name' && field !== 'theme') {
        const num = parseInt(parsedValue, 10);
        if (isNaN(num) || num <= 0) {
          Alert.alert('Invalid', 'Please enter a valid positive number');
          return;
        }
        parsedValue = num;
      }

      await update({ [field]: parsedValue });
      setEditing(null);
      setTempValue('');
    },
    [tempValue, update]
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setTempValue('');
  }, []);

  const openHoursPicker = useCallback(() => {
    setTempStartHour(settings.startHour);
    setTempEndHour(settings.endHour);
    setHoursModalVisible(true);
  }, [settings.startHour, settings.endHour]);

  const saveHours = useCallback(async () => {
    if (tempEndHour <= tempStartHour) {
      Alert.alert('Invalid Range', 'End hour must be after start hour');
      return;
    }
    await update({ startHour: tempStartHour, endHour: tempEndHour });
    setHoursModalVisible(false);
  }, [tempStartHour, tempEndHour, update]);

  const selectTheme = useCallback(
    async (theme: Theme) => {
      await update({ theme });
    },
    [update]
  );

  if (loading) {
    return <View style={styles.container} />;
  }

  const themeLabel = settings.theme === 'light' ? 'Light' : settings.theme === 'dark' ? 'Dark' : 'System';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Profile</Text>
          <SettingRow
            label="Name"
            value={settings.name}
            isEditing={editing === 'name'}
            tempValue={tempValue}
            onEdit={() => startEdit('name', settings.name)}
            onSave={() => saveEdit('name')}
            onCancel={cancelEdit}
            onChangeText={setTempValue}
          />
        </View>

        {/* Water Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Water Goal</Text>
          <SettingRow
            label="Daily Goal"
            value={`${settings.dailyGoalMl} ml`}
            unit="ml"
            isEditing={editing === 'dailyGoalMl'}
            tempValue={tempValue}
            onEdit={() => startEdit('dailyGoalMl', settings.dailyGoalMl)}
            onSave={() => saveEdit('dailyGoalMl')}
            onCancel={cancelEdit}
            onChangeText={setTempValue}
            keyboardType="numeric"
          />
          <SettingRow
            label="Default Drink"
            value={`${settings.defaultDrinkMl} ml`}
            unit="ml"
            isEditing={editing === 'defaultDrinkMl'}
            tempValue={tempValue}
            onEdit={() => startEdit('defaultDrinkMl', settings.defaultDrinkMl)}
            onSave={() => saveEdit('defaultDrinkMl')}
            onCancel={cancelEdit}
            onChangeText={setTempValue}
            keyboardType="numeric"
          />
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reminders</Text>
          <SettingRow
            label="Interval"
            value={`${settings.intervalMinutes} min`}
            unit="min"
            isEditing={editing === 'intervalMinutes'}
            tempValue={tempValue}
            onEdit={() => startEdit('intervalMinutes', settings.intervalMinutes)}
            onSave={() => saveEdit('intervalMinutes')}
            onCancel={cancelEdit}
            onChangeText={setTempValue}
            keyboardType="numeric"
          />
          <SettingRow
            label="Active Hours"
            value={`${settings.startHour}:00 - ${settings.endHour}:00`}
            isEditing={false}
            onEdit={openHoursPicker}
          />
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Appearance</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                'Theme',
                'Choose your preferred theme',
                [
                  { text: 'Light', onPress: () => selectTheme('light') },
                  { text: 'Dark', onPress: () => selectTheme('dark') },
                  { text: 'System', onPress: () => selectTheme('system') },
                  { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.settingValue}>{themeLabel}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18l6-6-6-6"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Bindu', 'Version 1.0.0\n\nYour Daily Hydration Companion')}
          >
            <Text style={styles.linkLabel}>Version</Text>
            <Text style={styles.linkValue}>1.0.0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => setDevModalVisible(true)}>
            <Text style={styles.linkLabel}>Developer</Text>
            <View style={styles.linkArrow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18l6-6-6-6"
                  stroke="#1A73E8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Developer Modal */}
      <Modal
        visible={devModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDevModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDevModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Avatar */}
              <View style={styles.devAvatarRing}>
                <View style={styles.devAvatarInner}>
                  <Text style={styles.devAvatarLetter}>R</Text>
                </View>
              </View>

              {/* Header */}
              <Text style={styles.devLabel}>Made with 💧 by</Text>
              <Text style={styles.devName}>Ridwanur Rahman Rafi</Text>

              {/* Divider */}
              <View style={styles.devDivider} />

              {/* Contact Row */}
              <TouchableOpacity
                style={styles.devContactRow}
                activeOpacity={0.7}
                onPress={() => Linking.openURL('mailto:ridwanurrahmanrafi@gmail.com')}
              >
                <View style={styles.devContactIcon}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="#1A73E8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path d="M22 6l-10 7L2 6" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.devContactInfo}>
                  <Text style={styles.devContactLabel}>Email</Text>
                  <Text style={styles.devContactValue}>ridwanurrahmanrafi@gmail.com</Text>
                </View>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              {/* App Info */}
              <View style={styles.devAppInfo}>
                <Text style={styles.devAppName}>Bindu</Text>
                <Text style={styles.devAppVersion}>Version 1.0.0</Text>
              </View>

              {/* Close */}
              <TouchableOpacity
                style={styles.devCloseBtn}
                activeOpacity={0.7}
                onPress={() => setDevModalVisible(false)}
              >
                <Text style={styles.devCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Hours Picker Modal */}
      <Modal
        visible={hoursModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHoursModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHoursModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Active Hours</Text>
              <Text style={styles.modalSubtitle}>Set when you want to receive reminders</Text>

              <View style={styles.hourSection}>
                <Text style={styles.hourLabel}>Start Hour</Text>
                <View style={styles.hourPicker}>
                  <TouchableOpacity style={styles.hourBtn} onPress={() => setTempStartHour(Math.max(0, tempStartHour - 1))}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M6 9l6 6 6-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                  <View style={styles.hourDisplay}>
                    <Text style={styles.hourText}>{String(tempStartHour).padStart(2, '0')}:00</Text>
                  </View>
                  <TouchableOpacity style={styles.hourBtn} onPress={() => setTempStartHour(Math.min(23, tempStartHour + 1))}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M18 15l-6-6-6 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.hourSection}>
                <Text style={styles.hourLabel}>End Hour</Text>
                <View style={styles.hourPicker}>
                  <TouchableOpacity style={styles.hourBtn} onPress={() => setTempEndHour(Math.max(0, tempEndHour - 1))}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M6 9l6 6 6-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                  <View style={styles.hourDisplay}>
                    <Text style={styles.hourText}>{String(tempEndHour).padStart(2, '0')}:00</Text>
                  </View>
                  <TouchableOpacity style={styles.hourBtn} onPress={() => setTempEndHour(Math.min(23, tempEndHour + 1))}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M18 15l-6-6-6 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setHoursModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={saveHours}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Setting Row Component ────────────────────────────────────────────────────

interface SettingRowProps {
  label: string;
  value: string;
  unit?: string;
  isEditing: boolean;
  tempValue?: string;
  onEdit: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
}

function SettingRow({
  label,
  value,
  unit,
  isEditing,
  tempValue = '',
  onEdit,
  onSave,
  onCancel,
  onChangeText,
  keyboardType = 'default',
}: SettingRowProps) {
  if (isEditing) {
    return (
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>{label}</Text>
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={tempValue}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoFocus
            placeholder={value}
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          {unit && <Text style={styles.inputUnit}>{unit}</Text>}
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.settingRow} onPress={onEdit}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.settingValue}>{value}</Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18l6-6-6-6"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.navy900,
  },
  container: {
    flex: 1,
    backgroundColor: palette.navy900,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 20,
  },
  title: {
    ...textStyles.headingLarge,
    color: palette.white,
    marginBottom: 4,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: palette.white,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: fontSize.md,
    color: palette.white,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#1A73E8',
  },
  inputUnit: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: -4,
  },
  saveBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  linkLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: palette.white,
  },
  linkValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  linkArrow: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(26,115,232,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#0D1F3C',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  devAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(26,115,232,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  devAvatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(26,115,232,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devAvatarLetter: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: '#1A73E8',
  },
  devLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 4,
  },
  devName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: palette.white,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  devDivider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  devContactRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
    gap: 12,
  },
  devContactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(26,115,232,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devContactInfo: {
    flex: 1,
  },
  devContactLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  devContactValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1A73E8',
  },
  devAppInfo: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 2,
  },
  devAppName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
  },
  devAppVersion: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.2)',
  },
  devCloseBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  devCloseBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24,
    textAlign: 'center',
  },
  hourSection: {
    width: '100%',
    marginBottom: 20,
  },
  hourLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  hourPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  hourBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  hourDisplay: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(26,115,232,0.15)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(26,115,232,0.3)',
  },
  hourText: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: '#1A73E8',
    letterSpacing: 0.5,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalCancelText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSaveText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

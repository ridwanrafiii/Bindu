import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '../../navigation/AppNavigator';
import { lightColors } from '../../theme/colors';
import { textStyles, fontSize } from '../../theme/typography';

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupName'>;

export default function SetupNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const colors = lightColors; // setup always on dark bg, but we pass theme later

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Text style={styles.step}>Step 1 of 4</Text>
          <Text style={styles.heading}>What's your name?</Text>
          <Text style={styles.sub}>
            We'll use this to personalise your reminders.
          </Text>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={() =>
            name.trim() && navigation.navigate('SetupGoal', { name: name.trim() })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0A1628' },

  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  top: { gap: 12 },

  step: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heading: {
    ...textStyles.displayMedium,
    color: '#FFFFFF',
  },

  sub: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },

  inputArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#1A73E8',
    paddingVertical: 12,
    fontSize: fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    ...textStyles.headingMedium,
    color: '#FFFFFF',
  },
});

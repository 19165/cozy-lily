export type WorkspaceTab = 'todo' | 'schedule';

export interface MainFocus {
  text: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface LilySettings {
  ambientAudioUrl: string;
}

export interface LilyStorageData {
  lastResetDate: string;
  mainFocus: MainFocus;
  todos: TodoItem[];
  settings: LilySettings;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  startTime: string; // ISO string or YYYY-MM-DD for all-day
  endTime: string;
  isAllDay: boolean;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
  status?: string;
}

export const PRAISE_DIALOGUES: string[] = [
  'Amazing work! Taking things one step at a time really adds up.',
  'Look at you go! Another item checked off — take a gentle breath.',
  'Splendid focus! I knew you could wrap that up smoothly.',
  'Well done! Let’s keep this calm, steady rhythm going today.',
  'Yay, one less thing on your mind! You’re doing wonderfully.',
  'That was super clean! Want to sip some water before the next task?',
  'Check! Every small step brings today’s goal closer to home.',
  'So proud of your focus right now. Keep shining at your own pace!',
];

export const ENCOURAGEMENT_DIALOGUES: string[] = [
  'I’m right here beside your browser tabs whenever you need quiet company.',
  'No rush at all—pick one tiny step and we’ll tackle it together.',
  'Remember to drop your shoulders and unclench your jaw for a second.',
  'A calm desk makes for clear thoughts. Let’s take today gently.',
  'Need a cozy atmosphere? Tap the sound button up top for gentle rain.',
];

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning! The sunlight feels lovely today—what’s our main focus?';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon! Ready for a peaceful, focused stretch together?';
  }
  if (hour >= 17 && hour < 22) {
    return 'Good evening! Let’s wrap up today’s loose ends gently.';
  }
  return 'Working late tonight? Keep things cozy, and don’t forget to rest soon.';
}

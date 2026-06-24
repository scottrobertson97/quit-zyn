import type {
  DayOfWeek,
  DangerWindowGoal,
  DangerWindowOutcome,
  DefenseAction,
} from './types'

export const dayLabels: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

export const dayOptions = [1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]

export const dangerWindowGoalLabels: Record<DangerWindowGoal, string> = {
  no_pouch: 'No pouch',
  delay_first: 'Delay first pouch',
  stay_under_limit: 'Stay under limit',
}

export const defenseActionLabels: Record<DefenseAction, string> = {
  water: 'Drink water',
  walk: 'Take a walk',
  gum: 'Chew gum',
  breathing: 'Breathing',
  snack: 'Eat something',
  brush_teeth: 'Brush teeth',
  journal: 'Journal',
  leave_room: 'Leave the room',
}

export const dangerWindowOutcomeLabels: Record<DangerWindowOutcome, string> = {
  protected: 'I protected it',
  delayed: 'I delayed but used later',
  used: 'I used during the window',
  skipped_checkin: 'I forgot / skipped check-in',
}

export const defenseActionCopy: Record<
  DefenseAction,
  { title: string; body: string; durationSeconds?: number; actionLabel: string }
> = {
  water: {
    title: 'Defense: Water',
    body: 'Drink a glass of cold water. Wait two minutes before deciding.',
    durationSeconds: 120,
    actionLabel: 'Start 2-Minute Timer',
  },
  walk: {
    title: 'Defense: Walk',
    body: 'Take a 5-minute walk before deciding. You are creating space between urge and action.',
    durationSeconds: 300,
    actionLabel: 'Start 5-Minute Timer',
  },
  gum: {
    title: 'Defense: Gum',
    body: 'Chew gum and delay the automatic next step. Decide again after five minutes.',
    durationSeconds: 300,
    actionLabel: 'Start 5-Minute Timer',
  },
  breathing: {
    title: 'Defense: Breathing',
    body: 'Breathe in for 4. Hold for 4. Out for 6. Repeat 4 times.',
    durationSeconds: 120,
    actionLabel: 'Start Breathing',
  },
  snack: {
    title: 'Defense: Snack',
    body: 'Eat something simple before deciding whether this is actually a nicotine urge.',
    actionLabel: 'Mark Done',
  },
  brush_teeth: {
    title: 'Defense: Brush Teeth',
    body: 'Brush your teeth and make the pouch less automatic.',
    actionLabel: 'Mark Done',
  },
  journal: {
    title: 'Defense: Journal',
    body: 'What are you actually asking the pouch to do for you right now?',
    actionLabel: 'Save',
  },
  leave_room: {
    title: 'Defense: Leave the Room',
    body: 'Change rooms for five minutes. Break the link between this place and the pouch.',
    durationSeconds: 300,
    actionLabel: 'Start 5-Minute Timer',
  },
}

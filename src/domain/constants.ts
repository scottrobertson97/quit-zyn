import type { Intervention, QuitMode, Trigger } from './types'

export const triggerLabels: Record<Trigger, string> = {
  stress: 'Stress',
  boredom: 'Boredom',
  focus: 'Focus',
  driving: 'Driving',
  after_food: 'After food',
  social: 'Social',
  morning: 'Morning',
  night: 'Night',
  other: 'Other',
}

export const triggerOptions = Object.keys(triggerLabels) as Trigger[]

export const interventionLabels: Record<Intervention, string> = {
  water: 'Drink cold water',
  walk: 'Take a short walk',
  breathing: 'Box breathing',
  gum: 'Chew gum',
  brush_teeth: 'Brush teeth',
  journal: 'Journal one sentence',
  delay_timer: 'Wait five minutes',
  message_someone: 'Message someone',
}

export const quitModeLabels: Record<QuitMode, string> = {
  awareness: 'Awareness',
  delay: 'Delay',
  taper: 'Taper',
  cold_turkey: 'Cold turkey',
}

export const quitModeDescriptions: Record<QuitMode, string> = {
  awareness: 'Track first, no pressure.',
  delay: 'Increase the time between urge and pouch.',
  taper: 'Reduce daily pouch count over time.',
  cold_turkey: 'Quit fully and track nicotine-free time.',
}

export const journalPrompts = [
  'What did this craving actually want?',
  'Was I tired, stressed, bored, lonely, or overstimulated?',
  'What would have helped five minutes earlier?',
  'What pattern am I starting to notice?',
  'What did I do today that made quitting easier?',
]

export const medicalDisclaimer =
  'This app provides behavioral tracking and habit support. It is not medical advice. If you are using nicotine heavily, pregnant, managing a health condition, or considering medications to quit, talk with a doctor or pharmacist.'

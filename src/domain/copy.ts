import type { Intervention, QuitMode, Trigger } from './types'

export function getPlanCopy(mode: QuitMode) {
  switch (mode) {
    case 'awareness':
      return 'Learn when and why you use. Tracking is the win for now.'
    case 'delay':
      return 'You are practicing the pause between wanting and doing.'
    case 'taper':
      return 'Keep the next limit visible and make the reduction boringly clear.'
    case 'cold_turkey':
      return 'Track nicotine-free time and cravings survived without turning slips into a reset.'
  }
}

export function suggestIntervention(
  trigger: Trigger,
  intensity: number,
): Intervention {
  if (intensity >= 8) {
    return 'breathing'
  }

  switch (trigger) {
    case 'stress':
      return 'breathing'
    case 'boredom':
      return 'walk'
    case 'focus':
      return 'water'
    case 'driving':
      return 'gum'
    case 'after_food':
      return 'brush_teeth'
    case 'habit_autopilot':
      return 'delay_timer'
    case 'social':
      return 'message_someone'
    case 'morning':
      return 'water'
    case 'night':
      return 'journal'
    case 'other':
      return 'delay_timer'
  }
}

export const supportiveMessages = [
  'You do not have to win the whole day. Just create space right now.',
  'You can want something and still choose the next five minutes.',
  'One pouch does not erase the pattern you are building.',
  'The urge can be loud without being in charge.',
]

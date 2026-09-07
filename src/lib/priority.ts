type Analysis = {
  priority: 'urgent' | 'upcoming' | 'low'
  priority_override: 'urgent' | 'upcoming' | 'low' | null
  deadline_at: string | null
}

export function getEffectivePriority(analysis: Analysis): 'urgent' | 'upcoming' | 'low' {
  const base = analysis.priority_override ?? analysis.priority

  // A deadline that's already passed isn't "upcoming" anymore — treat it as quiet
  if (base === 'upcoming' && analysis.deadline_at && new Date(analysis.deadline_at) < new Date()) {
    return 'low'
  }

  return base
}
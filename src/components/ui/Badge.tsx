interface BadgeProps {
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show' | string
  className?: string
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  confirmed: { bg: 'bg-forest/10',   text: 'text-forest',      dot: 'bg-forest',      label: 'Confirmed' },
  cancelled: { bg: 'bg-soft-red/10', text: 'text-soft-red',    dot: 'bg-soft-red',    label: 'Cancelled' },
  completed: { bg: 'bg-charcoal-100',text: 'text-warm-gray',   dot: 'bg-warm-gray',   label: 'Completed' },
  'no-show': { bg: 'bg-brass-light', text: 'text-brass-dark',  dot: 'bg-brass',       label: 'No-show'   },
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const cfg = statusConfig[status] ?? {
    bg: 'bg-charcoal-100', text: 'text-warm-gray', dot: 'bg-warm-gray', label: status,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

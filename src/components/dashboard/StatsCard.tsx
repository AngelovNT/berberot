import Card from '@/components/ui/Card'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: string
  sub?: string
}

export default function StatsCard({ label, value, icon, sub }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-warm-gray font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#111] mt-1">{value}</p>
          {sub && <p className="text-xs text-warm-gray mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </Card>
  )
}

interface BookingStepIndicatorProps {
  currentStep: number
}

const steps = ['Service', 'Barber', 'Time', 'Confirm']

export default function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  const pct = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-medium text-warm-gray">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-xs font-semibold text-charcoal">
          {steps[currentStep - 1]}
        </p>
      </div>
      <div className="h-0.5 bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-charcoal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="animate-float-a absolute -left-24 -top-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-cyan-400/30 via-emerald-400/20 to-transparent blur-3xl" />
      <div className="animate-float-b absolute -right-32 top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-500/25 via-cyan-400/15 to-transparent blur-3xl" />
      <div className="animate-float-c absolute bottom-[-200px] left-1/4 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-transparent blur-3xl" />
    </div>
  )
}
import { isFirebaseConfigured } from '../firebase'

export default function StorageIndicator() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-panel border border-border-purple">
      <div className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-neon' : 'bg-warning'}`}
        style={{ boxShadow: isFirebaseConfigured ? '0 0 6px rgba(52,211,153,0.5)' : '0 0 6px rgba(245,158,11,0.5)' }} />
      <span className="text-xs font-medium text-text-secondary">
        {isFirebaseConfigured ? 'Firebase' : 'LocalStorage'}
      </span>
    </div>
  )
}

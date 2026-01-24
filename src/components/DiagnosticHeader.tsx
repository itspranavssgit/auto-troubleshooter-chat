import { Gauge, Activity, Wrench } from "lucide-react";

export function DiagnosticHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center diagnostic-glow">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                AutoDiag<span className="text-primary">AI</span>
              </h1>
              <p className="text-xs font-mono text-muted-foreground">
                VEHICLE FAULT DETECTION SYSTEM
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <StatusIndicator
              icon={<Activity className="h-4 w-4" />}
              label="System"
              status="Online"
              color="success"
            />
            <StatusIndicator
              icon={<Gauge className="h-4 w-4" />}
              label="AI Engine"
              status="Ready"
              color="primary"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusIndicator({
  icon,
  label,
  status,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  color: "success" | "primary" | "warning";
}) {
  const colorClasses = {
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={colorClasses[color]}>{icon}</div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-mono font-medium ${colorClasses[color]}`}>
          {status}
        </p>
      </div>
    </div>
  );
}

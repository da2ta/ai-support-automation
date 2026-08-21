import React from "react";
import type { DashboardStats } from "../../types";

export const AIPerformance: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const confidence = stats.avg_confidence ? Math.round(stats.avg_confidence * 100) : 0;
  
  return (
    <div className="bg-surface rounded-xl border border-border p-5 h-full flex flex-col gap-6">
      <h3 className="text-[14px] font-semibold text-foreground">AI Resolution Intelligence</h3>
      
      <div className="flex flex-col items-center justify-center py-4">
        {/* Simple CSS radial progress representation */}
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-background border-[8px] border-surface-hover">
          {/* We'll use a simple approach for the radial gradient or border */}
          <div 
            className="absolute inset-[-8px] rounded-full border-[8px] border-primary" 
            style={{ clipPath: `polygon(0 0, 100% 0, 100% ${confidence}%, 0 ${confidence}%)` }}
          />
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tighter text-foreground">{confidence}%</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Confidence</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">Auto-triage rate</span>
          <span className="text-[13px] font-semibold text-foreground">78%</span>
        </div>
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full w-[78%]" />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-[13px] font-medium text-muted-foreground">Suggested response acceptance</span>
          <span className="text-[13px] font-semibold text-foreground">64%</span>
        </div>
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full w-[64%]" />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import type { DashboardStats } from "../../types";

export const CategoryBreakdown: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const categories = stats.category_breakdown || [];
  
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-5">
      <h3 className="text-[14px] font-semibold text-foreground">Ticket Categories</h3>
      
      {categories.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-muted-foreground">No category data available</div>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{cat.category}</span>
                <span className="text-[12px] font-mono text-muted-foreground">{cat.percentage.toFixed(1)}% ({cat.count})</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.max(cat.percentage, 2)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

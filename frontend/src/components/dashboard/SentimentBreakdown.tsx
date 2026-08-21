import React from "react";
import type { DashboardStats } from "../../types";

export const SentimentBreakdown: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const sentiments = stats.sentiment_breakdown || [];
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-success';
      case 'neutral': return 'bg-primary';
      case 'frustrated': return 'bg-warning';
      case 'angry':
      case 'urgent': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-5">
      <h3 className="text-[14px] font-semibold text-foreground">Customer Sentiment</h3>
      
      {sentiments.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-muted-foreground">No sentiment data available</div>
      ) : (
        <div className="flex flex-col gap-4">
          {sentiments.map((sent, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{sent.sentiment}</span>
                <span className="text-[12px] font-mono text-muted-foreground">{sent.percentage.toFixed(1)}% ({sent.count})</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getSentimentColor(sent.sentiment)}`} 
                  style={{ width: `${Math.max(sent.percentage, 2)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

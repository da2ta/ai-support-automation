import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the chart since the backend doesn't provide historical time-series data yet.
// In a real scenario, this would come from the API.
const mockData = [
  { name: "Mon", incoming: 400, resolved: 240 },
  { name: "Tue", incoming: 300, resolved: 139 },
  { name: "Wed", incoming: 200, resolved: 980 },
  { name: "Thu", incoming: 278, resolved: 390 },
  { name: "Fri", incoming: 189, resolved: 480 },
  { name: "Sat", incoming: 239, resolved: 380 },
  { name: "Sun", incoming: 349, resolved: 430 },
];

export const TicketVolumeChart: React.FC = () => {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">Ticket Volume</h3>
        <div className="flex items-center bg-background rounded-md border border-border overflow-hidden">
          <button className="px-3 py-1 text-[11px] font-medium hover:bg-surface-hover text-muted-foreground transition-colors border-r border-border">7D</button>
          <button className="px-3 py-1 text-[11px] font-medium bg-surface text-foreground transition-colors border-r border-border">30D</button>
          <button className="px-3 py-1 text-[11px] font-medium hover:bg-surface-hover text-muted-foreground transition-colors">90D</button>
        </div>
      </div>
      
      <div className="flex-1 w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
              itemStyle={{ color: "var(--color-foreground)" }}
            />
            <Area type="monotone" dataKey="incoming" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncoming)" />
            <Area type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

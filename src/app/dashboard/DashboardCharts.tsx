"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign } from "lucide-react";

export function DashboardCharts({ salesData }: { salesData: any[] }) {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border border-dashed border-zinc-700 rounded-xl bg-panel/20">
        <p className="text-muted-foreground font-medium">Não há dados de vendas suficientes para o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Importing AreaChart and Area specifically for this nice gradient chart
import { AreaChart, Area } from 'recharts';

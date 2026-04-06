'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

interface VisitsChartProps {
  data: { day: string; visits: number }[]
}

export default function VisitsChart({ data }: VisitsChartProps) {
  return (
    <div className="h-[300px] w-full bg-zinc-950/50 border border-white/5 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e8ff47" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#e8ff47" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
            dy={10}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: '#e8ff47' }}
          />
          <Area
            type="monotone"
            dataKey="visits"
            stroke="#e8ff47"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisits)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

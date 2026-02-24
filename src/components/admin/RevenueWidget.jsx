'use client';

import { useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Banknote } from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { format, subDays } from 'date-fns';

export function RevenueWidget() {
  const firestore = useFirestore();

  const serviceRequestsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'serviceRequests'));
  }, [firestore]);

  const { data: allRequests, isLoading } = useCollection(serviceRequestsQuery);

  const { totalRevenue, revenueByDay } = useMemo(() => {
    if (!allRequests) return { totalRevenue: 0, revenueByDay: [] };

    const completedRequests = allRequests.filter(req => req.status === 'Completed' && req.cost);

    const totalRevenue = completedRequests.reduce((sum, req) => sum + (req.cost || 0), 0);

    // Group revenue by day for the last 30 days
    const revenueByDayMap = new Map();
    const thirtyDaysAgo = subDays(new Date(), 30);

    completedRequests.forEach(req => {
        if (req.updatedAt.toDate() >= thirtyDaysAgo) {
            const day = format(req.updatedAt.toDate(), 'MMM d');
            const currentRevenue = revenueByDayMap.get(day) || 0;
            revenueByDayMap.set(day, currentRevenue + (req.cost || 0));
        }
    });

    const revenueByDay = Array.from(revenueByDayMap, ([name, total]) => ({ name, total })).reverse();

    return { totalRevenue, revenueByDay };
  }, [allRequests]);


  if (isLoading) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">
          Based on all completed service requests.
        </p>
        {revenueByDay.length > 0 && (
            <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByDay}>
                        <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        />
                        <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Day
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {payload[0].payload.name}
                                            </span>
                                            </div>
                                            <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Revenue
                                            </span>
                                            <span className="font-bold">
                                                ₹{(payload[0].value).toFixed(2)}
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

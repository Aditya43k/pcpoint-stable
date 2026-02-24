'use client';

import { useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function UserRequests() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userRequestsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    // The orderBy clause was removed to prevent a Firestore index error.
    // Sorting is now handled on the client-side.
    return query(
      collection(firestore, 'serviceRequests'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: unsortedRequests, isLoading, error } = useCollection(userRequestsQuery);

  const requests = useMemo(() => {
    if (!unsortedRequests) return null;
    // Sort requests by submission date in descending order on the client
    return [...unsortedRequests].sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
  }, [unsortedRequests]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending':
      case 'Scheduled':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
      case 'Paid':
        return 'outline';
      case 'Cancelled':
      case 'Declined':
        return 'destructive';
      case 'Awaiting Parts':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      );
    }
  
    if (error) {
        return (
            <Alert variant="destructive">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error fetching your requests</AlertTitle>
              <AlertDescription>
                  There was a problem loading your service requests. Please try refreshing the page.
              </AlertDescription>
            </Alert>
        );
    }
  
    if (!requests || requests.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4">
              <Inbox className="h-12 w-12" />
              <p>You haven't submitted any service requests yet.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id.substring(0, 8)}...</TableCell>
                  <TableCell>{request.deviceType} - {request.brand}</TableCell>
                  <TableCell>{format(request.submittedAt.toDate(), 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    );
  };

  return (
    <section id="my-requests">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">My Service Requests</h2>
        <Card>
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
    </section>
  );
}

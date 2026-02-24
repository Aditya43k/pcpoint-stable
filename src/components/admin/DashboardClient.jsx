'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RequestDetails } from './RequestDetails';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash } from 'lucide-react';

export function DashboardClient() {
  const firestore = useFirestore();
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const serviceRequestsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'serviceRequests'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading, error } = useCollection(serviceRequestsQuery);
  
  useEffect(() => {
    if (!isLoading && requests && requests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(requests[0].id);
    }
  }, [requests, isLoading, selectedRequestId]);
  
  const selectedRequest = useMemo(() => {
      return requests?.find(req => req.id === selectedRequestId);
  }, [requests, selectedRequestId]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
      case 'Paid':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      case 'Awaiting Parts':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-headline">Incoming Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
           <Card className="flex h-full min-h-[300px] items-center justify-center">
             <p className="text-muted-foreground">Loading requests...</p>
           </Card>
        </div>
      </div>
    );
  }
  
  if (error) {
      return (
          <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Error fetching data</AlertTitle>
            <AlertDescription>
                There was a problem loading service requests from the database. Please try again later.
            </AlertDescription>
          </Alert>
      )
  }

  if (!requests || requests.length === 0) {
      return (
          <Card>
              <CardHeader>
                <CardTitle className="font-headline">Incoming Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="p-8 text-center text-muted-foreground">No service requests found.</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="font-headline">Incoming Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(request => (
                <TableRow
                  key={request.id}
                  onClick={() => setSelectedRequestId(request.id)}
                  className={cn(
                    'cursor-pointer',
                    selectedRequestId === request.id && 'bg-muted/80'
                  )}
                >
                  <TableCell className="font-medium">{request.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        {selectedRequest ? (
          <RequestDetails
            key={selectedRequest.id} // Re-mount component on selection change
            request={selectedRequest}
          />
        ) : (
          <Card className="flex h-full min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Select a request to view details</p>
          </Card>
        )}
      </div>
    </div>
  );
}

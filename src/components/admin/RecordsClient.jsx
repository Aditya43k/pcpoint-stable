'use client';

import { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search, ServerCrash, X } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '@/lib/utils';

const deviceTypes = ['Laptop', 'Desktop', 'Printer', 'Software'];
const deviceBrands = {
  Laptop: ['HP', 'Acer', 'Dell', 'Asus', 'Lenovo', 'Apple', 'MSI', 'Razer', 'Samsung', 'Microsoft', 'Other'],
  Desktop: ['Dell', 'HP', 'Apple', 'Lenovo', 'Acer', 'Custom Build', 'Other'],
  Printer: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Lexmark', 'Samsung', 'Other'],
  Software: ['OS Installation', 'Anti-virus & Security', 'Data Recovery', 'Other'],
};
const statuses = ['Pending', 'Scheduled', 'Declined', 'In Progress', 'Awaiting Parts', 'Completed', 'Cancelled', 'Paid'];

export function RecordsClient() {
  const firestore = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    deviceType: '',
    brand: '',
    status: '',
    dateRange: undefined,
  });

  const serviceRequestsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'serviceRequests'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: allRequests, isLoading, error } = useCollection(serviceRequestsQuery);

  const filteredRequests = useMemo(() => {
    if (!allRequests) return [];
    
    return allRequests.filter(req => {
      const searchMatch = searchTerm === '' || 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const deviceTypeMatch = filters.deviceType === '' || req.deviceType === filters.deviceType;
      const brandMatch = filters.brand === '' || req.brand === filters.brand;
      const statusMatch = filters.status === '' || req.status === filters.status;
      
      const dateMatch = !filters.dateRange || !filters.dateRange.from || !filters.dateRange.to ||
        isWithinInterval(req.submittedAt.toDate(), { start: startOfDay(filters.dateRange.from), end: endOfDay(filters.dateRange.to) });

      return searchMatch && deviceTypeMatch && brandMatch && statusMatch && dateMatch;
    });
  }, [allRequests, searchTerm, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      if (filterName === 'deviceType') {
        newFilters.brand = ''; // Reset brand when deviceType changes
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      deviceType: '',
      brand: '',
      status: '',
      dateRange: undefined,
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'In Progress': return 'secondary';
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
  
  const currentBrands = filters.deviceType ? deviceBrands[filters.deviceType] : [];

  if (error) {
    return (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error fetching data</AlertTitle>
          <AlertDescription>
              There was a problem loading service records. Please try again later.
          </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Filter Records</CardTitle>
        <CardDescription>
          Use the filters below to search through all service requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative col-span-full sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, name, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filters.deviceType} onValueChange={(val) => handleFilterChange('deviceType', val)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {deviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.brand} onValueChange={(val) => handleFilterChange('brand', val)} disabled={!filters.deviceType}>
            <SelectTrigger><SelectValue placeholder={filters.deviceType ? "Brand" : "Select category"} /></SelectTrigger>
            <SelectContent>
              {currentBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  "justify-start text-left font-normal col-span-full sm:col-span-1",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={filters.dateRange}
                onSelect={(range) => handleFilterChange('dateRange', range)}
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" onClick={clearFilters} className="col-span-full sm:col-span-1">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        <div className="border rounded-md">
            {isLoading ? (
                <div className="p-4 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRequests.length > 0 ? filteredRequests.map(request => (
                        <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id.substring(0, 8)}</TableCell>
                        <TableCell>{request.customerName}</TableCell>
                        <TableCell>{request.deviceType} - {request.brand}</TableCell>
                        <TableCell>{format(request.submittedAt.toDate(), 'PPP')}</TableCell>
                        <TableCell>{request.cost ? `₹${request.cost.toFixed(2)}` : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No records found for the selected filters.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

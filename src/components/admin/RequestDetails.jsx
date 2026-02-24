import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Laptop, Monitor, Printer, HelpCircle, MessageSquare, AlertCircle, Building, Settings2, ListChecks, ShieldCheck, CalendarDays, CheckCircle, XCircle, Loader2, Briefcase, PartyPopper, Ban, Banknote, FileText, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFirestore, updateServiceRequestStatus, completeServiceRequest } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const deviceIcons = {
  Laptop: <Laptop className="h-5 w-5 text-muted-foreground" />,
  Desktop: <Monitor className="h-5 w-5 text-muted-foreground" />,
  Printer: <Printer className="h-5 w-5 text-muted-foreground" />,
  Software: <Settings2 className="h-5 w-5 text-muted-foreground" />,
};

const completeRequestSchema = z.object({
  cost: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: 'Cost must be a positive number.' })
  ),
  invoiceNotes: z.string().optional(),
});

export function RequestDetails({ request }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const completeForm = useForm({
    resolver: zodResolver(completeRequestSchema),
    defaultValues: {
      cost: 0.00,
      invoiceNotes: '',
    },
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      case 'Paid': return 'bg-purple-500';
      case 'Cancelled': return 'bg-red-500';
      case 'Awaiting Parts': return 'bg-orange-500';
      case 'Scheduled': return 'bg-green-500';
      case 'Declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const isAntivirusRequest = request.deviceType === 'Software' && request.brand === 'Anti-virus & Security';

  const handleStatusUpdate = async (newStatus) => {
    if (!firestore) return;
    setUpdatingStatus(newStatus);
    try {
        await updateServiceRequestStatus(firestore, request.id, newStatus);
        toast({
            title: 'Request Updated',
            description: `Request status changed to "${newStatus}".`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the request status. Please try again.',
        });
    } finally {
        setUpdatingStatus(null);
    }
  };

  const handleCompleteRequest = async (values) => {
    if (!firestore) return;
    setUpdatingStatus('Completed');
    try {
        await completeServiceRequest(firestore, request.id, {
            cost: values.cost,
            invoiceNotes: values.invoiceNotes,
        });
        toast({
            title: 'Request Completed',
            description: 'Request has been marked as completed and billed.',
        });
        setIsCompleteDialogOpen(false);
        completeForm.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not complete the request. Please try again.',
        });
    } finally {
        setUpdatingStatus(null);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">Request {request.id.substring(0, 8)}</CardTitle>
            <CardDescription>Submitted on {format(request.submittedAt.toDate(), 'PPP')}</CardDescription>
          </div>
          <Badge className="flex items-center gap-2" variant="outline">
            <span className={cn("h-2 w-2 rounded-full", getStatusClass(request.status))}></span>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {request.appointmentDate && (
            <>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Booking Request</h3>
                    <Alert>
                        <CalendarDays className="h-4 w-4" />
                        <AlertTitle>Requested Appointment: {format(request.appointmentDate.toDate(), 'PPP')}</AlertTitle>
                        {request.status === 'Pending' && (
                            <AlertDescription className="mt-4 flex gap-2">
                                <Button size="sm" onClick={() => handleStatusUpdate('Scheduled')} disabled={!!updatingStatus}>
                                    {updatingStatus === 'Scheduled' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Accept
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('Declined')} disabled={!!updatingStatus}>
                                    {updatingStatus === 'Declined' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                    Decline
                                </Button>
                            </AlertDescription>
                        )}
                         {(request.status === 'Scheduled' || request.status === 'Declined') && (
                             <AlertDescription className="mt-2 text-sm">
                                This booking request has been <span className="font-semibold">{request.status.toLowerCase()}</span>.
                             </AlertDescription>
                         )}
                    </Alert>
                </div>
                <Separator />
            </>
        )}
        <div>
            <h3 className="font-semibold text-lg mb-4">Manage Request Status</h3>
            <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleStatusUpdate('In Progress')} disabled={!!updatingStatus || ['In Progress', 'Completed', 'Cancelled', 'Paid'].includes(request.status)}>
                    {updatingStatus === 'In Progress' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
                    In Progress
                </Button>
                
                <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" disabled={!!updatingStatus || ['Completed', 'Cancelled', 'Paid'].includes(request.status)} className="bg-green-600 hover:bg-green-700 text-white">
                            <PartyPopper className="mr-2 h-4 w-4" />
                            Completed
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Complete Service &amp; Generate Bill</DialogTitle>
                            <DialogDescription>
                                Enter the final cost and any billing notes for request {request.id.substring(0, 8)}.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...completeForm}>
                            <form onSubmit={completeForm.handleSubmit(handleCompleteRequest)} className="space-y-4 py-4">
                                <FormField
                                    control={completeForm.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Final Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="1500.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={completeForm.control}
                                    name="invoiceNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Billing Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., Replaced SSD, installed new OS." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={updatingStatus === 'Completed'}>
                                        {updatingStatus === 'Completed' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Mark as Completed & Bill
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {request.status === 'Completed' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={!!updatingStatus}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Confirm Payment
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Payment Received?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action marks the request as paid and cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusUpdate('Paid')} disabled={!!updatingStatus}>
                                    {updatingStatus === 'Paid' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Yes, Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('Cancelled')} disabled={!!updatingStatus || ['Completed', 'Cancelled', 'Paid'].includes(request.status)}>
                    {updatingStatus === 'Cancelled' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                    Cancel
                </Button>
            </div>
        </div>
        <Separator />
        {(request.status === 'Completed' || request.status === 'Paid') && request.cost != null && (
            <>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Billing Details</h3>
                    <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Banknote className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">Total Cost:</span>
                            <span>₹{request.cost.toFixed(2)}</span>
                        </div>
                        {request.invoiceNotes && (
                            <div className="flex gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                                <p className="text-sm">{request.invoiceNotes}</p>
                            </div>
                        )}
                        {request.status === 'Paid' && (
                             <div className="flex items-center gap-3 pt-2 text-green-600">
                                <CheckCircle className="h-5 w-5"/>
                                <span className="font-semibold">Payment Confirmed</span>
                            </div>
                        )}
                    </div>
                </div>
                <Separator />
            </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Information</h3>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" /> <span>{request.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" /> <span>{request.customerEmail}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Device/Service Information</h3>
            <div className="flex items-center gap-3">
              {deviceIcons[request.deviceType] || <HelpCircle className="h-5 w-5 text-muted-foreground" />} <span>{request.deviceType}</span>
            </div>
            <div className="flex items-center gap-3">
              {request.deviceType === 'Software' 
                ? <ListChecks className="h-5 w-5 text-muted-foreground" />
                : <Building className="h-5 w-5 text-muted-foreground" />
              }
              <span>{request.brand}</span>
            </div>
            {isAntivirusRequest ? (
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <span>{request.osVersion}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs bg-muted p-1 rounded">OS</span>
                <span>{request.osVersion}</span>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold text-lg mb-2">Issue Details</h3>
          <div className="space-y-4 rounded-md border p-4 bg-muted/50">
            <div className="flex gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
              <p className="text-sm">{request.issueDescription}</p>
            </div>
            {request.errorMessages && (
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0"/>
                <p className="text-sm font-mono bg-destructive/10 p-2 rounded">{request.errorMessages}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

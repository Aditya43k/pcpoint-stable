'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useFirestore, useUser, setServiceRequest } from '@/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const deviceBrands = {
  Laptop: ['HP', 'Acer', 'Dell', 'Asus', 'Lenovo', 'Apple', 'MSI', 'Razer', 'Samsung', 'Microsoft', 'Other'],
  Desktop: ['Dell', 'HP', 'Apple', 'Lenovo', 'Acer', 'Custom Build', 'Other'],
  Printer: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Lexmark', 'Samsung', 'Other'],
  Software: ['OS Installation', 'Anti-virus & Security', 'Data Recovery', 'Other'],
};

const antivirusBrands = ['McAfee', 'NPAV', 'Quick Heal', 'Kaspersky', 'Bitdefender', 'Other'];

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  customerEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  deviceType: z.enum(['Laptop', 'Desktop', 'Printer', 'Software']),
  brand: z.string({ required_error: 'Please select an option.' }).min(1, { message: 'Please select an option.' }),
  osVersion: z.string().min(2, { message: 'This field is required.' }),
  issueDescription: z.string().min(20, { message: 'Please provide a detailed description of at least 20 characters.' }),
  appointmentDate: z.date().optional(),
});

export function ServiceRequestForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: user?.displayName || '',
      customerEmail: user?.email || '',
      brand: '',
      osVersion: '',
      issueDescription: '',
    },
  });

  useEffect(() => {
    if (user) {
        form.reset({
            customerName: user.displayName || '',
            customerEmail: user.email || '',
        });
    }
  }, [user, form]);


  const deviceType = form.watch('deviceType');
  const brand = form.watch('brand');
  const brands = deviceType ? deviceBrands[deviceType] : [];
  const brandLabel = deviceType === 'Software' ? 'Service Type' : 'Brand';
  const brandPlaceholder = deviceType === 'Software' ? 'Select a service' : 'Select a brand';
  
  const isAntivirusRequest = deviceType === 'Software' && brand === 'Anti-virus & Security';

  useEffect(() => {
    if (deviceType) {
      form.resetField('brand', { defaultValue: '' });
    }
  }, [deviceType, form]);

  useEffect(() => {
    // If it's a printer, set osVersion to 'N/A' to pass validation since field is hidden.
    if (deviceType === 'Printer') {
      form.setValue('osVersion', 'N/A', { shouldValidate: true });
    }
    // If it's software, reset the field because it might be for antivirus brand.
    else if (deviceType === 'Software') {
      form.resetField('osVersion', { defaultValue: '' });
    }
    // If switching to Laptop/Desktop from printer, clear the 'N/A' value.
    else {
      if (form.getValues('osVersion') === 'N/A') {
        form.setValue('osVersion', '', { shouldValidate: true });
      }
    }
  }, [deviceType, brand, form]);

  async function onSubmit(values) {
    if (!user || !firestore) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to submit a request.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = setServiceRequest(firestore, user.uid, values);
      
      toast({
        title: 'Request Submitted!',
        description: `Your service request ID is ${requestData.id}. We will be in touch shortly.`,
        variant: 'default',
        className: 'bg-accent text-accent-foreground'
      });
      router.push('/');

    } catch (error) {
       toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{brandLabel}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={!deviceType}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={deviceType ? brandPlaceholder : "Select a category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {deviceType !== 'Printer' && (
            <>
              {isAntivirusRequest ? (
                <FormField
                  control={form.control}
                  name="osVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antivirus Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an antivirus brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {antivirusBrands.map((avBrand) => (
                            <SelectItem key={avBrand} value={avBrand}>{avBrand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select 'Other' if your brand is not listed and specify it in the description below.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                    control={form.control}
                    name="osVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operating System &amp; Version</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Windows 11, macOS Sonoma, N/A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="issueDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Issue Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the problem in detail. What were you doing when it happened? Have you tried any troubleshooting steps?"
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  For hardware, mention if you need a replacement or repair. For software, specify versions or antivirus brands if applicable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Preferred Appointment Date (Optional)</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                        )}
                        >
                        {field.value ? (
                            format(field.value, 'PPP')
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date < new Date(new Date().setDate(new Date().getDate() - 1))
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormDescription>
                    Choose a convenient date for your on-site service or drop-off.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

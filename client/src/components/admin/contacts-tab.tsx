import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@shared/schema";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash, Eye } from "lucide-react";

// Define response types to help with proper typing
type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export function ContactsTab() {
  const [isDeleteContactDialogOpen, setIsDeleteContactDialogOpen] = useState(false);
  const [isViewContactDialogOpen, setIsViewContactDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  // Fetch contacts
  const {
    data: contactsApiResponse,
    isLoading: isContactsLoading,
    isError: isContactsError,
  } = useQuery<ApiResponse<Contact[]>>({
    queryKey: ["/api/contact"],
  });

  // Extract contacts data from API response
  const contactsData = contactsApiResponse?.data || [];

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      setIsDeleteContactDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  // Open dialog for viewing a contact
  const handleViewContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsViewContactDialogOpen(true);
  };

  // Open dialog for deleting a contact
  const handleDeleteContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsDeleteContactDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contacts</h2>
      </div>

      {isContactsError ? (
        <div className="text-center p-8 text-red-500">
          Failed to load contacts. Please try again.
        </div>
      ) : isContactsLoading ? (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Loading contacts...</p>
        </div>
      ) : contactsData.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          No contacts yet.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsData.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.id}</TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {contact.message}
                  </TableCell>
                  <TableCell>
                    {new Date(contact.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteContact(contact)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Contact Dialog */}
      <Dialog
        open={isViewContactDialogOpen}
        onOpenChange={setIsViewContactDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {currentContact && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm">{currentContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">{currentContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <p className="text-sm whitespace-pre-wrap">
                  {currentContact.message}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted At
                </label>
                <p className="text-sm">
                  {new Date(currentContact.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <AlertDialog
        open={isDeleteContactDialogOpen}
        onOpenChange={setIsDeleteContactDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact from "{currentContact?.name}" ({currentContact?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentContact) {
                  deleteContactMutation.mutate(currentContact.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
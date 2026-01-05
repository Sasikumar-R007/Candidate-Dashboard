import { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatDockProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
}

export function ChatDock({ open, onClose, userName = "User", userRole = "User" }: ChatDockProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your message before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/support/query', {
        userName,
        userRole,
        message: message.trim()
      });

      if (response.ok) {
        const data = await response.json();
        setShowSuccessMessage(true);
        setMessage('');
      } else {
        throw new Error('Failed to submit query');
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit your query. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccessMessage(false);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - only shown when modal is open */}
      <div 
        className="fixed inset-0 bg-black/50 pointer-events-auto"
        onClick={handleClose}
      />
      
      {/* Chat Modal - Bottom Right Floating */}
      <div 
        className="fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[calc(100vh-3rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white">Chat</h2>
          </div>
          
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-chat"
            title="Close Chat"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showSuccessMessage ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Your query has been noted. Our production team will reach out to you.
              </p>
              <Button 
                onClick={handleClose}
                className="mt-6"
                variant="outline"
              >
                Close
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Report issues, bugs, or queries here
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, bug, or query..."
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

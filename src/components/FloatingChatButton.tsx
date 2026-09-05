import { MessageCircle, X, Minimize2, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { Message } from '@/types';

export const FloatingChatButton = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL RETURNS BEFORE HOOKS
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Check if we should show the chat button
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const shouldShowChat = !isAuthPage && !isAdmin;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && shouldShowChat) {
      loadMessages();
    }
  }, [isOpen, isMinimized, shouldShowChat]);

  const loadMessages = async () => {
    if (!shouldShowChat) return;
    
    try {
      setLoading(true);
      if (user) {
        const userMessages = await api.getConversationMessages(user.id);
        setMessages(userMessages);
      } else if (guestInfoSubmitted) {
        const guestMessages = await api.getGuestMessages(guestEmail);
        setMessages(guestMessages);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error loading messages',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (guestName.trim() && guestEmail.trim() && emailRegex.test(guestEmail)) {
      setGuestInfoSubmitted(true);
      loadMessages();
    } else {
      toast({
        title: 'Invalid information',
        description: 'Please enter a valid name and email address',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !shouldShowChat) return;

    try {
      if (user) {
        await api.sendMessage({
          text: message,
          conversationId: user.id,
        });
      } else if (guestInfoSubmitted) {
        await api.sendGuestMessage({
          text: message,
          guestName,
          guestEmail,
        });
      } else {
        toast({
          title: 'Please enter your information first',
          variant: 'destructive',
        });
        return;
      }

      setMessage('');
      setTimeout(loadMessages, 100);
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setGuestInfoSubmitted(false);
    setGuestName('');
    setGuestEmail('');
    setMessage('');
    setMessages([]);
  };

  // CONDITIONAL RETURN AT THE END - AFTER ALL HOOKS
  if (!shouldShowChat) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Dialog */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 shadow-2xl z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pr-4">
            <CardTitle className="text-lg">
              {user ? 'Chat Support' : 'Guest Chat'}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="space-y-4">
              {/* Guest Info Form */}
              {!user && !guestInfoSubmitted && (
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleGuestSubmit}
                    disabled={!guestName.trim() || !guestEmail.trim()}
                    className="w-full"
                  >
                    Start Chat
                  </Button>
                </div>
              )}

              {/* Messages Area */}
              {(user || guestInfoSubmitted) && (
                <>
                  <div className="h-64 overflow-y-auto space-y-3 p-2 border rounded-lg">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.isAdmin
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {msg.isAdmin && (
                              <p className="text-xs font-semibold mb-1">Support</p>
                            )}
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!user && !guestInfoSubmitted}
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      disabled={!user && !guestInfoSubmitted}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};
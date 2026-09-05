import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Message, Conversation } from '@/types';
import { Send, Trash2, Mail, User, MessageCircle, Contact } from 'lucide-react';

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadConversations();
  }, [isAdmin, navigate]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await api.getConversations();
      setConversations(conversationsData);
    } catch (error: any) {
      toast({
        title: 'Failed to load conversations',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await api.getConversationMessages(conversationId);
      setMessages(messagesData);
    } catch (error: any) {
      toast({
        title: 'Failed to load messages',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.sendMessage({
        text: newMessage,
        conversationId: selectedConversation._id,
        isAdminReply: true,
      });
      
      setNewMessage('');
      await loadMessages(selectedConversation._id);
      await loadConversations(); 
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.deleteConversation(conversationId);
      toast({ title: 'Conversation deleted successfully' });
      
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (error: any) {
      toast({
        title: 'Failed to delete conversation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const getConversationDisplayName = (conversation: Conversation) => {
    const lastMessage = conversation.lastMessage;
    
    if (lastMessage.senderName) {
      return lastMessage.senderName;
    }
    
    return 'Unknown User';
  };

  const getConversationEmail = (conversation: Conversation) => {
    return conversation.lastMessage.senderEmail;
  };

  const isContactFormMessage = (message: Message) => {
    return message.text.startsWith('[Contact Form]');
  };

  const isContactFormConversation = (conversation: Conversation) => {
    return isContactFormMessage(conversation.lastMessage);
  };

  const handleEmailUser = (email: string, name: string, subject?: string) => {
    const emailSubject = subject ? `Re: ${subject}` : 'Re: Your message';
    const emailBody = `Dear ${name},\n\nThank you for your message. `;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const parseContactFormData = (message: Message) => {
    if (!isContactFormMessage(message)) return null;

    const text = message.text;
    const subjectMatch = text.match(/Subject: (.+?)\n/);
    const emailMatch = text.match(/Email: (.+?)$/);
    const messageMatch = text.match(/\n\n(.+?)\n\nEmail:/s);
    
    return {
      subject: subjectMatch?.[1] || 'No Subject',
      email: emailMatch?.[1] || '',
      originalMessage: messageMatch?.[1] || text
    };
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-8">Customer Conversations</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Conversations</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {conversations.length} active conversations
              </p>
            </div>
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              ) : (
                conversations.map((conversation) => {
                  const isContact = isContactFormConversation(conversation);
                  const displayName = getConversationDisplayName(conversation);
                  const email = getConversationEmail(conversation);
                  const contactData = parseContactFormData(conversation.lastMessage);
                  
                  return (
                    <div
                      key={conversation._id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedConversation?._id === conversation._id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isContact ? (
                              <Contact className="h-4 w-4 text-blue-500" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-semibold">
                              {displayName}
                            </span>
                            <Badge 
                              variant={isContact ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {isContact ? 'Contact Form' : 'Chat'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {isContact && contactData ? contactData.subject : conversation.lastMessage.text}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                      {selectedConversation ? 
                        `Conversation with ${getConversationDisplayName(selectedConversation)}` : 
                        'Select a conversation'
                      }
                    </h2>
                    {selectedConversation && (
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getConversationEmail(selectedConversation)}
                          </span>
                        </div>
                        <Badge variant={isContactFormConversation(selectedConversation) ? "default" : "secondary"}>
                          {isContactFormConversation(selectedConversation) ? 'Contact Form' : 'Live Chat'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const contactMessage = messages.find(m => isContactFormMessage(m));
                            const contactData = contactMessage ? parseContactFormData(contactMessage) : null;
                            const subject = contactData?.subject;
                            handleEmailUser(
                              getConversationEmail(selectedConversation),
                              getConversationDisplayName(selectedConversation),
                              subject
                            );
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Reply via Email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                {selectedConversation ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isContactMessage = isContactFormMessage(message);
                      const contactData = isContactMessage ? parseContactFormData(message) : null;
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.isAdmin
                                ? 'bg-primary text-primary-foreground'
                                : isContactMessage
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm">
                                {message.isAdmin ? 'You (Admin)' : message.senderName}
                              </span>
                              {message.senderId === 'guest' && !isContactMessage && (
                                <Badge variant="secondary" className="text-xs">
                                  Guest
                                </Badge>
                              )}
                              {isContactMessage && (
                                <Badge variant="default" className="text-xs">
                                  Contact Form
                                </Badge>
                              )}
                            </div>
                            
                            {isContactMessage && contactData ? (
                              <div className="space-y-3">
                                <div>
                                  <span className="font-medium text-sm">Subject:</span>
                                  <p className="text-sm mt-1">{contactData.subject}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-sm">Message:</span>
                                  <p className="text-sm mt-1 whitespace-pre-wrap">{contactData.originalMessage}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{message.text}</p>
                            )}
                            
                            <p className={`text-xs mt-2 ${
                              message.isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <MessageCircle className="h-12 w-12 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                    <p className="text-sm">You can reply to contact forms or continue live chats</p>
                  </div>
                )}
              </ScrollArea>

              {selectedConversation && (
                <div className="p-6 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={
                        isContactFormConversation(selectedConversation) 
                          ? "Type your response to this contact form..." 
                          : "Type your reply..."
                      }
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {isContactFormConversation(selectedConversation) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      This conversation started from a contact form. Use the email button above to send a formal response.
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  X, 
  Minimize2,
  Maximize2,
  Bot,
  User,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  type Message = {
    id: number;
    type: 'ai' | 'user';
    content: string;
    timestamp: Date;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi Priya! I'm your Smart Shaadi Bot 🎉 I'm here to help you plan the perfect wedding. What would you like assistance with today?",
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    "Suggest decor themes for Mehendi",
    "Budget optimization tips",
    "Wedding checklist timeline",
    "Vendor negotiation advice",
    "Menu planning ideas",
    "Photography shot list"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: getAIResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('decor') || lowerMessage.includes('decoration')) {
      return "For Mehendi decor, I recommend a vibrant yellow and orange theme with marigold flowers, fairy lights, and traditional brass elements. Consider setting up photo booths with floral backdrops and low seating with colorful cushions. Would you like specific vendor recommendations?";
    }
    
    if (lowerMessage.includes('budget')) {
      return "Based on your current spending pattern, I suggest reallocating 15% from decoration to photography for better memories. You're doing great staying under budget in most categories! Would you like a detailed budget rebalancing plan?";
    }
    
    if (lowerMessage.includes('timeline') || lowerMessage.includes('checklist')) {
      return "Here's your priority timeline: 30 days before - finalize catering menu, 15 days before - confirm all vendor timings, 7 days before - final guest count to caterer, 3 days before - decoration setup begins. Shall I create a detailed daily checklist?";
    }
    
    return "That's a great question! Let me help you with that. For wedding planning, I can assist with budget optimization, vendor management, timeline planning, guest coordination, and creative suggestions. What specific aspect would you like to explore further?";
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full hero-button shadow-lg hover:shadow-xl relative animate-glow"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-float">
            <Sparkles className="h-3 w-3 text-accent-foreground ml-0.5 mt-0.5" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "wedding-card transition-all duration-300 shadow-xl",
        isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
      )}>
        {/* Header */}
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Smart Shaadi Bot</span>
                  <Sparkles className="h-4 w-4 text-accent" />
                </CardTitle>
                <p className="text-xs text-muted-foreground">Your AI wedding assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto max-h-80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg space-y-1",
                      msg.type === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {msg.type === 'ai' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Prompts */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1">
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => handleQuickPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your wedding..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                  className="hero-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIAssistant;
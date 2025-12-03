import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Send,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  sources?: string[];
  timestamp: string;
}

export function StudentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "Hello Jane! I'm your Graduate Programme Knowledge Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const suggestedQuestions = [
    "What are my first 90 days milestones?",
    "How do I request time off?",
    "What training is available?",
    "Who is my HR contact?"
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Simulate bot response
    const botMessage: Message = {
      id: messages.length + 2,
      type: 'bot',
      content: "Your first 90 days include orientation (Week 1), technical training (Weeks 2-4), project shadowing (Weeks 5-8), and first independent project (Weeks 9-12). You'll have weekly check-ins with your mentor throughout.",
      sources: ['Graduate Handbook 2025, Section 2.3', 'Onboarding Schedule'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage, botMessage]);
    setInputValue('');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="pt-8 h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Chat Assistant</h1>
          <p className="text-gray-600">Ask me anything about the graduate programme</p>
        </div>

        {/* Chat container */}
        <Card className="flex-1 border-gray-200 flex flex-col overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-gray-500">Knowledge Assistant</span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-4 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-tr-sm' 
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>

                  {message.sources && (
                    <div className="mt-2 space-y-1">
                      {message.sources.map((source, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.type === 'bot' && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {message.type === 'user' && (
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested questions (only show when no messages) */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500 mb-3">Suggested questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-left justify-start h-auto py-2 px-3 text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-end gap-3">
              <Input
                placeholder="Type your question here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="rounded-xl"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-xl flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

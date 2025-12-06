import React, { useState } from 'react';
import axios from 'axios';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/ai/chat', { message });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error in AI chat:', error);
    }
  };

  return (
    <div className="card-modern max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center ring-1 ring-white/10">🤖</span>
        AI Assistant
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-modern w-full"
          placeholder="Ask anything about your capsules..."
        />
        <div className="flex items-center justify-between gap-3">
          <button 
            type="submit"
            className="btn-primary px-5 py-2 text-sm"
          >
            Send
          </button>
          {message && <span className="text-xs text-surface-400">Press Enter to send</span>}
        </div>
      </form>
      {response && (
        <div className="mt-5 bg-surface-800/70 border border-surface-700/50 rounded-xl2 p-4 text-sm text-surface-200 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
};

export default AIChat;
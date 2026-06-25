import { useState, useEffect, useRef, useCallback } from 'react';
import { OverlayWindow } from './components/OverlayWindow';
import { ChatMessage } from './components/ChatMessage';
import { MicButton } from './components/MicButton';
import { TextInput } from './components/TextInput';
import { TTSToggle } from './components/TTSToggle';
import { askSocratic, ChatMessage as ChatMsg } from './services/aiBrain';
import { AudioRecorder, transcribeAudio } from './services/groqSTT';
import { speak, stopSpeaking } from './services/ttsService';

export default function App() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [attachScreenshot, setAttachScreenshot] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onScreenCaptured((base64Image) => {
      setScreenshotUrl(base64Image);
      setAttachScreenshot(false);
    });

    window.electronAPI.onWindowVisibilityChange((visible) => {
      if (!visible) {
        setInput('');
        setError(null);
        setScreenshotUrl(null);
        setAttachScreenshot(false);
        stopSpeaking();
        if (isRecording) {
          recorderRef.current?.stop().catch(() => {});
          setIsRecording(false);
        }
      }
    });
  }, [isRecording]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const imageToSend = attachScreenshot ? screenshotUrl : null;
    const userMsg: ChatMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askSocratic(trimmed, imageToSend);
      const assistantMsg: ChatMsg = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMsg]);

      if (attachScreenshot) {
        setScreenshotUrl(null);
        setAttachScreenshot(false);
      }

      if (ttsEnabled) {
        speak(response);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied.';
      setError(message);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const blob = await recorderRef.current.stop();
      const transcript = await transcribeAudio(blob);
      if (transcript) {
        await sendMessage(transcript);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed.';
      setError(message);
    } finally {
      setIsTranscribing(false);
      recorderRef.current = null;
    }
  };

  const handleTtsToggle = () => {
    if (ttsEnabled) {
      stopSpeaking();
    }
    setTtsEnabled((prev) => !prev);
  };

  const isBusy = isLoading || isTranscribing;

  return (
    <OverlayWindow>
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <p className="text-zinc-500 text-sm leading-relaxed">
              I won't give you the answer — but I'll help you find it yourself.
            </p>
            <p className="text-zinc-600 text-xs mt-2">
              Type a question or tap the mic. Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs">Ctrl+Shift+Space</kbd> to summon me anytime.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-zinc-800/70 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-zinc-700/30">
              <span className="text-zinc-500 text-sm animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400/80 text-xs text-center py-2 px-4">{error}</div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-zinc-800/50 flex items-end gap-2">
        <MicButton
          isRecording={isRecording}
          isProcessing={isBusy}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          disabled={isBusy || isRecording}
          screenshotUrl={screenshotUrl}
          attachScreenshot={attachScreenshot}
          onAttachScreenshotChange={setAttachScreenshot}
          onDismissScreenshot={() => {
            setScreenshotUrl(null);
            setAttachScreenshot(false);
          }}
        />
        <TTSToggle enabled={ttsEnabled} onToggle={handleTtsToggle} />
      </div>
    </OverlayWindow>
  );
}

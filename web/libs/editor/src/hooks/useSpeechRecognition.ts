import { useEffect, useRef, useState } from "react";

type UseSpeechRecognitionProps = {
  onResult: (text: string) => void;
  lang?: string;
};

export const useSpeechRecognition = ({ onResult, lang = "en-US" }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [lang, onResult]);

  const start = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return { start, stop, listening, supported };
};
import { useEffect, useRef, useState } from "react";

type UseSpeechRecognitionProps = {
  onResult: (text: string) => void;
  lang?: string;
};

export const useSpeechRecognition = ({ onResult, lang = "en-US" }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) transcript += `${result[0].transcript} `;
        }
        if (transcript) onResult(transcript.trim());
      };
      recognition.onend = () => {
        if (listeningRef.current) {
          recognition.start();
        } else {
          setListening(false);
        }
    };
    recognitionRef.current = recognition;
  }, [lang, onResult]);

  const start = () => {
    if (recognitionRef.current) {
      listeningRef.current = true;
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stop = () => {
    if (recognitionRef.current) {
        listeningRef.current = false;
        recognitionRef.current.stop();
      }
  };

  return { start, stop, listening, supported };
};
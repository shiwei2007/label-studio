import { useEffect, useRef, useState } from "react";

type UseSpeechRecognitionProps = {
  onResult: (text: string) => void;
  lang?: string;
};

export const useSpeechRecognition = ({ onResult, lang = "en-US" }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const transcriptRef = useRef("");
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
        let chunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) chunk += `${result[0].transcript} `;
        }
        const text = chunk.trim();
        if (!text) return;
  
        const existing = transcriptRef.current;
        let addition = text;
        if (existing) {
          const existingWords = existing.split(/\s+/);
          const newWords = text.split(/\s+/);
          const maxOverlap = Math.min(existingWords.length, newWords.length);
          let overlap = 0;
          for (let i = maxOverlap; i > 0; i--) {
            const endSlice = existingWords.slice(-i).join(" ").toLowerCase();
            const startSlice = newWords.slice(0, i).join(" ").toLowerCase();
            if (endSlice === startSlice) {
              overlap = i;
              break;
            }
          }
          addition = newWords.slice(overlap).join(" ");
          if (!addition && existing.toLowerCase().includes(text.toLowerCase())) return;
        }
  
        if (addition) {
          transcriptRef.current = `${existing}${existing ? " " : ""}${addition}`.trim();
          onResult(addition);
        }
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
      transcriptRef.current = "";
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
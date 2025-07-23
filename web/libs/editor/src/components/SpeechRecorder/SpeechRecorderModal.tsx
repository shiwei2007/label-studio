import { type FC, useState, useRef, useEffect } from "react";
import { Modal, Button } from "antd";
import { IconMicrophone, IconPlay } from "@humansignal/icons";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

export type SpeechRecorderModalProps = {
  visible: boolean;
  onCancel: () => void;
  onDone: (text: string) => void;
};

export const SpeechRecorderModal: FC<SpeechRecorderModalProps> = ({ visible, onCancel, onDone }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [transcript, setTranscript] = useState("");
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { start, stop } = useSpeechRecognition({
    onResult: (text: string) => setTranscript((prev) => (prev ? `${prev} ${text}` : text)),
  });

  useEffect(() => {
    if (!visible) {
      stopRecording();
      setAudioUrl(undefined);
      setTranscript("");
    }
  }, [visible]);

  const startRecording = async () => {
    if (recording) {
      stopRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recording) {
      mediaRecorder?.stop();
      stop();
      setRecording(false);
    }
  };

  const play = () => {
    audioRef.current?.play();
  };

  const handleDone = () => {
    stopRecording();
    if (transcript.trim()) onDone(transcript.trim());
    onCancel();
  };

  return (
    <Modal title="Speech Recorder" open={visible} onCancel={onCancel} footer={null} destroyOnClose>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button
            type="primary"
            onClick={startRecording}
            danger={recording}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            icon={<IconMicrophone />}
          >
            {recording ? "Stop" : audioUrl ? "Re-record" : "Record"}
          </Button>
          <Button
            onClick={play}
            disabled={!audioUrl}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            icon={<IconPlay />}
          />
          <Button type="primary" onClick={handleDone}>
            Done
          </Button>
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          style={{
            alignSelf: "center",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
        >
          <track kind="captions" />
        </audio>
      </div>
    </Modal>
  );
};
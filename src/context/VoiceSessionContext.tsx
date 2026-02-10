"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  ConversationMessage,
  CreditFormFields,
  EMPTY_FORM,
  VoiceSessionState,
} from "@/types";

interface VoiceSessionContextType {
  formFields: CreditFormFields;
  setFormFields: React.Dispatch<React.SetStateAction<CreditFormFields>>;
  conversationHistory: ConversationMessage[];
  addMessage: (msg: ConversationMessage) => void;
  clearConversation: () => void;
  sessionState: VoiceSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<VoiceSessionState>>;
  isVoiceOverlayOpen: boolean;
  setIsVoiceOverlayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  analyserNode: React.RefObject<AnalyserNode | null>;
}

const VoiceSessionContext = createContext<VoiceSessionContextType | null>(null);

export function VoiceSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formFields, setFormFields] = useState<CreditFormFields>({
    ...EMPTY_FORM,
  });
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [sessionState, setSessionState] = useState<VoiceSessionState>("idle");
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  const analyserNode = useRef<AnalyserNode | null>(null);

  const addMessage = useCallback((msg: ConversationMessage) => {
    setConversationHistory((prev) => prev.slice(-18).concat(msg));
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return (
    <VoiceSessionContext.Provider
      value={{
        formFields,
        setFormFields,
        conversationHistory,
        addMessage,
        clearConversation,
        sessionState,
        setSessionState,
        isVoiceOverlayOpen,
        setIsVoiceOverlayOpen,
        analyserNode,
      }}
    >
      {children}
    </VoiceSessionContext.Provider>
  );
}

export function useVoiceSession() {
  const ctx = useContext(VoiceSessionContext);
  if (!ctx) throw new Error("useVoiceSession must be used within VoiceSessionProvider");
  return ctx;
}

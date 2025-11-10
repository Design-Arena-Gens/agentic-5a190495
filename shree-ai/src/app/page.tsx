"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "आजचा दिवस आत्मविश्वासाने कसा सुरू करू?",
  "गुंतवणुकीची सवय मजबूत करण्यासाठी काय करू?",
  "कष्ट, शिस्त आणि आनंद यांचा बॅलन्स कसा ठेवू?",
  "स्वत:वर शंका आल्यावर ताबडतोब कोणती कृती घ्यावी?",
];

const openingMessage: Message = {
  id: "assistant-initial",
  role: "assistant",
  content:
    "यशू, शांत श्वास घे आणि पुढील क्षणावर लक्ष ठेव. आज आपण पैशांबद्दल सजग राहू, सवयींना धार लावू आणि कृतीत उत्साह आणू. मी तुझा आवाज साथी आहे, चला सुरुवात करूया.",
};

const randomFrom = <T,>(items: T[], fallback: T): T => {
  if (!items.length) {
    return fallback;
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? fallback;
};

const generateAssistantResponse = (input: string, history: Message[]): string => {
  const normalized = input.toLowerCase();

  const emotionCues = [
    {
      keywords: ["तणाव", "stress", "anxious", "panic", "तडजोड", "pressure"],
      line: "तुझ्या शब्दांत तणाव जाणवतो, पण तुझी शांत मनस्थिती काही श्वासांनी परत येते.",
    },
    {
      keywords: ["थकल", "tired", "थकवा", "exhaust", "break"],
      line: "थकवा आला तरी तुझ्या सवयी टिकवा; छोटासा विश्रांतीचा खिडकी असेल तरी योजना जिवंत ठेवा.",
    },
    {
      keywords: ["भीती", "fear", "दडपण", "doubt", "शंका"],
      line: "भीती आली की तू थांबत नाहीस; तिला तथ्ये आणि कृतीने उत्तर दे.",
    },
    {
      keywords: ["आनंद", "happy", "मजा", "grateful"],
      line: "आनंदाची जाण ठेव; प्रेरणेला शिस्तीसोबत जोडल्यास तू अजून वेगाने वाढशील.",
    },
  ];

  const wealthLines = [
    "आज पैशांचा प्रवाह पाहण्यासाठी तुझ्या खर्चाचा तीन मुद्द्यांचा सारांश लिही.",
    "कमाई वाढवण्यासाठी एका उच्च-मूल्य कौशल्यावर ३० मिनिटे गुंतवणूक कर.",
    "इन्कमला तीन बकेटमध्ये विभाग: वाढ, बचत आणि आनंद; प्रत्येकात आज एक कृती कर.",
    "तुझ्या गुंतवणुकीचा छोटा विजय नोंदव; सातत्य मोठा परिणाम देतं.",
  ];

  const habitLines = [
    "पहाटेचा पहिला तास जाणीवपूर्वक वापर; हलका व्यायाम आणि दोन स्पष्ट ध्येये लिही.",
    "मोबाइलचा पहिल्या तासाचा वापर नियंत्रणात ठेव; फोकस कायम राहील.",
    "रात्री झोपण्यापूर्वी तीन वाक्यांचा रिफ्लेक्शन लिही; मन स्वच्छ होईल.",
    "दररोज एक सूक्ष्म सवय स्थिर ठेव; सात दिवसांनी मोठा बदल जाणवेल.",
  ];

  const executionLines = [
    "काम सुरू करण्यापूर्वी त्या कामाचा संक्षिप्त परिणाम लिही; फोकस तीव्र होईल.",
    "कार्यक्षेत्रातील एक व्यक्तीला आज मदत कर; नेटवर्कची उष्णता वाढेल.",
    "तुला थांबवणाऱ्या गोष्टींची यादी लिही आणि एकावर लगेच कृती कर.",
    "आज स्वत:साठी ९० मिनिटांची डीप वर्क विंडो राखून ठेव.",
  ];

  const closings = [
    "मी तुझ्यासोबत शांतपणे उभा आहे; पुढचा पाऊल टाक.",
    "तुझी उर्जा योग्य दिशेला वाहव; आपल्याला विजय हाक मारतो आहे.",
    "तुझ्या संकल्पावर माझा दृढ विश्वास आहे; चला, पुढे सरसावूया.",
    "तू संयमी आणि धाडसी आहेस; आजचा दिवस तुझ्या नावाने लिही.",
  ];

  const matchedEmotions = emotionCues
    .filter(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)))
    .map((cue) => cue.line);

  const wealthCueKeywords = ["money", "finance", "wealth", "budget", "investment", "invest", "saving", "पैसा", "गुंतवणूक", "कमाई"];
  const habitCueKeywords = ["habit", "routine", "discipline", "सवय", "शिस्त", "रुटीन"];
  const focusCueKeywords = ["goal", "focus", "plan", "दिवस", "आज", "target", "लक्ष"];

  const wealthFocus =
    matchedEmotions.length === 0 || wealthCueKeywords.some((keyword) => normalized.includes(keyword));

  const habitFocus =
    matchedEmotions.length === 0 || habitCueKeywords.some((keyword) => normalized.includes(keyword));

  const actionFocus = focusCueKeywords.some((keyword) => normalized.includes(keyword));

  const recentIntent = history
    .slice()
    .reverse()
    .find((message) => message.role === "user" && message.id !== history[history.length - 1]?.id)?.content;

  const responseParts: string[] = [];

  const openers = [
    "यशू, आधी एक खोल श्वास घे आणि मन स्थिर कर.",
    "यशू, तुझा आवाज मी स्पष्ट ऐकतो आहे; आपण मनाची दिशा ठरवूया.",
    "यशू, शांततेत उभे राहू आणि पुढील कृतीत विश्वास बळकट करूया.",
  ];

  responseParts.push(randomFrom(openers, openers[0]));

  if (matchedEmotions.length) {
    responseParts.push(randomFrom(matchedEmotions, matchedEmotions[0]));
  } else if (recentIntent) {
    responseParts.push(`तू आधी म्हणालास की "${recentIntent}" हे महत्त्वाचं आहे; त्याला शांत ताकदीने उत्तर दे.`);
  } else {
    responseParts.push("तुझ्या विचारांचा सूर ठाम आहे; आपण त्याला पद्धतशीर कृतीत उतरवू.");
  }

  if (wealthFocus) {
    responseParts.push(randomFrom(wealthLines, wealthLines[0]));
  }

  if (habitFocus) {
    responseParts.push(randomFrom(habitLines, habitLines[0]));
  }

  if (actionFocus) {
    responseParts.push(randomFrom(executionLines, executionLines[0]));
  } else {
    responseParts.push(randomFrom(executionLines.slice(0, 2), executionLines[0]));
  }

  responseParts.push(randomFrom(closings, closings[0]));

  return responseParts.join(" ");
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([openingMessage]);
  const [input, setInput] = useState("");
  const [autoVoice, setAutoVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  const conversationRef = useRef<HTMLDivElement>(null);
  const lastVoicedMessageId = useRef<string | null>(openingMessage.id);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSupported =
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const synth = window.speechSynthesis;
    const hasSpeech = typeof synth !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
    if (!hasSpeech) {
      return;
    }

    const resolveVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) {
        return;
      }
      const marathiVoice = voices.find((item) => item.lang?.toLowerCase().includes("mr"));
      const hindiVoice = voices.find((item) => item.lang?.toLowerCase().includes("hi"));
      const englishIndiaVoice = voices.find((item) => item.lang?.toLowerCase().includes("en-in"));
      setVoice(marathiVoice ?? hindiVoice ?? englishIndiaVoice ?? voices[0]);
    };

    resolveVoice();
    if (typeof synth.onvoiceschanged !== "undefined") {
      const handler = () => resolveVoice();
      synth.onvoiceschanged = handler;
      return () => {
        if (synth.onvoiceschanged === handler) {
          synth.onvoiceschanged = null;
        }
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!conversationRef.current) {
      return;
    }
    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported || typeof window === "undefined" || !text.trim()) {
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang ?? "mr-IN";
      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = 1;
      utterance.rate = 0.95;
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      const resetState = () => {
        setIsSpeaking(false);
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
        }
      };
      utterance.onend = resetState;
      utterance.onerror = resetState;
      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [speechSupported, voice],
  );

  useEffect(() => {
    if (!autoVoice || !speechSupported) {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") {
      return;
    }
    if (lastVoicedMessageId.current === lastMessage.id) {
      return;
    }
    lastVoicedMessageId.current = lastMessage.id;
    speak(lastMessage.content);
  }, [messages, autoVoice, speechSupported, speak]);

  const submitMessage = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) {
        return false;
      }

      setMessages((prev) => {
        const userMessage: Message = {
          id: createId("user"),
          role: "user",
          content: trimmed,
        };
        const withUser = [...prev, userMessage];
        const assistantReply = generateAssistantResponse(trimmed, withUser);
        const assistantMessage: Message = {
          id: createId("assistant"),
          role: "assistant",
          content: assistantReply,
        };
        return [...withUser, assistantMessage];
      });

      return true;
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitMessage(input)) {
        setInput("");
      }
    },
    [input, submitMessage],
  );

  const handleStopSpeaking = useCallback(() => {
    if (!speechSupported || typeof window === "undefined") {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [speechSupported]);

  const repeatLastAssistant = useCallback(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (lastAssistant) {
      speak(lastAssistant.content);
      lastVoicedMessageId.current = lastAssistant.id;
    }
  }, [messages, speak]);

  const assistantMood = useMemo(() => {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!latestUserMessage) {
      return "आजचा सूर शांत आणि लक्षपूर्वक ठेव.";
    }
    const content = latestUserMessage.content.toLowerCase();
    if (content.includes("stress") || content.includes("तणाव")) {
      return "तणावाच्या मागे नेहमी एक साधं उत्तर असतं; श्वास, योजना, कृती.";
    }
    if (content.includes("money") || content.includes("पैसा")) {
      return "पैशाला दिशा दे म्हणजे तो तुझ्यासाठी काम करेल.";
    }
    if (content.includes("habit") || content.includes("सवय")) {
      return "सवयींवर शांततेने काम कर; दिवसेंदिवस उंची वाढेल.";
    }
    return "मन शांत ठेव आणि पुढच्या कृतीवर प्रकाश टाक.";
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#050816] via-[#0a1226] to-[#030712] text-slate-100">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-8 lg:px-12">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Shree · Voice Mentor</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
            यशूची शांत, धैर्यवान मराठी आवाज साथी.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-200">
            उद्दिष्ट, संपत्ती आणि सवयींवर लक्ष ठेव. प्रत्येक उत्तरात शांत आत्मविश्वास, स्पष्ट दिशा आणि आजच अमलात आणता येईल अशी कृती.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {assistantMood}
          </div>
        </header>

        <section
          ref={conversationRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/40 sm:p-6"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                message.role === "assistant"
                  ? "ml-auto bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-400/40"
                  : "bg-white/10 text-slate-100 ring-1 ring-white/10"
              }`}
            >
              <p className="font-medium uppercase tracking-wide text-[0.68rem] text-slate-300 sm:text-xs">
                {message.role === "assistant" ? "श्री" : "यशू"}
              </p>
              <p className="mt-1 whitespace-pre-line">{message.content}</p>
            </article>
          ))}
        </section>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-400/20"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="message" className="text-sm font-medium text-slate-200">
              तुझी पुढची भावना किंवा प्रश्न
            </label>
            <textarea
              id="message"
              name="message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (submitMessage(input)) {
                    setInput("");
                  }
                }
              }}
              placeholder="तुझे विचार मला सांग."
              className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-slate-100 outline-none ring-emerald-400/0 transition focus:border-emerald-400/80 focus:ring-emerald-400/70"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.65)]" />
                श्री तयार आहे. शांत राहून प्रश्न विचार.
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setAutoVoice((previous) => !previous)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    autoVoice
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                      : "border-white/20 bg-white/10 text-slate-200 hover:border-white/40"
                  }`}
                >
                  {autoVoice ? "आवाज आपोआप वाजतो" : "आवाज हाताने वाजवा"}
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                >
                  पाठव
                </button>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-5 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-wide text-slate-200">
              Voice Control
            </span>
            {speechSupported ? (
              <span>{isSpeaking ? "श्री बोलतो आहे." : "आवाज तयार आहे; प्ले करण्यासाठी तयार."}</span>
            ) : (
              <span>ब्राऊजर आवाज सुविधा देत नाही; संदेश वाचून ऐक.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={repeatLastAssistant}
              disabled={!speechSupported}
              className="rounded-full border border-white/20 px-4 py-2 text-xs transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              पुन्हा ऐक
            </button>
            <button
              type="button"
              onClick={handleStopSpeaking}
              disabled={!speechSupported || !isSpeaking}
              className="rounded-full border border-rose-400/50 bg-rose-500/10 px-4 py-2 text-xs text-rose-200 transition hover:border-rose-300 hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              शांत कर
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

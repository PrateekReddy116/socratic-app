export function speak(text: string): void {
  if (!window.speechSynthesis) return;

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'),
  ) ?? voices.find((v) => v.lang.startsWith('en'));

  if (preferred) {
    utterance.voice = preferred;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

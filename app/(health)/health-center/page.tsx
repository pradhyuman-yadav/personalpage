"use client";
import UserOnboardingForm from '@/components/health/UserOnboardingForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
    const router = useRouter();


    const handleChatStarted = (chatId: string) => {
        setChatId(chatId);
         router.push(`/health-center/chat/${chatId}`); //Naviagate to chat.

    };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!chatId && <UserOnboardingForm onSuccess={handleChatStarted} />}
    </main>
  );
}
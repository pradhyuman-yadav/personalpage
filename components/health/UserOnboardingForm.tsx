// components/UserOnboardingForm.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"


interface UserOnboardingFormProps {
  onSuccess: (chatId: string) => void;
}


const UserOnboardingForm: React.FC<UserOnboardingFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const router = useRouter();


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age: parseInt(age, 10), other_info: otherInfo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start chat');
      }

      const { chatId } = await response.json();
      onSuccess(chatId);
        router.push(`/chat/${chatId}`); //Naviagate to chat.
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>
      <div>
        <Label htmlFor="age">Age</Label>
        <Input
          type="number"
          id="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          placeholder="Enter your age"
        />
      </div>
      <div>
        <Label htmlFor="otherInfo">Other Info (Optional)</Label>
        <Textarea
          id="otherInfo"
          value={otherInfo}
          onChange={(e) => setOtherInfo(e.target.value)}
          placeholder="Any other relevant information"
        />
      </div>
      <Button type="submit" disabled={loading} variant="default">
        {loading ? 'Starting Chat...' : 'Start Chat'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default UserOnboardingForm;
// app/textshare/[slug]/TextShareDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula, solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface TextShare {  // Updated interface name
  id: number;
  title: string | null;
  content: string;
  created_at: string;
  expires_at: string | null;
  short_id: string;
  syntax_highlighting: string;
}

interface TextShareDisplayProps { // Updated interface name
  textShare: TextShare;
}

export default function TextShareDisplay({ textShare }: TextShareDisplayProps) { // Updated function and prop names
  const [copySuccess, setCopySuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textShare.content)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (textShare.expires_at) {
      const calculateCountdown = () => {
        const now = new Date().getTime();
        const expiresAt = textShare.expires_at ? new Date(textShare.expires_at).getTime() : Infinity;
        const timeLeft = expiresAt - now;

        if (timeLeft <= 0) {
          setCountdown(0);
          clearInterval(intervalId);
        } else {
          setCountdown(Math.floor(timeLeft / 1000));
        }
      };

      calculateCountdown();
      intervalId = setInterval(calculateCountdown, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [textShare.expires_at]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{textShare.title || 'Untitled Share'}</CardTitle> {/* Updated title */}
          <CardDescription>
            Created at: {new Date(textShare.created_at).toLocaleString()}
            {textShare.expires_at && (
              <span>
                {countdown !== null && countdown > 0 ? (
                  ` | Expires in: ${countdown} seconds`
                ) : (
                  ` | Expired`
                )}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {copySuccess && (
            <Alert className="mb-4">
              <AlertTitle>Copied!</AlertTitle>
              <AlertDescription>The text has been copied to your clipboard.</AlertDescription> {/* Updated description */}
            </Alert>
          )}

          <div className="relative">
            <Button variant="outline" className="absolute top-2 right-2 z-10" onClick={copyToClipboard}>
              Copy
            </Button>

            <SyntaxHighlighter
              language={textShare.syntax_highlighting === 'none' ? 'text' : textShare.syntax_highlighting}
              style={textShare.syntax_highlighting === 'none' ? solarizedlight : dracula}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                padding: '1rem',
                backgroundColor: textShare.syntax_highlighting === 'none' ? '#f6f8fa' : '#282a36',
                borderRadius: '0.375rem',
              }}
              lineNumberStyle={{ color: '#6e7781' }}
            >
              {textShare.content}
            </SyntaxHighlighter>
          </div>

        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Share ID: {textShare.short_id} {/* Updated ID name */}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
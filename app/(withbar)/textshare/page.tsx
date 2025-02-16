// app/textshare/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Initialize Supabase client (consider moving this to a separate file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Use anon key for client-side

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const expirationOptions = [
  { value: '10m', label: '10 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
  { value: '1mo', label: '1 Month' },
  { value: 'never', label: 'Never' },
];
const syntaxHighlightingOptions = [
  { value: 'none', label: 'None' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'text', label: 'Plain Text' }
];

export default function TextSharePage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [expiration, setExpiration] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState("none");
  const router = useRouter();

  const generateSlug = (length: number = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!content) {
      setError('Content cannot be empty.');
      return;
    }

    setLoading(true);

    let generatedSlug = slug;
    if (!generatedSlug) {
      generatedSlug = generateSlug();
    }


    try {
      let expiresAt = null;

      if (expiration !== 'never') {
        const now = new Date();
        let timeToAdd;

        switch (expiration) {
          case '10m':
            timeToAdd = 10 * 60 * 1000;
            break;
          case '1h':
            timeToAdd = 60 * 60 * 1000;
            break;
          case '1d':
            timeToAdd = 24 * 60 * 60 * 1000;
            break;
          case '1w':
            timeToAdd = 7 * 24 * 60 * 60 * 1000;
            break;
          case '1mo':
            timeToAdd = 30 * 24 * 60 * 60 * 1000;
            break;
          default: //never
            expiresAt = null;
        }

        if (timeToAdd) {
          expiresAt = new Date(now.getTime() + timeToAdd).toISOString();
        }
      }


      const { error: insertError } = await supabase
        .from('pastes')
        .insert([
          {
            content,
            title: title || null,
            short_id: generatedSlug,
            expires_at: expiresAt,
            syntax_highlighting: syntaxHighlighting
          },
        ]).select();

      if (insertError) {
        if (insertError.message?.includes('duplicate key value violates unique constraint')) {
          setError('Slug already exists.  Try a different slug, or leave it blank to auto-generate.');

        } else {
          setError(`Error creating paste: ${insertError.message}`);
        }
        return;
      }
      setSuccess(true);
      router.push(`/textshare/${generatedSlug}`);


    } catch (err) {
      if(err instanceof Error){
          setError(`An unexpected error occurred: ${err.message}`);
      } else {
        setError(`An unexpected error occurred`);
      }

    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    if (/^[a-zA-Z0-9\-]*$/.test(newSlug) || newSlug === '') {
      setSlug(newSlug);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create New Text Share</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Text share created successfully!</AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter share title"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="syntax-highlighting">Syntax Highlighting:</Label>
        <Select value={syntaxHighlighting} onValueChange={(value) => setSyntaxHighlighting(value)}>
          <SelectTrigger id="syntax-highlighting" className="w-full md:w-[180px]">
            <SelectValue placeholder="Select syntax" />
          </SelectTrigger>
          <SelectContent>
            {syntaxHighlightingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="mb-4">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your text here"
          className="w-full min-h-[200px]"
          rows={10}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="slug">Custom Slug (Optional)</Label>
        <Input
          id="slug"
          value={slug}
          onChange={handleSlugChange}
          placeholder="Enter custom slug (or leave blank for random)"
          className="w-full"
        />
        <p className="text-sm text-gray-500">
          Only alphanumeric characters and hyphens are allowed.
        </p>
      </div>

      <div className="mb-4">
        <Label htmlFor="expiration">Expiration:</Label>
        <Select value={expiration} onValueChange={(value) => setExpiration(value)}>
          <SelectTrigger id="expiration" className="w-[180px]">
            <SelectValue placeholder="Select expiration" />
          </SelectTrigger>
          <SelectContent>
            {expirationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create Share'}
      </Button>


      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Shares</CardTitle>
          <CardDescription>
            View your recently created shares.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-500'>Coming Soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
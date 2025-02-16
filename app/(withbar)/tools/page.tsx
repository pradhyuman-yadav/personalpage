// app/tools/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Assuming you have components or utilities for each tool
// You can optionally import types from your individual tool pages if you have them defined
// Example: import { ToolProps as JsonFormatterProps } from './json-formatter/page';

interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  // You could add other properties if you need them (e.g., icon, category, etc.)
}

const tools: Tool[] = [
  {
    id: 'authenticator', 
    name: 'Authenticator',
    description: 'Generate and verify time based OTP codes.',
    href: '/authenticator',
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten long URLs for easier sharing.',
    href: '/t',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs.',
    href: '/qr',
  },
  {
    id: 'text-share',
    name: 'Text Share',
    description: 'Share text snippets with expiration options.',
    href: '/textshare',
  },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Tools</h1>
      <p className="text-gray-600 mb-8">A collection of useful tools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle>{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={tool.href}>
                <Button variant="outline">Go to Tool</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       {tools.length === 0 && (
          <div className='text-center text-gray-500'>No tools created yet.</div>
        )}
    </div>
  );
}
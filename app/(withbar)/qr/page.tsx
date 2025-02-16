// app/(withbar)/qr/page.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Import QRCodeSVG
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveSvgAsPng } from 'save-svg-as-png';


// Define the error correction levels directly, as qrcode.react doesn't export the type
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';


const qrCodeTypes = [
  { value: 'text', label: 'Plain Text' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'sms', label: 'SMS' },
  { value: 'wifi', label: 'Wi-Fi' }
];


const errorCorrectionLevels: { value: ErrorCorrectionLevel; label: string }[] = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' },
]


export default function TextToQRPage() {
  const [text, setText] = useState('');
  const [qrType, setQrType] = useState<'text' | 'url' | 'email' | 'tel' | 'sms' | 'wifi'>('text');
  const [qrCode, setQrCode] = useState('');
  // const [downloadLink, setDownloadLink] = useState(''); // No longer needed with SVG download
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('H');
  const [errorMessage, setErrorMessage] = useState('');


  const generateQRCode = () => {
    setErrorMessage('');
    let dataToEncode = text;

    try {
      if (qrType === 'url') {
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
          setErrorMessage('Invalid URL. URLs must start with http:// or https://');
          return;
        }
        new URL(text);
        dataToEncode = text;

      }
      else if (qrType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          setErrorMessage("Invalid email address format.");
          return;
        }
        dataToEncode = `mailto:${text}`;
      } else if (qrType === 'tel') {
        const phoneRegex = /^[0-9+\s\-.]+$/;
        if (!phoneRegex.test(text)) {
          setErrorMessage("Invalid phone number format.  Use only numbers, spaces, +, -, and .");
          return;
        }
        dataToEncode = `tel:${text}`;

      } else if (qrType === 'sms') {
        const phoneRegex = /^[0-9+\s\-.]+$/;
        if (!phoneRegex.test(text)) {
          setErrorMessage("Invalid phone number format.  Use only numbers, spaces, +, -, and .");
          return;
        }
        dataToEncode = `smsto:${text}`;

      } else if (qrType === "wifi") {
        if (!text.toLowerCase().startsWith("wifi:s:")) {
          setErrorMessage("Invalid WiFi QR code format.  It should start with 'WIFI:S:'");
          return;
        }
        dataToEncode = text;
      }

      setQrCode(dataToEncode);
    } catch (error) { // Removed : any
        if(error instanceof Error){ //Added a type checking
            setErrorMessage(error.message); // Set error from URL validation or other
        } else {
            setErrorMessage("An unexpected error occurred");
        }

    }
  };


  const handleDownloadSVG = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      saveSvgAsPng(svg, 'qrcode.png');
    }
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Text/URL to QR Code Generator</h1>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <Label htmlFor="qr-type" className="block mb-2">
          Type:
        </Label>
        <Select value={qrType} onValueChange={(value) => setQrType(value as 'text' | 'url' | 'email' | 'tel' | 'sms' | 'wifi')}>
          <SelectTrigger id="qr-type" className='w-full md:w-[180px]'>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {qrCodeTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label htmlFor="text-input" className="block mb-2">
          {qrType === 'url' ? 'URL:' : 'Text:'}
        </Label>
        {qrType === "text" ?
          <Textarea
            id="text-input"
            value={text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            placeholder={qrType === 'text' ? 'Enter URL (e.g., https://example.com)' : 'Enter text'}
            className="w-full"
            rows={3}
          /> :
          <Input
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={qrType === 'url' ? 'Enter URL (e.g., https://example.com)' : 'Enter text'}
            className="w-full"
          />
        }
      </div>

      <div className="mb-4">
        <Label htmlFor="error-correction" className="block mb-2">Error Correction Level:</Label>
        <Select value={errorCorrection} onValueChange={(value) => setErrorCorrection(value as ErrorCorrectionLevel)}>
          <SelectTrigger id="error-correction" className="w-[180px]">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {errorCorrectionLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={generateQRCode} className="mb-4">
        Generate QR Code
      </Button>

      {qrCode && (
        <>
          <div className="mb-4">
            <QRCodeSVG
              value={qrCode}
              size={256}
              level={errorCorrection}
              id="qr-code-svg" // ID for download
              className="mx-auto"
              imageSettings={{
                src: "/favicon.ico",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <Button onClick={handleDownloadSVG} variant="outline">Download QR Code (SVG)</Button>
        </>
      )}
    </div>
  );
}
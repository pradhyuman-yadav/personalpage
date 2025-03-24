// app/api/email/route.ts
import { NextResponse } from 'next/server';
import { generateEmailAddress } from '@/lib/email';

export async function POST(req: Request) {
    try {
        console.log(req);
        const email = generateEmailAddress();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expires in 1 hour

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_BASE_URL is not defined in .env.local");
        }
        const url = new URL('/api/supabaseProxy/emails', baseUrl).toString();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: email, expires_at: expiresAt.toISOString() }),
        });


        if (!response.ok) {
            let errorMessage = `Failed to create email (HTTP ${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            throw new Error(errorMessage);
        }
        const data = await response.json(); // Parse the response JSON

        // Return the ID *and* the email address and expiresAt
        return NextResponse.json({ email: data[0].address, expiresAt, id: data[0].id }, { status: 201 });


    } catch (error) {
        console.error("Error generating email:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
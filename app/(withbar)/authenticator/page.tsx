'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import * as OTPAuth from 'otpauth';
import CryptoJS from 'crypto-js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress";
import { toast } from '@/hooks/use-toast';

const TOTP_STORAGE_KEY = 'totp_secrets';
const PASSPHRASE = process.env.NEXT_PUBLIC_PASSPHRASE; // Get from .env.local


interface TOTPSecrets {
    [key: string]: string; // name: encryptedSecret
}

export default function TOTPGenerator() {
    const [secrets, setSecrets] = useState<TOTPSecrets>({});
    const [selectedSecretName, setSelectedSecretName] = useState('');
    const [newSecretName, setNewSecretName] = useState('');
    const [newSecret, setNewSecret] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [progress, setProgress] = useState(0);

    // Load secrets from localStorage
    useEffect(() => {
        const storedSecrets = localStorage.getItem(TOTP_STORAGE_KEY);
        if (storedSecrets) {
            try {
                const parsedSecrets: TOTPSecrets = JSON.parse(storedSecrets);
                setSecrets(parsedSecrets);
            } catch (e) {
                setError('Error loading secrets from localStorage.');
                toast({
                    title: "Error loading secrets from localStorage.",
                    description: `Please clear all secrets and try again. ${(e as Error).message}`,
                    variant: "destructive",
                  });
            }
        }
    }, []);

    // Generate TOTP based on selectedSecretName and the .env passphrase
    useEffect(() => {
        if (!selectedSecretName || !secrets[selectedSecretName] || !PASSPHRASE) {
            setTotp('');
            setProgress(0);
            return;
        }

        if (isAddingNew) {
            setTotp('');
            setProgress(0);
            return;
        }

        try {
            const encryptedSecret = secrets[selectedSecretName];
            // Use the .env passphrase for decryption
            const decryptedSecretBytes = CryptoJS.AES.decrypt(encryptedSecret, PASSPHRASE);
            const decryptedSecret = decryptedSecretBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedSecret) {
                setError('Error decrypting secret.'); //  More generic error message
                setTotp('');
                setProgress(0);
                return;
            }

            const totpGenerator = new OTPAuth.TOTP({
                issuer: "MyTOTPApp",
                label: selectedSecretName,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(decryptedSecret),
            });

            const updateTOTP = () => {
                const newTotp = totpGenerator.generate();
                setTotp(newTotp);
                setError("");

                const now = Date.now() / 1000;
                const remainingTime = totpGenerator.period - (now % totpGenerator.period);
                setProgress((remainingTime / totpGenerator.period) * 100);
            };

            updateTOTP();
            const intervalId = setInterval(updateTOTP, 1000);
            return () => clearInterval(intervalId);

        } catch (e) {
            setError('Error decrypting or generating TOTP.');
            setTotp('');
            toast({
                title: "Error decrypting or generating TOTP",
                description: `${(e as Error).message}`,
                variant: "destructive"
              });
            setProgress(0);
        }
    }, [selectedSecretName, secrets, isAddingNew]);

    const handleSecretNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewSecretName(e.target.value);
    };

    const handleSecretChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewSecret(e.target.value);
    };


    const handleSaveSecret = () => {
        if (!newSecretName.trim() || !newSecret.trim() || !PASSPHRASE) {
            setError("Name and secret cannot be empty.  Passphrase is required.");
            return;
        }

        try {
            OTPAuth.Secret.fromBase32(newSecret); // Validate Base32
        } catch (error) {
            setError("Invalid secret key format.  Must be Base32 encoded.");
            toast({
                title: "Invalid secret key format.  Must be Base32 encoded.",
                description: `${(error as Error).message}`,
                variant: "destructive"
              });
            return;
        }

        // Encrypt the secret using the .env passphrase
        const encryptedSecret = CryptoJS.AES.encrypt(newSecret, PASSPHRASE).toString();

        const updatedSecrets = { ...secrets, [newSecretName]: encryptedSecret };
        localStorage.setItem(TOTP_STORAGE_KEY, JSON.stringify(updatedSecrets));
        setSecrets(updatedSecrets);
        setSelectedSecretName(newSecretName);
        setNewSecretName('');
        setNewSecret('');
        setError('');
        setIsAddingNew(false);
    };

    const handleClearAllSecrets = () => {
        localStorage.removeItem(TOTP_STORAGE_KEY);
        setSecrets({});
        setSelectedSecretName('');
        setTotp('');
        setError('');
        setNewSecretName('');
        setNewSecret('');
        setIsAddingNew(false);
    };

    const handleSecretSelectionChange = (value: string) => {
        if (value === "add-new") {
            setIsAddingNew(true);
            setSelectedSecretName('');
        } else {
            setIsAddingNew(false);
            setSelectedSecretName(value);
        }
    };

    return (
        <>
            <Alert className="mb-4">
                <AlertTitle>Secure and Private TOTP Generation</AlertTitle>
                <AlertDescription>
                    This TOTP generator stores your secrets <strong>exclusively in your browser&apos;s local storage</strong>, encrypted with a pre-defined passphrase. Your secrets are <strong>never</strong> sent to any server. This ensures maximum security and privacy. Because the secrets are stored locally, clearing your browser data will erase them. Consider backing up your secrets securely.
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>2 Factor Authenticator Code Generator</CardTitle>
                    <CardDescription>Generate Time-Based One-Time Passwords</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="secret-select">Select or Add Secret:</Label>
                        <Select onValueChange={handleSecretSelectionChange} value={isAddingNew ? "add-new" : selectedSecretName}>
                            <SelectTrigger id="secret-select">
                                <SelectValue placeholder="Select a secret" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(secrets).map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))}
                                <SelectItem key="add-new" value="add-new">
                                    + Add New Secret
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isAddingNew && (
                        <div className="space-y-2">
                            <Label htmlFor="secret-name">Secret Name:</Label>
                            <Input
                                id="secret-name"
                                type="text"
                                value={newSecretName}
                                onChange={handleSecretNameChange}
                                placeholder="Enter a name for this secret"
                            />

                            <Label htmlFor="new-secret">New Secret (Base32):</Label>
                            <Input
                                id="new-secret"
                                type="text"
                                value={newSecret}
                                onChange={handleSecretChange}
                                placeholder="Enter your secret key"
                            />
                            <Button onClick={handleSaveSecret}>Save Secret</Button>
                        </div>
                    )}

                    {!isAddingNew && selectedSecretName && (
                        <div>
                            <Label>TOTP:</Label>
                            <div className="text-3xl font-bold">{totp}</div>
                            <Progress value={progress} className="w-full h-2" />
                        </div>
                    )}

                    <div>
                        <Button variant="destructive" onClick={handleClearAllSecrets}>Clear All Secrets</Button>
                    </div>

                    {error && <div className="text-red-500">{error}</div>}
                </CardContent>
                <Separator />
                <CardFooter>
                    <p className="text-sm text-gray-500">
                        <strong>How it works:</strong> This application generates time-based one-time passwords (TOTPs) using a secret key that you provide. The key, along with a name you choose, is <em>encrypted</em> using a pre-defined passphrase and then stored directly in your web browser&apos;s local storage. Local storage is a part of your browser that allows websites to store data directly on your computer. Because of the encryption, even if someone gained access to your browser&apos;s local storage, they would not be able to read your secret keys without the passphrase. The secret key never leaves your computer and is never sent over the internet.
                        <br /><br />
                        <strong>Accessing Your Secrets:</strong> Your saved secrets are tied to the specific browser and computer you used when you added them, *and* they are protected by a pre-defined passphrase. To access the same secrets again, you must use the same browser on the same computer. If you switch browsers or computers, the secrets will not be available. Clearing your browser&apos;s data (cache, cookies, local storage) will also delete your saved secrets.
                    </p>
                </CardFooter>
            </Card>
        </>
    );
}
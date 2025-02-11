"use client";

import { useState, useEffect, ChangeEvent } from "react";
import * as OTPAuth from "otpauth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const TOTP_STORAGE_KEY = "totp_secrets"; // Plural

interface TOTPSecrets {
  [key: string]: string; // name: secret
}

export default function TOTPGenerator() {
  const [secrets, setSecrets] = useState<TOTPSecrets>({});
  const [selectedSecretName, setSelectedSecretName] = useState("");
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false); // Track "Add New" state
  const [progress, setProgress] = useState(0);

  // Load secrets from localStorage
  useEffect(() => {
    const storedSecrets = localStorage.getItem(TOTP_STORAGE_KEY);
    if (storedSecrets) {
      try {
        const parsedSecrets: TOTPSecrets = JSON.parse(storedSecrets);
        setSecrets(parsedSecrets);
        // If there are secrets, select the first one by default.
        if (Object.keys(parsedSecrets).length > 0) {
          setSelectedSecretName(Object.keys(parsedSecrets)[0]);
        }
      } catch (e) {
        setError("Error loading secrets from localStorage.");
        toast({
          title: "Error loading secrets from localStorage",
          description: `${e}`,
          variant: "destructive",
        });
      }
    }
  }, []);

  // Generate TOTP based on selectedSecretName
  useEffect(() => {
    if (!selectedSecretName || !secrets[selectedSecretName]) {
      setTotp("");
      setProgress(0); // Reset progress when no secret is selected
      return;
    }
    // Don't generate TOTP if we are adding a new secret
    if (isAddingNew) {
      setTotp("");
      setProgress(0);
      return;
    }

    const secret = secrets[selectedSecretName];
    let totpGenerator: OTPAuth.TOTP;

    try {
      totpGenerator = new OTPAuth.TOTP({
        issuer: "MyTOTPApp",
        label: selectedSecretName, // Use the name as the label
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
    } catch (e) {
      setError("Invalid secret key format.  Must be Base32 encoded.");
      setTotp("");
      toast({
        title: "Invalid secret key format.  Must be Base32 encoded",
        description: `${e}`,
        variant: "destructive",
      });
      return;
    }

    const updateTOTP = () => {
      try {
        const newTotp = totpGenerator.generate();
        setTotp(newTotp);
        setError("");

        // Calculate remaining time in the current period
        const now = Date.now() / 1000; // Current time in seconds
        const remainingTime =
          totpGenerator.period - (now % totpGenerator.period);
        setProgress((remainingTime / totpGenerator.period) * 100);
      } catch (e) {
        setError("Error generating TOTP.");
        toast({
          title: "Error generating TOTP",
          description: `${e}`,
          variant: "destructive",
        });
      }
    };

    updateTOTP();
    const intervalId = setInterval(updateTOTP, 1000);
    return () => clearInterval(intervalId);
  }, [selectedSecretName, secrets, isAddingNew]);

  const handleSecretNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSecretName(e.target.value);
  };

  const handleSecretChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSecret(e.target.value);
  };

  const handleSaveSecret = () => {
    if (!newSecretName.trim() || !newSecret.trim()) {
      setError("Name and secret cannot be empty.");
      toast({
        title: "Name and secret cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      OTPAuth.Secret.fromBase32(newSecret); // Validate Base32
    } catch (error) {
      setError("Invalid secret key format.  Must be Base32 encoded.");
      toast({
        title: "Invalid secret key format.  Must be Base32 encoded",
        description: `${error}`,
        variant: "destructive",
      });
      return;
    }

    const updatedSecrets = { ...secrets, [newSecretName]: newSecret };
    localStorage.setItem(TOTP_STORAGE_KEY, JSON.stringify(updatedSecrets));
    setSecrets(updatedSecrets);
    setSelectedSecretName(newSecretName); // Auto-select the newly added secret
    setNewSecretName("");
    setNewSecret("");
    setError("");
    setIsAddingNew(false); // Reset to selection mode
  };

  const handleClearAllSecrets = () => {
    localStorage.removeItem(TOTP_STORAGE_KEY);
    setSecrets({});
    setSelectedSecretName("");
    setTotp("");
    setError("");
    // Clear the new Secret input fields on clearing all.
    setNewSecretName("");
    setNewSecret("");
    setIsAddingNew(false);
  };
  const handleSecretSelectionChange = (value: string) => {
    if (value === "add-new") {
      setIsAddingNew(true);
      setSelectedSecretName(""); // Clear selection
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
          This TOTP generator stores your secrets{" "}
          <strong>exclusively in your browser&aposs local storage</strong>. Your
          secrets are <strong>never</strong> sent to any server. This ensures
          maximum security and privacy. Because the secrets are stored locally,
          clearing your browser data will erase them. Consider backing up your
          secrets securely.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>2 Factor Authenticator Code Generator</CardTitle>
          <CardDescription>
            Generate Time-Based One-Time Passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="secret-select">Select or Add Secret:</Label>
            <Select
              onValueChange={handleSecretSelectionChange}
              value={isAddingNew ? "add-new" : selectedSecretName}
            >
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
            <Button variant="destructive" onClick={handleClearAllSecrets}>
              Clear All Secrets
            </Button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
        </CardContent>
        <Separator />
        <CardFooter>
          <p className="text-sm text-gray-500">
            <strong>How it works:</strong> This application generates time-based
            one-time passwords (TOTPs) using a secret key that you provide. The
            key, along with a name you choose, is stored directly in your web
            browser&aposs local storage. Local storage is a part of your browser
            that allows websites to store data directly on your computer. This
            means the secret key never leaves your computer and is never sent
            over the internet. It is used only within your browser to calculate
            the TOTP codes.
            <br />
            <br />
            <strong>Accessing Your Secrets:</strong> Your saved secrets are tied
            to the specific browser and computer you used when you added them.
            To access the same secrets again, you must use the same browser on
            the same computer. If you switch browsers or computers, the secrets
            will not be available. Clearing your browser&aposs data (cache, cookies,
            local storage) will also delete your saved secrets.
          </p>
        </CardFooter>
      </Card>
    </>
  );
}

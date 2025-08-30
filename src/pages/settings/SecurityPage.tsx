import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import {
  useGenerate2faMutation,
  useTurnOn2faMutation,
  useDisable2faMutation,
} from "../../services/settingsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/use-toast";
import { PinInput } from "../../components/ui/PinInput";

export const SecurityPage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  const [isSetupDialogOpen, setSetupDialogOpen] = useState(false);
  const [isRecoveryCodesDialogOpen, setRecoveryCodesDialogOpen] =
    useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [confirmSavedCodes, setConfirmSavedCodes] = useState(false);
  const [isDisableDialogOpen, setDisableDialogOpen] = useState(false);
  const [code, setCode] = useState("");

  const generate2FAMutation = useGenerate2faMutation();
  const turnOn2FAMutation = useTurnOn2faMutation();
  const disable2FAMutation = useDisable2faMutation();

  const handleGenerate2FA = () => {
    generate2FAMutation.mutate(undefined, {
      onSuccess: (data) => {
        setQrCode(data.qrCodeDataURL);
        setSetupDialogOpen(true);
      },
      onError: (error) => {
        console.error("Failed to generate 2FA secret:", error);
        toast({
          title: "Error",
          description: "Could not generate QR code. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode) {
      turnOn2FAMutation.mutate(twoFactorCode, {
        onSuccess: (data) => {
          setRecoveryCodes(data.recoveryCodes);
          setSetupDialogOpen(false);
          setRecoveryCodesDialogOpen(true);
          if (user) {
            setUser({ ...user, isTwoFactorAuthenticationEnabled: true });
          }
          toast({
            title: "Success",
            description: "Two-factor authentication has been enabled.",
          });
        },
        onError: (error) => {
          console.error("Failed to turn on 2FA:", error);
          toast({
            title: "Error",
            description: "The code is incorrect. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      disable2FAMutation.mutate(code, {
        onSuccess: () => {
          if (user) {
            setUser({ ...user, isTwoFactorAuthenticationEnabled: false });
          }
          setDisableDialogOpen(false);
          setCode("");
          toast({
            title: "Success",
            description: "Two-factor authentication has been disabled.",
          });
        },
        onError: (error) => {
          console.error("Failed to disable 2FA:", error);
          toast({
            title: "Error",
            description: "Incorrect code or an error occurred.",
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>
      <div className="p-4 border rounded-lg max-w-md">
        {user?.isTwoFactorAuthenticationEnabled ? (
          <div className="flex items-center justify-between">
            <p>2FA is enabled</p>
            <Button
              variant="destructive"
              onClick={() => setDisableDialogOpen(true)}
            >
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>2FA is disabled</p>
            <Button
              onClick={handleGenerate2FA}
              disabled={generate2FAMutation.isPending}
            >
              {generate2FAMutation.isPending ? "Generating..." : "Enable 2FA"}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isSetupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the code
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-4">
            {qrCode ? (
              <img src={qrCode} alt="2FA QR Code" />
            ) : (
              <p>Loading QR code...</p>
            )}
          </div>
          <form onSubmit={handleVerify2FA}>
            <PinInput
              length={6}
              onComplete={(value) => {
                setTwoFactorCode(value);
              }}
            />
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={turnOn2FAMutation.isPending}>
                {turnOn2FAMutation.isPending
                  ? "Verifying..."
                  : "Verify & Enable"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRecoveryCodesDialogOpen}
        onOpenChange={setRecoveryCodesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Recovery Codes</DialogTitle>
            <DialogDescription>
              Store these codes in a safe place. They can be used to regain
              access to your account if you lose your device.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-muted rounded-md">
            <ul className="grid grid-cols-2 gap-2 font-mono">
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm-saved"
              checked={confirmSavedCodes}
              onChange={(e) => setConfirmSavedCodes(e.target.checked)}
            />
            <label htmlFor="confirm-saved" className="text-sm">
              I have saved these recovery codes.
            </label>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setRecoveryCodesDialogOpen(false)}
              disabled={!confirmSavedCodes}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDisableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              To continue, please enter the 6-digit code from your authenticator
              app.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDisable2FA}>
            <PinInput
              length={6}
              onComplete={(value) => {
                setCode(value);
              }}
            />
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                variant="destructive"
                disabled={disable2FAMutation.isPending}
              >
                {disable2FAMutation.isPending ? "Disabling..." : "Disable"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

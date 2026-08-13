import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDownToLine, Check, Home, PlusSquare, Share, Smartphone } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type InstallGateProps = {
  children: ReactNode;
};

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
  );
}

function isAppleMobileDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function InstallGate({ children }: InstallGateProps) {
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => setIsStandalone(isRunningStandalone());
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    mediaQuery.addEventListener('change', updateDisplayMode);
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      mediaQuery.removeEventListener('change', updateDisplayMode);
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  if (isStandalone) return <>{children}</>;

  return (
    <InstallScreen
      canUseNativePrompt={Boolean(installPrompt)}
      onInstall={handleInstall}
    />
  );
}

function InstallScreen({
  canUseNativePrompt,
  onInstall,
}: {
  canUseNativePrompt: boolean;
  onInstall: () => void;
}) {
  const isAppleDevice = useMemo(isAppleMobileDevice, []);

  return (
    <main className="install-gate" data-testid="screen-install-gate">
      <div className="install-gate-orb install-gate-orb-one" />
      <div className="install-gate-orb install-gate-orb-two" />

      <section className="install-gate-card">
        <div className="install-gate-icon" aria-hidden="true">
          <span>7</span>
        </div>

        <p className="install-gate-eyebrow">CATAN DICE TRACKER</p>
        <h1>Add it to your Home Screen</h1>
        <p className="install-gate-copy">
          Install the tracker for the full-screen game experience, offline access, and the
          landscape StandBy board view.
        </p>

        {canUseNativePrompt ? (
          <button
            type="button"
            className="install-gate-primary"
            data-testid="button-install-app"
            onClick={onInstall}
          >
            <ArrowDownToLine className="h-5 w-5" />
            Add to Home Screen
          </button>
        ) : (
          <div className="install-gate-steps">
            {isAppleDevice ? (
              <>
                <InstallStep
                  icon={<Share className="h-5 w-5" />}
                  title="Tap Share"
                  text="Open the Share menu in Safari."
                />
                <InstallStep
                  icon={<PlusSquare className="h-5 w-5" />}
                  title="Add to Home Screen"
                  text="Scroll down and tap Add to Home Screen."
                />
                <InstallStep
                  icon={<Home className="h-5 w-5" />}
                  title="Open Catan Dice"
                  text="Launch it from your Home Screen like a native app."
                />
              </>
            ) : (
              <>
                <InstallStep
                  icon={<Smartphone className="h-5 w-5" />}
                  title="Open your browser menu"
                  text="Tap the menu button in your browser."
                />
                <InstallStep
                  icon={<ArrowDownToLine className="h-5 w-5" />}
                  title="Install the app"
                  text="Choose Install app or Add to Home Screen."
                />
              </>
            )}
          </div>
        )}

        <div className="install-gate-note">
          <Check className="h-4 w-4" />
          After installing, this screen disappears automatically.
        </div>
      </section>
    </main>
  );
}

function InstallStep({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="install-gate-step" data-testid={`install-step-${title.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="install-gate-step-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}
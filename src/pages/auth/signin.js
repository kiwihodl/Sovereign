import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import GenericButton from '@/components/buttons/GenericButton';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [nsec, setNsec] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const { ndk, addSigner } = useNDKContext();
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleEmailSignIn = async e => {
    e.preventDefault();
    await signIn('email', { email, callbackUrl: '/profile' });
  };

  const handleNostrSignIn = async e => {
    e.preventDefault();
    if (!ndk.signer) {
      await addSigner();
    }
    try {
      const user = await ndk.signer.user();
      const pubkey = user?._pubkey;
      signIn('nostr', { pubkey, callbackUrl: '/profile' });
    } catch (error) {
      console.error('Error signing Nostr event:', error);
    }
  };

  const handleAnonymousSignIn = async e => {
    e.preventDefault();

    // Check if we have keys in local storage
    const storedPubkey = localStorage.getItem('anonymousPubkey');
    const storedPrivkey = localStorage.getItem('anonymousPrivkey');

    try {
      const result = await signIn('anonymous', {
        pubkey: storedPubkey,
        privkey: storedPrivkey,
        redirect: false,
        callbackUrl: '/profile',
      });

      if (result?.ok) {
        // Wait a moment for the session to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch the session
        const session = await getSession();

        if (session?.user?.pubkey && session?.user?.privkey) {
          localStorage.setItem('anonymousPubkey', session.user.pubkey);
          localStorage.setItem('anonymousPrivkey', session.user.privkey);
          router.push('/profile');
        } else {
          console.error('Session data incomplete:', session);
        }
      } else {
        console.error('Anonymous login failed:', result?.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleRecoverySignIn = async e => {
    e.preventDefault();
    try {
      const result = await signIn('recovery', {
        nsec,
        redirect: false,
        callbackUrl: '/profile',
      });

      if (result?.ok) {
        router.push('/profile');
      } else {
        console.error('Recovery login failed:', result?.error);
      }
    } catch (error) {
      console.error('Recovery sign in error:', error);
    }
  };

  useEffect(() => {
    // Redirect if already signed in
    if (session?.user) {
      router.push('/profile');
    }
  }, [session, router]);

  return (
    <div className="w-[100vw] min-bottom-bar:w-[86vw] mx-auto mt-24 flex flex-col justify-center">
      <h1 className="text-center mb-8">Sign In</h1>
      <GenericButton
        label={'login with nostr'}
        icon={<Image src="/images/nostr.png" width={20} height={20} alt="Nostr" className="mr-2" />}
        className="bg-black text-purple-400/70 border-purple-400/70 border-2 uppercase text-xl font-bold tracking-wider font-satoshi w-[400px] my-4 mx-auto hover:text-purple-400 hover:border-purple-400 transition-all duration-300"
        rounded
        onClick={handleNostrSignIn}
      />
      {/* <GenericButton
        label={'login with email'}
        icon="pi pi-envelope"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={() => setShowEmailInput(!showEmailInput)}
      />
      <GenericButton
        label={'login with github'}
        icon="pi pi-github"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={() => signIn('github')}
      />
      {showEmailInput && (
        <form
          onSubmit={handleEmailSignIn}
          className="flex flex-col items-center bg-gray-700 w-fit mx-auto p-4 rounded-lg"
        >
          <InputText
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-[250px] my-4"
          />
          <GenericButton
            type="submit"
            label={'Submit'}
            icon="pi pi-check"
            className="text-[#f8f8ff] w-fit my-4"
            rounded
          />
        </form>
      )}
      <GenericButton
        label={'login anonymously'}
        icon="pi pi-eye-slash"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={handleAnonymousSignIn}
      />
      <GenericButton
        label={'recover account'}
        icon="pi pi-key"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={() => setShowRecoveryInput(!showRecoveryInput)}
      />
      {showRecoveryInput && (
        <form
          onSubmit={handleRecoverySignIn}
          className="flex flex-col items-center bg-gray-700 w-fit mx-auto p-4 rounded-lg"
        >
          <div className="text-center mb-4 max-w-[350px]">
            <p className="text-yellow-400 mb-2">⚠️ Recovery Notice</p>
            <p className="text-gray-200 mb-2">
              🔑 This recovery option is only for accounts created through:
            </p>
            <ul className="text-gray-300 mb-2 text-left list-none">
              <li>📧 Email Login</li>
              <li>👤 Anonymous Login</li>
              <li>🐙 GitHub Login</li>
            </ul>
            <p className="text-red-400 text-sm">
              ⛔ Do NOT enter your personal Nostr nsec here! Only use the recovery key provided by
              PlebDevs (available on your profile page).
            </p>
          </div>
          <InputText
            type="password"
            value={nsec}
            onChange={e => setNsec(e.target.value)}
            placeholder="Enter recovery key (nsec or hex)"
            className="w-[250px] my-4"
          />
          <GenericButton
            type="submit"
            label={'Recover Account'}
            icon="pi pi-lock-open"
            className="text-[#f8f8ff] w-fit my-4"
            rounded
          />
        </form>
      )} */}
    </div>
  );
}

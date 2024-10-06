import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useNDKContext } from "@/context/NDKContext";
import GenericButton from "@/components/buttons/GenericButton";
import { InputText } from 'primereact/inputtext';

// todo add recaptcha for additional security
export default function SignIn() {
  const [email, setEmail] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)
  const {ndk, addSigner} = useNDKContext();
  const { data: session, status } = useSession(); // Get the current session's data and status

  useEffect(() => {
    console.log("session", session)
  }, [session])

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    await signIn("email", { email, callbackUrl: '/' })
  }

  const handleNostrSignIn = async (e) => {
    e.preventDefault()
    if (!ndk.signer) {
      await addSigner();
    }
    try {
      const user = await ndk.signer.user()
      const pubkey = user?._pubkey
      signIn("nostr", { pubkey })
    } catch (error) {
      console.error("Error signing Nostr event:", error)
    }
  }

  const handleAnonymousSignIn = (e) => {
    e.preventDefault()
    signIn("anonymous")
  }

  return (
    <div className="w-[100vw] min-bottom-bar:w-[86vw] mx-auto mt-24 flex flex-col justify-center">
      <h1 className="text-center mb-8">Sign In</h1>
      <GenericButton
        label={"login with nostr"}
        icon="pi pi-user"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={handleNostrSignIn}
      />
      <GenericButton
        label={"login anonymously"}
        icon="pi pi-user"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={handleAnonymousSignIn}
      />
      <GenericButton
        label={"login with email"}
        icon="pi pi-envelope"
        className="text-[#f8f8ff] w-[250px] my-4 mx-auto"
        rounded
        onClick={() => setShowEmailInput(!showEmailInput)}
      />
      {showEmailInput && (
        <form onSubmit={handleEmailSignIn} className="flex flex-col items-center bg-gray-700 w-fit mx-auto p-4 rounded-lg">
          <InputText
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-[250px] my-4"
          />
          <GenericButton
            type="submit"
            label={"Submit"}
            icon="pi pi-check"
            className="text-[#f8f8ff] w-fit my-4"
            rounded
          />
        </form>
      )}
    </div>
  )
}
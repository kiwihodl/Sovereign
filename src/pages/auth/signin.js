import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useNDKContext } from "@/context/NDKContext";
import { Button } from 'primereact/button';
import NDK, { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

export default function SignIn() {
    const [email, setEmail] = useState("")
    const [nostrPubkey, setNostrPubkey] = useState("")
    const [nostrPrivkey, setNostrPrivkey] = useState("")

    const { data: session, status } = useSession(); // Get the current session's data and status

    useEffect(() => {
        console.log("session", session)
    }, [session])

    const handleEmailSignIn = (e) => {
        e.preventDefault()
        signIn("email", { email })
    }

    const handleNostrSignIn = async (e) => {
        e.preventDefault()
        
        const nip07signer = new NDKNip07Signer();
        const ndk = new NDK({ signer: nip07signer });

        await ndk.connect()

        try {
            const user = await nip07signer.user()

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
        <div className="w-fit mx-auto mt-24 flex flex-col justify-center">
            <h1 className="text-center mb-8">Sign In</h1>
            <Button
                label={"login with nostr"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={handleNostrSignIn}
            />
            <Button
                label={"login anonymously"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={handleAnonymousSignIn}
            />
            <Button
                label={"login with email"}
                icon="pi pi-envelope"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={handleEmailSignIn}
            />
        </div>
    )
}
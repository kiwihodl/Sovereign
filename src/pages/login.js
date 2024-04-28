import React from "react";
import { Button } from 'primereact/button';
import { useLogin } from "@/hooks/useLogin";


const Login = () => {
    const { nostrLogin, anonymousLogin } = useLogin();
    return (
        <div className="w-fit mx-auto mt-24 flex flex-col justify-center">
            <h1 className="text-center mb-8">Login</h1>
            <Button
                label={"login with nostr"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={nostrLogin}
            />
            <Button
                label={"login anonymously"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={anonymousLogin}
            />
            <Button
                label={"login with email"}
                icon="pi pi-envelope"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={anonymousLogin}
            />
        </div>
    )
}

export default Login;
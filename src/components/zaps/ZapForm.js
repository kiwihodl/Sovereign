import React, { useState } from "react";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useNostr } from "@/hooks/useNostr";

const ZapForm = ({event}) => {
    const [zapAmount, setZapAmount] = useState(0);
    const [comment, setComment] = useState("");

    const { zapEvent } = useNostr();

    const handleZapButton = (amount) => {
        setZapAmount(amount);
    };

    const handleCustomAmountChange = (event) => {
        setZapAmount(event.target.value);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleSubmit = async () => {
        const millisatAmount = zapAmount * 1000;
        const response = await zapEvent(event, millisatAmount, comment);

        console.log('zap response:', response);
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-start">
                {[1, 10, 21, 100, 500, 1000].map(amount => (
                    <Button key={amount} label={amount.toString()} icon="pi pi-bolt" severity="success"
                            rounded className="mr-2" onClick={() => handleZapButton(amount)} />
                ))}
            </div>
            <div className="flex flex-row w-[100%] justify-between my-4">
                <InputText placeholder="Custom Amount" value={zapAmount} onChange={handleCustomAmountChange} />
            </div>
            <InputTextarea rows={5} placeholder="Message" value={comment} onChange={handleCommentChange} />
            <Button label="Zap" icon="pi pi-bolt" severity="success" className="mt-4" onClick={handleSubmit} />
        </div>
    );
};

export default ZapForm;

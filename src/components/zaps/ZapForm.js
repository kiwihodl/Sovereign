import React from "react";
import { nip19 } from "nostr-tools";

const ZapForm = ({ event }) => {
    const nAddress = nip19.naddrEncode({
        kind: event?.kind,
        pubkey: event?.pubkey,
        identifier: event.d,
    })

    return (
        <iframe
            src={`https://zapper.nostrapps.org/zap?id=${nAddress}`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="zapper app"
        ></iframe>
    );
};

export default ZapForm;


// import React, { useState } from "react";
// import { Button } from 'primereact/button';
// import { InputText } from 'primereact/inputtext';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { useNostr } from "@/hooks/useNostr";

// const ZapForm = ({event}) => {
//     const [zapAmount, setZapAmount] = useState(0);
//     const [comment, setComment] = useState("");

//     const { zapEvent } = useNostr();

//     const handleZapButton = (amount) => {
//         setZapAmount(amount);
//     };

//     const handleCustomAmountChange = (event) => {
//         setZapAmount(event.target.value);
//     };

//     const handleCommentChange = (event) => {
//         setComment(event.target.value);
//     };

//     const handleSubmit = async () => {
//         const millisatAmount = zapAmount * 1000;
//         const response = await zapEvent(event, millisatAmount, comment);

//         console.log('zap response:', response);
//     };

//     return (
//         <div className="flex flex-col">
//             <div className="flex flex-row justify-start">
//                 {[1, 10, 21, 100, 500, 1000].map(amount => (
//                     <Button key={amount} label={amount.toString()} icon="pi pi-bolt" severity="success"
//                             rounded className="mr-2" onClick={() => handleZapButton(amount)} />
//                 ))}
//             </div>
//             <div className="flex flex-row w-[100%] justify-between my-4">
//                 <InputText placeholder="Custom Amount" value={zapAmount} onChange={handleCustomAmountChange} />
//             </div>
//             <InputTextarea rows={5} placeholder="Message" value={comment} onChange={handleCommentChange} />
//             <Button label="Zap" icon="pi pi-bolt" severity="success" className="mt-4" onClick={handleSubmit} />
//         </div>
//     );
// };

// export default ZapForm;
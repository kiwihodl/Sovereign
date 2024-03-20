import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import 'primeicons/primeicons.css';

const ResourceForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the default form submission mechanism
        const payload = {
            title,
            summary,
            isPaidResource: checked,
            price: checked ? price : null,
            content: text
        };
        console.log(payload);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>

            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Resource</p>
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                <div className="p-inputgroup flex-1 py-4">
                    {checked && (
                        <>
                            <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
                            <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                        </>
                    )}
                </div>
            </div>
            <div className="p-inputgroup flex-1 flex-col mt-8">
                <span>Content</span>
                <Editor value={text} onTextChange={(e) => setText(e.htmlValue)} style={{ height: '320px' }} />
            </div>
            <div className="flex justify-center mt-8">
                <Button type="submit" severity="success" outlined label="Submit" />
            </div>
        </form>
    );
}

export default ResourceForm;

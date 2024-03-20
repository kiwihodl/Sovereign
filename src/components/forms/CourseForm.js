import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import 'primeicons/primeicons.css';

const CourseForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [text, setText] = useState('');
    const [resources, setResources] = useState(['']); // Start with one empty resource

    const addResource = () => {
        setResources([...resources, '']); // Add another empty resource
    };

    const handleResourceChange = (value, index) => {
        const updatedResources = resources.map((resource, i) => 
            i === index ? value : resource
        );
        setResources(updatedResources);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            title,
            summary,
            isPaidResource: checked,
            price: checked ? price : null,
            content: text,
            resources // Add the resources to the payload
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
                <p className="py-2">Paid Course</p>
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
            {resources.map((resource, index) => (
                <div key={index} className="p-inputgroup flex-1 mt-8">
                    <InputText value={resource} onChange={(e) => handleResourceChange(e.target.value, index)} placeholder={`Resource #${index + 1}`} />
                </div>
            ))}
            <div className="flex justify-center mt-4">
                <Button type="button" onClick={addResource} label="Add Resource" />
            </div>

            <div className="flex justify-center mt-8">
                <Button type="submit" severity="success" outlined label="Submit" />
            </div>
        </form>
    );
}

export default CourseForm;

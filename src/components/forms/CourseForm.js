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
    const [resources, setResources] = useState(['']);
    const [topics, setTopics] = useState(['']);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            title,
            summary,
            isPaidResource: checked,
            price: checked ? price : null,
            content: text,
            topics: topics.map(topic => topic.trim().toLowerCase()),
            resources: resources.map(resource => resource.trim())
        };
        console.log(payload);
    }

    const addResource = () => {
        setResources([...resources, '']); // Add an empty string to the resources array
    };

    const removeResource = (index) => {
        const updatedResources = resources.filter((_, i) => i !== index);
        setResources(updatedResources);
    };

    const handleResourceChange = (value, index) => {
        const updatedResources = resources.map((resource, i) => i === index ? value : resource);
        setResources(updatedResources);
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = topics.map((topic, i) => i === index ? value : topic);
        setTopics(updatedTopics);
    };

    const addTopic = () => {
        setTopics([...topics, '']); // Add an empty string to the topics array
    };

    const removeTopic = (index) => {
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };

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
            <div className="mt-8 flex-col w-full">
                {resources.map((resource, index) => (
                    <div key={index} className="p-inputgroup flex-1 mt-8">
                        <InputText value={resource} onChange={(e) => handleResourceChange(e.target.value, index)} placeholder={`Resource #${index + 1}`} className="w-full" />
                        {index > 0 && ( // Only render the minus button if the index is greater than 0
                            <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeResource(index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <Button type="button" icon="pi pi-plus" onClick={addResource} />
                </div>
            </div>

            <div className="mt-8 flex-col w-full">
                {topics.map((topic, index) => (
                    <div className="p-inputgroup flex-1" key={index}>
                        <InputText value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder="Topic" className="w-full mt-2" />
                        {index > 0 && (
                            <Button icon="pi pi-times" className="p-button-danger mt-2" onClick={() => removeTopic(index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <Button icon="pi pi-plus" onClick={addTopic} />
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <Button type="submit" severity="success" outlined label="Submit" />
            </div>
        </form>
    );
}

export default CourseForm;

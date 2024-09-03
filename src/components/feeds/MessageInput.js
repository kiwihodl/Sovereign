import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';

const MessageInput = ({ collapsed, onToggle }) => {
    const [message, setMessage] = useState('');

    return (
        <Panel header={null} toggleable collapsed={collapsed} onToggle={onToggle} className="w-full" pt={{
            header: {
                className: 'bg-transparent',
                border: 'none',
            },
            toggler: {
                className: 'bg-transparent',
                border: 'none',
            },
            togglerIcon: {
                display: 'none',
            },
        }}>
            <div className="w-full flex flex-col">
                <InputTextarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    cols={30}
                    autoResize
                    placeholder="Type your message here..."
                    className="w-full"
                />
                <div className="w-full flex flex-row justify-end">
                    <Button
                        label="Send"
                        icon="pi pi-send"
                        outlined
                        className='mt-2'
                    />
                </div>
            </div>
        </Panel>
    );
};

export default MessageInput;
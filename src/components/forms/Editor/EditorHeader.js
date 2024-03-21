import React from 'react';
import { Button } from 'primereact/button';

const EditorHeader = ({ quill }) => {
    const embedVideo = () => {
        const videoUrl = prompt('Enter the video URL:');
        if (videoUrl) {
            const videoEmbedCode = `<iframe width="560" height="315" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
            quill.editor.clipboard.dangerouslyPasteHTML(videoEmbedCode);
        }
    };

    return (
        <React.Fragment>
            <span className="ql-formats">
                <select className="ql-font"></select>
                <select className="ql-size"></select>
            </span>
            <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-underline"></button>
                <select className="ql-color"></select>
                <select className="ql-background"></select>
            </span>
            <span className="ql-formats">
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
                <select className="ql-align"></select>
            </span>
            <span className="ql-formats">
                <button className="ql-link"></button>
                <button className="ql-image"></button>
                <button className="ql-video"></button>
            </span>
            <Button
                icon="pi pi-video"
                className="p-button-outlined p-button-secondary"
                onClick={embedVideo}
                style={{ marginRight: '0.5rem' }}
            />
        </React.Fragment>
    );
};

export default EditorHeader;
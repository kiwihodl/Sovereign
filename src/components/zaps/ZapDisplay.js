import React, { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import ZapForm from './ZapForm';
import { ProgressSpinner } from 'primereact/progressspinner';

const ZapDisplay = ({ zapAmount, event }) => {
    const op = useRef(null);
    return (
        <>
            <span className="text-xs cursor-pointer" onClick={(e) => op.current.toggle(e)}>
                <i className="pi pi-bolt text-yellow-300"></i>
                {zapAmount || zapAmount === 0 ? (
                    zapAmount
                ) : (
                    <ProgressSpinner style={{ display: 'inline-block' }} />
                )}
            </span>
            <OverlayPanel className='w-[40%] h-[40%]' ref={op}>
                <ZapForm event={event} />
            </OverlayPanel>
        </>
    )
}

export default ZapDisplay;

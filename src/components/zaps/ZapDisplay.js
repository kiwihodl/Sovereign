import React, { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import ZapForm from './ZapForm';
import { ProgressSpinner } from 'primereact/progressspinner';

const ZapDisplay = ({ zapAmount, event, zapsLoading }) => {
    const op = useRef(null);
    return (
        <>
            <span className="text-xs cursor-pointer flex items-center" onClick={(e) => op.current.toggle(e)}>
                <i className="pi pi-bolt text-yellow-300"></i>
                {zapsLoading ? (
                    <ProgressSpinner style={{width: '20px', height: '20px'}} strokeWidth="8" animationDuration=".5s" />
                ) : (
                    zapAmount
                )}
            </span>
            <OverlayPanel className='w-[40%] h-[40%]' ref={op}>
                <ZapForm event={event} />
            </OverlayPanel>
        </>
    )
}

export default ZapDisplay;

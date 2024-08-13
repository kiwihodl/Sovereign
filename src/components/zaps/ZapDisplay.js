import React, { useRef, useEffect, useState, useMemo } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import ZapForm from './ZapForm';
import { ProgressSpinner } from 'primereact/progressspinner';

const ZapDisplay = ({ zapAmount, event, zapsLoading }) => {
    const op = useRef(null);
    const [extraLoading, setExtraLoading] = useState(false);

    useMemo(() => {
        let timeout;
        if (!zapsLoading && zapAmount === 0) {
            setExtraLoading(true);
            timeout = setTimeout(() => setExtraLoading(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [zapsLoading, zapAmount]);

    return (
        <>
            <span className="text-xs cursor-pointer flex items-center relative hover:opacity-80" onClick={(e) => op.current.toggle(e)}>
                <i className="pi pi-bolt text-yellow-300 text-lg"></i>
                <span className="relative flex items-center min-w-[20px] min-h-[20px] text-sm">
                    {zapsLoading || zapAmount === null || extraLoading ? (
                        <ProgressSpinner className="absolute top-0 left-0 w-[20px] h-[20px]" strokeWidth="8" animationDuration=".5s" />
                    ) : (
                        zapAmount
                    )}
                </span>
            </span>
            <OverlayPanel className='w-[40%] h-[40%]' ref={op}>
                <ZapForm event={event} />
            </OverlayPanel>
        </>
    )
}

export default ZapDisplay;

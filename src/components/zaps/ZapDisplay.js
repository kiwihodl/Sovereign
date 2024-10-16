import React, { useRef, useEffect, useState, useMemo } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import ZapForm from './ZapForm';
import { ProgressSpinner } from 'primereact/progressspinner';
import useWindowWidth from '@/hooks/useWindowWidth';

const ZapDisplay = ({ zapAmount, event, zapsLoading }) => {
    const op = useRef(null);
    const [extraLoading, setExtraLoading] = useState(false);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

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
            <OverlayPanel className={`${isMobile ? 'w-[90%] h-[90%]' : 'w-[50%] h-[50%]'}`} ref={op}>
                <ZapForm event={event} />
            </OverlayPanel>
        </>
    )
}

export default ZapDisplay;

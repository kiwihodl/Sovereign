import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Menu } from 'primereact/menu';
import { Tooltip } from 'primereact/tooltip';
import { nip19 } from 'nostr-tools';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useToast } from '@/hooks/useToast';
import UserBadges from '@/components/profile/UserBadges';
import useWindowWidth from '@/hooks/useWindowWidth';
import MoreInfo from '@/components/MoreInfo';

const UserProfileCard = ({ user }) => {
    const [showBadges, setShowBadges] = useState(false);
    const menu = useRef(null);
    const { showToast } = useToast();
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("success", "Copied", "Copied to clipboard");
    };

    const menuItems = [
        ...(user?.privkey ? [{
            label: 'Copy nsec',
            icon: 'pi pi-key',
            command: () => {
                const privkeyBuffer = Buffer.from(user.privkey, 'hex');
                copyToClipboard(nip19.nsecEncode(privkeyBuffer));
            }
        }] : []),
        {
            label: 'Copy npub',
            icon: 'pi pi-user',
            command: () => {
                if (user.pubkey) {
                    copyToClipboard(nip19.npubEncode(user?.pubkey));
                }
            }
        },
        {
            label: 'Open Nostr Profile',
            icon: 'pi pi-external-link',
            command: () => window.open(`https://nostr.com/${nip19.npubEncode(user?.pubkey)}`, '_blank')
        }
    ];

    const MobileProfileCard = () => (
        <div className="w-full bg-gray-800 rounded-lg p-2 py-1 border border-gray-700 shadow-md h-[420px] flex flex-col justify-center items-start">
            <div className="flex flex-col gap-2 pt-4 w-full relative">
                <div className="absolute top-8 right-[14px]">
                    <i
                        className="pi pi-ellipsis-h text-2xl cursor-pointer"
                        onClick={(e) => menu.current.toggle(e)}
                    />
                    <Menu
                        model={menuItems}
                        popup
                        ref={menu}
                        id="profile-options-menu"
                    />
                </div>
            </div>
            <Image
                alt="user's avatar"
                src={returnImageProxy(user.avatar, user?.pubkey || "")}
                width={100}
                height={100}
                className="rounded-full m-2 mt-0 object-cover max-w-[100px] max-h-[100px]"
            />
            <h3 className="text-center">
                {user.username || user?.email || "Anon"}
            </h3>
            <div className="flex flex-col gap-2 justify-center w-full overflow-hidden">
                {
                    user?.pubkey && (
                        <div className="flex flex-row gap-2 items-center w-full overflow-hidden">
                            <div className="overflow-hidden">
                                <p className="text-ellipsis overflow-hidden whitespace-nowrap">
                                    {nip19.npubEncode(user.pubkey)}
                                </p>
                            </div>
                            <MoreInfo 
                                tooltip="Your Nostr Public Key"
                                modalTitle="Public Key Information"
                                modalBody="Your public key is a unique identifier for your Nostr account. If you logged in with email, anon, or github this was generated for you by plebdevs and is used to link your account to the wider Nostr network."
                                className="text-xs shrink-0"
                            />
                        </div>
                    )
                }
                {user?.createdAt && (
                    <p className="truncate">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                )}
            </div>
            <div className='w-full flex flex-row justify-between'>
                <div className="flex flex-col justify-between gap-4 my-2">
                    {user?.platformLightningAddress ? (
                        <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <span className="font-bold">Lightning Address:</span> {user.platformLightningAddress.name}@plebdevs.com <i className="pi pi-copy cursor-pointer hover:text-gray-400" onClick={() => copyToClipboard(user.platformLightningAddress.name + "@plebdevs.com")} />
                        </h4>
                    ) : user?.lud16 ? (
                        <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <span className="font-bold">Lightning Address:</span> {user.lud16} <i className="pi pi-copy cursor-pointer hover:text-gray-400" onClick={() => copyToClipboard(user.lud16)} />
                        </h4>
                    ) : (
                        <div className="flex flex-row justify-between bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <h4>
                                <span className="font-bold">Lightning Address:</span> None
                            </h4>
                            <MoreInfo 
                                tooltip="PlebDevs Custom Lightning Address"
                                modalTitle="PlebDevs Custom Lightning Address"
                                modalBody="This is a placeholder for your PlebDevs issued Lightning Address (claimable through subscription)"
                                className="text-xs"
                            />
                        </div>
                    )}
                    {user?.platformNip05 ? (
                        <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <span className="font-bold">NIP-05:</span>{' '}
                            {user.platformNip05.name}@plebdevs.com{' '}
                            <i 
                                className="pi pi-copy cursor-pointer hover:text-gray-400" 
                                onClick={() => copyToClipboard(`${user.platformNip05.name}@plebdevs.com`)} 
                            />
                        </h4>
                    ) : user?.nip05 ? (
                        <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <span className="font-bold">NIP-05:</span>{' '}
                            {user.nip05}{' '}
                            <i 
                                className="pi pi-copy cursor-pointer hover:text-gray-400" 
                                onClick={() => copyToClipboard(user.nip05)} 
                            />
                        </h4>
                    ) : (
                        <div className="flex flex-row justify-between bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                            <h4>
                                <span className="font-bold">NIP-05:</span> None
                            </h4>
                            <MoreInfo 
                                tooltip="NIP-05 Info"
                                modalTitle="What is NIP-05?"
                                modalBody="NIP-05 is a verification standard in Nostr that links your identity to a domain name, similar to how Twitter verifies accounts. It helps prove ownership of your identity."
                                className="text-xs"
                            />
                        </div>
                    )}
                <div className="flex flex-col justify-center min-w-[140px] px-2">
                    <button
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold"
                        onClick={() => setShowBadges(true)}
                        >
                        View Badges
                    </button>
                        </div>
                </div>
            </div>
        </div>
    );

    const DesktopProfileCard = () => (
        <div className="w-full bg-gray-800 rounded-lg p-2 py-1 border border-gray-700 shadow-md h-[330px]">
            <div className="flex flex-row w-full justify-evenly">
                <Image
                    alt="user's avatar"
                    src={returnImageProxy(user.avatar, user?.pubkey || "")}
                    width={100}
                    height={100}
                    className="rounded-full my-4 object-cover max-w-[100px] max-h-[100px]"
                />
                <div className="flex flex-col gap-2 pt-4 w-fit relative">
                    <div className="absolute top-[-1px] right-[-18px]">
                        <i
                            className="pi pi-ellipsis-h text-2xl cursor-pointer"
                            onClick={(e) => menu.current.toggle(e)}
                        />
                        <Menu
                            model={menuItems}
                            popup
                            ref={menu}
                            id="profile-options-menu"
                        />
                    </div>
                    <h3 className="self-start">
                        {user.username || user?.email || "Anon"}
                    </h3>
                    {
                        user?.pubkey && (
                            <div className="flex flex-row gap-2">
                                <p className="truncate">
                                    {nip19.npubEncode(user.pubkey).slice(0, 12)}...
                                </p>
                                <MoreInfo 
                                    tooltip="Your Nostr Public Key"
                                    modalTitle="Public Key Information"
                                    modalBody="Your public key is a unique identifier for your Nostr account. If you logged in with email, anon, or github this was generated for you by plebdevs and is used to link your account to the wider Nostr network."
                                    className="text-xs shrink-0"
                                />
                            </div>
                        )
                    }
                    {user?.createdAt && (
                        <p className="truncate">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex flex-col justify-between gap-2">
                {user?.platformLightningAddress ? (
                    <h4 className="bg-gray-900 rounded-lg p-2 max-lap:w-fit min-w-[240px]">
                        <span className="font-bold">Lightning Address:</span> {user.platformLightningAddress.name}@plebdevs.com <i className="pi pi-copy cursor-pointer hover:text-gray-400" onClick={() => copyToClipboard(user.platformLightningAddress.name + "@plebdevs.com")} />
                    </h4>
                ) : user?.lud16 ? (
                    <h4 className="bg-gray-900 rounded-lg p-2 max-lap:w-fit min-w-[240px]">
                        <span className="font-bold">Lightning Address:</span> {user.lud16} <i className="pi pi-copy cursor-pointer hover:text-gray-400" onClick={() => copyToClipboard(user.lud16)} />
                    </h4>
                ) : (
                    <div className="flex flex-row justify-between bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                        <h4 >
                            <span className="font-bold">Lightning Address:</span> None
                        </h4>
                        <MoreInfo 
                            tooltip="Lightning Address Info"
                            modalTitle="Lightning Address"
                            modalBody="A Lightning address allows you to receive Bitcoin payments through the Lightning Network. It works similar to an email address but for Bitcoin transactions."
                            className="text-xs"
                        />
                    </div>
                )}
                {user?.platformNip05 ? (
                    <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                        <span className="font-bold">NIP-05:</span>{' '}
                        {user.platformNip05.name}@plebdevs.com{' '}
                        <i 
                            className="pi pi-copy cursor-pointer hover:text-gray-400" 
                            onClick={() => copyToClipboard(`${user.platformNip05.name}@plebdevs.com`)} 
                        />
                    </h4>
                ) : user?.nip05 ? (
                    <h4 className="bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                        <span className="font-bold">NIP-05:</span>{' '}
                        {user.nip05}{' '}
                        <i 
                            className="pi pi-copy cursor-pointer hover:text-gray-400" 
                            onClick={() => copyToClipboard(user.nip05)} 
                        />
                    </h4>
                ) : (
                    <div className="flex flex-row justify-between bg-gray-900 rounded-lg p-3 max-lap:w-fit min-w-[240px]">
                        <h4>
                            <span className="font-bold">NIP-05:</span> None
                        </h4>
                        <MoreInfo 
                            tooltip="NIP-05 Info"
                            modalTitle="What is NIP-05?"
                            modalBody="NIP-05 is a verification standard in Nostr that links your identity to a domain name, similar to how Twitter verifies accounts. It helps prove ownership of your identity."
                            className="text-xs"
                        />
                    </div>
                )}
                <button
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold max-lap:w-fit min-w-[140px]"
                    onClick={() => setShowBadges(true)}
                >
                    View Badges
                </button>
            </div>
        </div>
    );

    // 1440px is the max-lap breakpoint from tailwind config
    return (
        <>
            {windowWidth <= 1440 ? <MobileProfileCard /> : <DesktopProfileCard />}
            <UserBadges
                visible={showBadges}
                onHide={() => setShowBadges(false)}
            />
        </>
    );
};

export default UserProfileCard;

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Menu } from 'primereact/menu';
import Modal from '@/components/ui/Modal';
import { nip19 } from 'nostr-tools';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useToast } from '@/hooks/useToast';
import useWindowWidth from '@/hooks/useWindowWidth';
import MoreInfo from '@/components/MoreInfo';
import UserRelaysTable from '@/components/profile/DataTables/UserRelaysTable';
import { useNDKContext } from '@/context/NDKContext';

const UserProfileCard = ({ user }) => {
  const [showRelaysModal, setShowRelaysModal] = useState(false);
  const menu = useRef(null);
  const { showToast } = useToast();
  const { returnImageProxy } = useImageProxy();
  const windowWidth = useWindowWidth();
  const { ndk, userRelays, setUserRelays, reInitializeNDK } = useNDKContext();

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied', 'Copied to clipboard');
  };

  const menuItems = [
    ...(user?.privkey
      ? [
          {
            label: 'Copy nsec',
            icon: 'pi pi-key',
            command: () => {
              const privkeyBuffer = Buffer.from(user.privkey, 'hex');
              copyToClipboard(nip19.nsecEncode(privkeyBuffer));
            },
          },
        ]
      : []),
    {
      label: 'Copy npub',
      icon: 'pi pi-user',
      command: () => {
        if (user.pubkey) {
          copyToClipboard(nip19.npubEncode(user?.pubkey));
        }
      },
    },
    {
      label: 'Open Nostr Profile',
      icon: 'pi pi-external-link',
      command: () => window.open(`https://nostr.com/${nip19.npubEncode(user?.pubkey)}`, '_blank'),
    },
    {
      label: 'Manage Relays',
      icon: 'pi pi-server',
      command: () => setShowRelaysModal(true),
    },
  ];

  const MobileProfileCard = () => (
    <div className="w-full bg-gray-800 rounded-lg p-2 py-1 border border-gray-700 shadow-md h-[280px] flex flex-col justify-center items-start">
      <div className="flex flex-col gap-2 pt-4 w-full relative">
        <div className="absolute top-8 right-[14px]">
          <i
            className="pi pi-ellipsis-h text-2xl cursor-pointer"
            onClick={e => menu.current.toggle(e)}
          />
          <Menu model={menuItems} popup ref={menu} id="profile-options-menu" />
        </div>
      </div>
      <Image
        alt="user's avatar"
        src={returnImageProxy(user.avatar, user?.pubkey || '')}
        width={100}
        height={100}
        className="rounded-full m-2 mt-0 object-cover max-w-[100px] max-h-[100px]"
      />
      <h3 className="text-center">{user.username || user?.email || 'Anon'}</h3>
      <div className="flex flex-col gap-2 justify-center w-full overflow-hidden">
        {user?.pubkey && (
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
        )}
        {user?.createdAt && (
          <p className="truncate">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );

  const DesktopProfileCard = () => (
    <div className="w-full bg-gray-800 rounded-lg p-2 py-1 border border-gray-700 shadow-md h-[200px]">
      <div className="flex flex-row w-full justify-evenly">
        <Image
          alt="user's avatar"
          src={returnImageProxy(user.avatar, user?.pubkey || '')}
          width={100}
          height={100}
          className="rounded-full my-4 object-cover max-w-[100px] max-h-[100px]"
        />
        <div className="flex flex-col gap-2 pt-4 w-fit relative">
          <div className="absolute top-[-1px] right-[-18px]">
            <i
              className="pi pi-ellipsis-h text-2xl cursor-pointer"
              onClick={e => menu.current.toggle(e)}
            />
            <Menu model={menuItems} popup ref={menu} id="profile-options-menu" />
          </div>
          <h3 className="self-start">{user.username || user?.email || 'Anon'}</h3>
          {user?.pubkey && (
            <div className="flex flex-row gap-2">
              <p className="truncate">{nip19.npubEncode(user.pubkey).slice(0, 12)}...</p>
              <MoreInfo
                tooltip="Your Nostr Public Key"
                modalTitle="Public Key Information"
                modalBody="Your public key is a unique identifier for your Nostr account. If you logged in with email, anon, or github this was generated for you by plebdevs and is used to link your account to the wider Nostr network."
                className="text-xs shrink-0"
              />
            </div>
          )}
          {user?.createdAt && (
            <p className="truncate">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );

  // 1440px is the max-lap breakpoint from tailwind config
  return (
    <>
      {windowWidth <= 1440 ? <MobileProfileCard /> : <DesktopProfileCard />}
      <Modal
        visible={showRelaysModal}
        onHide={() => setShowRelaysModal(false)}
        header="Manage Relays"
        width="full"
        className="max-w-[800px]"
      >
        <UserRelaysTable
          ndk={ndk}
          userRelays={userRelays}
          setUserRelays={setUserRelays}
          reInitializeNDK={reInitializeNDK}
        />
      </Modal>
    </>
  );
};

export default UserProfileCard;

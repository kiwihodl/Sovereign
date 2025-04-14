import React from 'react';
import Image from 'next/image';
import GenericButton from '@/components/buttons/GenericButton';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useRouter } from 'next/router';
import { nip19 } from 'nostr-tools';
import { Divider } from 'primereact/divider';
import appConfig from '@/config/appConfig';

const ContentListItem = content => {
  const { returnImageProxy } = useImageProxy();
  const router = useRouter();
  const isPublishedCourse = content?.kind === 30004;
  const isDraftCourse = !content?.kind && content?.draftLessons;
  const isResource = (content?.kind && content?.kind === 30023) || content?.kind === 30402;
  const isDraft = !content?.kind && !content?.draftLessons;

  const handleClick = () => {
    let nAddress;
    if (isPublishedCourse) {
      nAddress = nip19.naddrEncode({
        identifier: content?.d || content.id,
        kind: content.kind,
        pubkey: content.pubkey,
        relays: appConfig.defaultRelayUrls,
      });
      router.push(`/course/${nAddress}`);
    } else if (isDraftCourse) {
      router.push(`/course/${content.id}/draft`);
    } else if (isResource) {
      nAddress = nip19.naddrEncode({
        identifier: content.d,
        kind: content.kind,
        pubkey: content.pubkey,
        relays: appConfig.defaultRelayUrls,
      });
      router.push(`/details/${nAddress}`);
    } else if (isDraft) {
      router.push(`/draft/${content.id}`);
    }
  };

  return (
    <div className="p-4 border-bottom-1 surface-border" key={content.id}>
      <div className="flex flex-column md:flex-row gap-4 max-tab:flex-col">
        <Image
          alt="content thumbnail"
          src={returnImageProxy(content.image)}
          width={150}
          height={100}
          className="w-full md:w-[150px] h-[100px] object-cover object-center border-round"
        />
        <div className="flex-1">
          <div className="text-xl text-900 font-bold mb-2">{content.title}</div>
          <div className="flex align-items-center text-600 gap-2 mb-2">
            <span>{content.summary}</span>
          </div>
          <div className="text-right">
            <GenericButton onClick={handleClick} label="Open" outlined />
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default ContentListItem;

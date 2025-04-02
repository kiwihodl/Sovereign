import React, { useState, useEffect } from 'react';
import GenericButton from '@/components/buttons/GenericButton';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import 'primeicons/primeicons.css';
import { Tooltip } from 'primereact/tooltip';
import 'primereact/resources/primereact.min.css';

const EmbeddedVideoForm = ({ draft = null, onSave, isPaid }) => {
  const [title, setTitle] = useState(draft?.title || '');
  const [summary, setSummary] = useState(draft?.summary || '');
  const [price, setPrice] = useState(draft?.price || 0);
  const [isPaidResource, setIsPaidResource] = useState(isPaid);
  const [videoUrl, setVideoUrl] = useState(draft?.content || '');
  const [coverImage, setCoverImage] = useState(draft?.image || '');
  const [topics, setTopics] = useState(draft?.topics || ['']);
  const [user, setUser] = useState();
  const [additionalLinks, setAdditionalLinks] = useState(draft?.additionalLinks || ['']);

  const { showToast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      console.log('session', session.user);
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setSummary(draft.summary);
      setPrice(draft.price || 0);
      setIsPaidResource(draft.price ? true : false);
      setVideoUrl(draft.content);
      setCoverImage(draft.image);
      setTopics(draft.topics || ['']);
      setAdditionalLinks(draft.additionalLinks || ['']);
    }
  }, [draft]);

  const handleSubmit = async e => {
    e.preventDefault();
    let embedCode = '';

    // Check if it's a YouTube video
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }
    // Check if it's a Vimeo video
    else if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('/').pop();
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://player.vimeo.com/video/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }
    // Add more conditions here for other video services

    const payload = {
      title,
      summary,
      type: 'vidoe',
      price: isPaidResource ? price : null,
      content: embedCode,
      image: coverImage,
      topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'video'])],
      additionalLinks: additionalLinks.filter(link => link.trim() !== ''),
      user: user?.id || user?.pubkey,
    };

    if (onSave) {
      try {
        await onSave(payload);
        showToast(
          'success',
          'Success',
          draft ? 'Video updated successfully.' : 'Video created successfully.'
        );
      } catch (error) {
        console.error(error);
        showToast('error', 'Error', 'Failed to save video. Please try again.');
      }
    }
  };

  const handleTopicChange = (index, value) => {
    const updatedTopics = topics.map((topic, i) => (i === index ? value : topic));
    setTopics(updatedTopics);
  };

  const addTopic = e => {
    e.preventDefault();
    setTopics([...topics, '']); // Add an empty string to the topics array
  };

  const removeTopic = (e, index) => {
    e.preventDefault();
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = additionalLinks.map((link, i) => (i === index ? value : link));
    setAdditionalLinks(updatedLinks);
  };

  const addLink = e => {
    e.preventDefault();
    setAdditionalLinks([...additionalLinks, '']);
  };

  const removeLink = (e, index) => {
    e.preventDefault();
    const updatedLinks = additionalLinks.filter((_, i) => i !== index);
    setAdditionalLinks(updatedLinks);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-inputgroup flex-1">
        <InputText value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary"
        />
      </div>

      <div className="p-inputgroup flex-1 mt-4 flex-col">
        <p className="py-2">Paid Video</p>
        <InputSwitch checked={isPaidResource} onChange={e => setIsPaidResource(e.value)} />
        {isPaidResource && (
          <div className="p-inputgroup flex-1 py-4">
            <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
            <InputNumber
              value={price}
              onValueChange={e => setPrice(e.value)}
              placeholder="Price (sats)"
            />
          </div>
        )}
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="Video URL"
        />
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="Cover Image URL"
        />
      </div>
      <div className="mt-8 flex-col w-full">
        <span className="pl-1 flex items-center">
          External Links
          <i
            className="pi pi-info-circle ml-2 cursor-pointer"
            data-pr-tooltip="Add any relevant external links that pair with this content (these links are currently not encrypted for 'paid' content)"
            data-pr-position="right"
            data-pr-at="right+5 top"
            data-pr-my="left center-2"
            style={{ fontSize: '1rem', color: 'var(--primary-color)' }}
          />
        </span>
        {additionalLinks.map((link, index) => (
          <div className="p-inputgroup flex-1" key={index}>
            <InputText
              value={link}
              onChange={e => handleLinkChange(index, e.target.value)}
              placeholder="https://example.com"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeLink(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addLink} />
        </div>
        <Tooltip target=".pi-info-circle" />
      </div>
      <div className="mt-4 flex-col w-full">
        {topics.map((topic, index) => (
          <div className="p-inputgroup flex-1" key={index}>
            <InputText
              value={topic}
              onChange={e => handleTopicChange(index, e.target.value)}
              placeholder="Topic"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeTopic(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addTopic} />
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <GenericButton
          type="submit"
          severity="success"
          outlined
          label={draft ? 'Update' : 'Submit'}
        />
      </div>
    </form>
  );
};

export default EmbeddedVideoForm;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import GenericButton from '@/components/buttons/GenericButton';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Tooltip } from 'primereact/tooltip';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const CDN_ENDPOINT = process.env.NEXT_PUBLIC_CDN_ENDPOINT;

const CombinedResourceForm = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [price, setPrice] = useState(0);
  const [isPaidResource, setIsPaidResource] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [topics, setTopics] = useState(['']);
  const [additionalLinks, setAdditionalLinks] = useState(['']);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  const handleContentChange = useCallback(value => {
    setContent(value || '');
  }, []);

  const getVideoEmbed = url => {
    let embedCode = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://player.vimeo.com/video/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    } else if (
      !price ||
      (price <= 0 &&
        (url.includes('.mp4') ||
          url.includes('.mov') ||
          url.includes('.avi') ||
          url.includes('.wmv') ||
          url.includes('.flv') ||
          url.includes('.webm')))
    ) {
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${CDN_ENDPOINT}/${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
    } else if (
      url.includes('.mp4') ||
      url.includes('.mov') ||
      url.includes('.avi') ||
      url.includes('.wmv') ||
      url.includes('.flv') ||
      url.includes('.webm')
    ) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${baseUrl}/api/get-video-url?videoKey=${encodeURIComponent(url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
    }

    return embedCode;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const userResponse = await axios.get(`/api/users/${user.pubkey}`);
    if (!userResponse.data) {
      showToast('error', 'Error', 'User not found', 'Please try again.');
      return;
    }

    const videoEmbed = videoUrl ? getVideoEmbed(videoUrl) : '';
    const combinedContent = `${videoEmbed}\n\n${content}`;

    const payload = {
      title,
      summary,
      type: 'combined',
      price: isPaidResource ? price : null,
      content: combinedContent,
      image: coverImage,
      user: userResponse.data.id,
      topics: [
        ...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'video', 'document']),
      ],
      additionalLinks: additionalLinks.filter(link => link.trim() !== ''),
    };

    try {
      const response = await axios.post('/api/drafts', payload);
      if (response.status === 201) {
        showToast('success', 'Success', 'Content saved as draft.');
        if (response.data?.id) {
          router.push(`/draft/${response.data.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to save content. Please try again.');
    }
  };

  const handleTopicChange = (index, value) => {
    const updatedTopics = topics.map((topic, i) => (i === index ? value : topic));
    setTopics(updatedTopics);
  };

  const addTopic = e => {
    e.preventDefault();
    setTopics([...topics, '']);
  };

  const removeTopic = (e, index) => {
    e.preventDefault();
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  const handleAdditionalLinkChange = (index, value) => {
    const updatedAdditionalLinks = additionalLinks.map((link, i) => (i === index ? value : link));
    setAdditionalLinks(updatedAdditionalLinks);
  };

  const addAdditionalLink = e => {
    e.preventDefault();
    setAdditionalLinks([...additionalLinks, '']);
  };

  const removeAdditionalLink = (e, index) => {
    e.preventDefault();
    const updatedAdditionalLinks = additionalLinks.filter((_, i) => i !== index);
    setAdditionalLinks(updatedAdditionalLinks);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-inputgroup flex-1">
        <InputText value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      </div>

      <div className="p-inputgroup flex-1 mt-4">
        <InputTextarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary"
          rows={5}
          cols={30}
        />
      </div>

      <div className="p-inputgroup flex-1 mt-4 flex-col">
        <p className="py-2">Paid Resource</p>
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
          placeholder="Video URL (YouTube, Vimeo, or direct video link)"
        />
      </div>

      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="Cover Image URL"
        />
      </div>

      <div className="p-inputgroup flex-1 flex-col mt-4">
        <span>Content</span>
        <div data-color-mode="dark">
          <MDEditor value={content} onChange={handleContentChange} height={350} />
        </div>
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
              onChange={e => handleAdditionalLinkChange(index, e.target.value)}
              placeholder="https://plebdevs.com"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeAdditionalLink(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addAdditionalLink} />
        </div>
        <Tooltip target=".pi-info-circle" />
      </div>
      <div className="mt-8 flex-col w-full">
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
        <GenericButton type="submit" severity="success" outlined label="Submit" />
      </div>
    </form>
  );
};

export default CombinedResourceForm;

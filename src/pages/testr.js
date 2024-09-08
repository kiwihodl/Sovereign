import { useState, useEffect } from 'react';


async function getVideoUrl(videoKey = "testr.mp4") {
    const response = await fetch(`/api/get-video-url?videoKey=${encodeURIComponent(videoKey)}`)
    if (!response.ok) {
      throw new Error('Failed to get video URL')
    }
    const data = await response.json()
    return data.url
  }
  
  const VideoPlayer = ({ videoKey }) => {
    const [videoUrl, setVideoUrl] = useState(null)
  
    useEffect(() => {
      getVideoUrl(videoKey).then(setVideoUrl)
    }, [videoKey])
  
    if (!videoUrl) return <div>Loading...</div>
  
    return <video src={videoUrl} controls />
  }

export default VideoPlayer;
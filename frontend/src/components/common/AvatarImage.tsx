import React, { useState, useEffect } from 'react';

interface AvatarImageProps {
  src?: string;
  username: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  username,
  className = "w-9 h-9 rounded-full border border-[#30363d] bg-[#0d1117] object-cover"
}) => {
  const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackUrl);
  const [attemptedProxy, setAttemptedProxy] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src || fallbackUrl);
    setAttemptedProxy(false);
  }, [src, username]);

  const handleError = () => {
    if (!attemptedProxy && src && src.startsWith('http') && !src.includes('avatar-proxy')) {
      setAttemptedProxy(true);
      setImgSrc(`http://localhost:8000/api/v1/influencers/avatar-proxy?url=${encodeURIComponent(src)}`);
    } else {
      setImgSrc(fallbackUrl);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={username}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
};

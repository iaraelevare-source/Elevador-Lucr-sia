
import React, { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  summary: string;
  onShare: () => void;
  className?: string;
}

const FacebookIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"></path></svg>
);

const TwitterIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
);

const LinkedInIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.481 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path></svg>
);

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.452l-6.574 1.749zm6.278-3.138c1.631.936 3.486 1.449 5.564 1.449 5.373 0 9.718-4.344 9.718-9.718s-4.344-9.718-9.718-9.718-9.718 4.344-9.718 9.718c0 2.088.63 4.098 1.734 5.743l.225.341-1.053 3.866 3.935-1.037.337.213z"></path></svg>
);

const InstagramIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919 4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg>
);


export const SocialShare: React.FC<SocialShareProps> = ({ url, title, summary, className, onShare }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleInstagramCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000); // Esconde a mensagem após 3 segundos
    }).catch(err => {
        console.error('Falha ao copiar: ', err);
    });
  };
  
  const handleShareClick = () => {
    if(onShare) onShare();
  };

  const socialPlatforms = [
      { name: 'Facebook', href: shareLinks.facebook, icon: <FacebookIcon /> },
      { name: 'Twitter', href: shareLinks.twitter, icon: <TwitterIcon /> },
      { name: 'LinkedIn', href: shareLinks.linkedin, icon: <LinkedInIcon /> },
      { name: 'WhatsApp', href: shareLinks.whatsapp, icon: <WhatsAppIcon /> },
  ];

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className}`}>
        <p className="text-sm font-bold text-[#EFD8A3]">Espalhe a novidade:</p>
        <div className="flex items-center gap-3">
            {socialPlatforms.map(platform => (
                <a 
                    key={platform.name}
                    href={platform.href} 
                    onClick={handleShareClick}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={`Share on ${platform.name}`}
                    title={`Compartilhar no ${platform.name}`}
                    className="w-9 h-9 flex items-center justify-center bg-black/30 text-slate-300 rounded-full transition-all duration-300 hover:bg-[#EFD8A3] hover:text-[#1A1A1A] hover:scale-110"
                >
                    {platform.icon}
                </a>
            ))}
            <button 
                onClick={() => {
                  handleInstagramCopy();
                  handleShareClick();
                }}
                aria-label="Share on Instagram"
                title="Copiar link para o Instagram"
                className="w-9 h-9 flex items-center justify-center bg-black/30 text-slate-300 rounded-full transition-all duration-300 hover:bg-[#EFD8A3] hover:text-[#1A1A1A] hover:scale-110"
            >
                <InstagramIcon />
            </button>
        </div>
        {copySuccess && <p className="text-xs text-[#EFD8A3] font-semibold transition-opacity duration-300">Link copiado! Cole no seu Story, Reels ou Bio.</p>}
    </div>
  );
};

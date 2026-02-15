// Ensure background video plays even if autoplay is picky
(() => {
  const bg = document.getElementById('bgVideo');
  if (!bg) return;
  const tryPlay = () => bg.play().catch(()=>{});
  document.addEventListener('DOMContentLoaded', tryPlay);
  document.addEventListener('click', tryPlay, { once:true });
  document.addEventListener('touchstart', tryPlay, { once:true });
})();

// Hover preview for project cards + restore poster after leave
(() => {
  const cards = document.querySelectorAll('.exp__card');
  let current = null;

  cards.forEach(card => {
    const v = card.querySelector('video');
    if (!v) return;
    v.muted = true; v.playsInline = true; v.loop = true;

    card.addEventListener('mouseenter', () => {
      if (current && current !== v) { current.pause(); current.currentTime = 0; current.load(); }
      current = v;
      v.play().catch(()=>{});
    });

    card.addEventListener('mouseleave', () => {
      v.pause();
      v.currentTime = 0;
      v.load(); // show poster again
      if (current === v) current = null;
    });
  });
})();

// Video modal (click a card to watch full) — reads data-desc and data-images
(() => {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');       // container below video
  const modalGallery = document.getElementById('modalGallery'); // image grid

  if (!modal || !modalVideo) return;

  // Turn "• ...<br/>• ..." into a real bullet list
  // const bulletsToList = (html) => {
  //   if (!html) return '';
  //   const parts = html.split(/<br\s*\/?>/i)
  //     .map(s => s.replace(/^•\s*/, '').trim())
  //     .filter(Boolean);
  //   if (!parts.length) return html; // fallback
  //   return `<ul>${parts.map(t => `<li>${t}</li>`).join('')}</ul>`;
  // };
  const bulletsToList = (html) => {
  if (!html) return '';

  const lines = html.split('\n').map(l => l.trim()).filter(Boolean);
  let result = '';
  let inList = false;

  lines.forEach(line => {
    if (line.startsWith('<h3>')) {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      result += line;
    } 
    else if (line.startsWith('•')) {
      if (!inList) {
        result += '<ul>';
        inList = true;
      }
      result += `<li>${line.replace(/^•\s*/, '')}</li>`;
    } 
    else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      result += `<p>${line}</p>`;
    }
  });

  if (inList) result += '</ul>';

  return result;
};


  const parseImages = (val) => {
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };

  const open = (src, title = '', desc = '', images = []) => {
    // reset video
    modalVideo.pause();
    while (modalVideo.firstChild) modalVideo.removeChild(modalVideo.firstChild);
    const s = document.createElement('source');
    s.src = src; s.type = 'video/mp4';
    modalVideo.appendChild(s);

    // title
    modalTitle.textContent = title || 'Project video';

    // description (as bullets if provided in that format)
    if (modalDesc) {
      modalDesc.innerHTML = bulletsToList(desc);
      modalDesc.hidden = !desc;
    }

    // gallery
    if (modalGallery) {
      modalGallery.innerHTML = '';
      images.forEach((imgSrc, i) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = title ? `${title} image ${i+1}` : `Project image ${i+1}`;
        img.loading = 'lazy';

        // NEW: click-to-expand fullscreen
        img.addEventListener('click', () => {
          const overlay = document.createElement('div');
          overlay.className = 'img-lightbox';
          const bigImg = document.createElement('img');
          bigImg.src = imgSrc;
          overlay.appendChild(bigImg);

          // close on click
          overlay.addEventListener('click', () => overlay.remove());

          document.body.appendChild(overlay);
        }   );

        modalGallery.appendChild(img);
      });
      modalGallery.hidden = images.length === 0;
    }


    // open
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modalVideo.load();
    modalVideo.play().catch(()=>{});
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    modalVideo.pause();
    modalVideo.currentTime = 0;
  };

  document.querySelectorAll('.exp__link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const src = link.getAttribute('data-video');
      const title = link.getAttribute('data-title') || '';
      const desc = link.getAttribute('data-desc') || '';
      const images = parseImages(link.getAttribute('data-images') || '');
      open(src, title, desc, images);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.classList.contains('modal__backdrop')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// Reveal-on-scroll
(() => {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
})();


// Reveal-on-scroll
(() => {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
})();

// Hover preview for creative cards
(() => {
  const cards = document.querySelectorAll('.creative-card');
  let current = null;

  cards.forEach(card => {
    const v = card.querySelector('video');
    if (!v) return;
    v.muted = true; v.playsInline = true; v.loop = true;

    card.addEventListener('mouseenter', () => {
      if (current && current !== v) { current.pause(); current.currentTime = 0; current.load(); }
      current = v;
      v.play().catch(()=>{});
    });

    card.addEventListener('mouseleave', () => {
      v.pause();
      v.currentTime = 0;
      v.load();
      if (current === v) current = null;
    });
  });
})();

// Creative works modal (handle both project and creative videos)
(() => {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalGallery = document.getElementById('modalGallery');

  if (!modal || !modalVideo) return;

  const bulletsToList = (html) => {
    if (!html) return '';
    const parts = html.split(/<br\s*\/?>/i)
      .map(s => s.replace(/^â€¢\s*/, '').trim())
      .filter(Boolean);
    if (!parts.length) return html;
    return `<ul>${parts.map(t => `<li>${t}</li>`).join('')}</ul>`;
  };

  const parseImages = (val) => {
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };

  const open = (src, title = '', desc = '', images = []) => {
    modalVideo.pause();
    while (modalVideo.firstChild) modalVideo.removeChild(modalVideo.firstChild);
    const s = document.createElement('source');
    s.src = src; s.type = 'video/mp4';
    modalVideo.appendChild(s);

    modalTitle.textContent = title || 'Project video';

    if (modalDesc) {
      modalDesc.innerHTML = bulletsToList(desc);
      modalDesc.hidden = !desc;
    }

    if (modalGallery) {
      modalGallery.innerHTML = '';
      images.forEach((imgSrc, i) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = title ? `${title} image ${i+1}` : `Project image ${i+1}`;
        img.loading = 'lazy';

        img.addEventListener('click', () => {
          const overlay = document.createElement('div');
          overlay.className = 'img-lightbox';
          const bigImg = document.createElement('img');
          bigImg.src = imgSrc;
          overlay.appendChild(bigImg);
          overlay.addEventListener('click', () => overlay.remove());
          document.body.appendChild(overlay);
        });

        modalGallery.appendChild(img);
      });
      modalGallery.hidden = images.length === 0;
    }

    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modalVideo.load();
    modalVideo.play().catch(()=>{});
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    modalVideo.pause();
    modalVideo.currentTime = 0;
  };

  // Handle both .exp__link and .creative-link
  document.querySelectorAll('.exp__link, .creative-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const src = link.getAttribute('data-video');
      const title = link.getAttribute('data-title') || '';
      const desc = link.getAttribute('data-desc') || '';
      const images = parseImages(link.getAttribute('data-images') || '');
      open(src, title, desc, images);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.classList.contains('modal__backdrop')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// Sketch lightbox
(() => {
  document.querySelectorAll('.sketch-item').forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.getAttribute('data-sketch');
      if (!imgSrc) return;

      const overlay = document.createElement('div');
      overlay.className = 'sketch-lightbox';
      const bigImg = document.createElement('img');
      bigImg.src = imgSrc;
      bigImg.alt = item.querySelector('img')?.alt || 'Sketch';
      overlay.appendChild(bigImg);

      overlay.addEventListener('click', () => overlay.remove());
      
      document.body.appendChild(overlay);
    });
  });
})();

// 3D Model Viewer with fallback
(() => {
  const modelViewer = document.getElementById('modelViewer');
  const modelFallback = document.getElementById('modelFallback');
  const modelHint = document.getElementById('modelHint');
  const hintText = document.getElementById('hintText');
  const modelStatus = document.getElementById('modelStatus');
  const fallbackVideo = modelFallback?.querySelector('.fallback-video');
  
  if (!modelViewer || !modelFallback) return;

  let modelLoaded = false;
  let checkTimeout;

  // Check if model loads successfully
  modelViewer.addEventListener('load', () => {
    modelLoaded = true;
    clearTimeout(checkTimeout);
    
    // Hide fallback, show model
    modelFallback.style.display = 'none';
    modelViewer.style.display = 'block';
    
    if (hintText) {
      hintText.textContent = 'Click and drag to rotate • Scroll to zoom • Auto-rotating';
    }
    
    if (modelStatus) {
      modelStatus.textContent = '✓ Interactive 3D model loaded';
    }
  });

  // Handle model error
  modelViewer.addEventListener('error', (event) => {
    console.log('Model failed to load, using video fallback');
    showFallback();
  });

  // Timeout fallback (if model takes too long)
  checkTimeout = setTimeout(() => {
    if (!modelLoaded) {
      console.log('Model timeout, using video fallback');
      showFallback();
    }
  }, 5000);

  function showFallback() {
    modelFallback.style.display = 'flex';
    modelViewer.style.display = 'none';
    
    if (hintText) {
      hintText.textContent = 'Click to play video preview';
    }
    
    if (modelStatus) {
      modelStatus.textContent = 'Video preview (3D model file not found)';
      modelStatus.style.color = 'rgba(255,255,255,0.5)';
    }
  }

  // Video fallback click handler
  if (modelFallback && fallbackVideo) {
    modelFallback.addEventListener('click', () => {
      if (fallbackVideo.paused) {
        fallbackVideo.play();
        modelFallback.classList.add('playing');
        if (hintText) {
          hintText.textContent = 'Click to pause';
        }
      } else {
        fallbackVideo.pause();
        modelFallback.classList.remove('playing');
        if (hintText) {
          hintText.textContent = 'Click to play video preview';
        }
      }
    });
  }
})();


(() => {
  const videos = document.querySelectorAll('video[data-autoplay-when-visible]');
  if (!videos.length) return;
  const eligibleVideos = new Set();

  const attemptPlayback = (video) => {
    if (!eligibleVideos.has(video) || document.visibilityState !== 'visible') return;
    // Muted, inline playback is required for automatic playback on iOS and Android.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  };

  videos.forEach((video) => {
    const section = video.closest('.tesla-film');
    video.controls = false;
    video.removeAttribute('controls');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('webkit-playsinline', '');
    video.addEventListener('loadeddata', () => attemptPlayback(video));
    video.addEventListener('canplay', () => attemptPlayback(video));
    video.addEventListener('playing', () => {
      const rate = Number(video.dataset.playbackRate);
      video.playbackRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
      section?.classList.remove('is-playing');
      requestAnimationFrame(() => section?.classList.add('is-playing'));
    });
    video.addEventListener('pause', () => section?.classList.remove('is-playing'));
  });

  const requestedLoad = new WeakSet();
  const prepareVideo = (video) => {
    video.preload = 'auto';
    if (!requestedLoad.has(video)) {
      requestedLoad.add(video);
      video.load();
    }
  };

  // Start muted playback before the section reaches the viewport so mobile webviews
  // have time to load and begin the clip without a tap.
  const playbackObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting) {
        eligibleVideos.add(video);
        prepareVideo(video);
        attemptPlayback(video);
      } else {
        eligibleVideos.delete(video);
        video.pause();
      }
    }
  }, { threshold: 0, rootMargin: '1400px 0px' });
  videos.forEach((video) => playbackObserver.observe(video));

  // Buffer clips well ahead; playback starts within the expanded 1400px lead-in.
  const preloadNearby = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) prepareVideo(entry.target);
    }
  }, { threshold: 0, rootMargin: '1800px 0px' });
  const preloadCybertruck = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) prepareVideo(entry.target);
    }
  }, { threshold: 0, rootMargin: '2400px 0px' });
  videos.forEach((video) => {
    if (video.closest('.tesla-film')?.getAttribute('aria-label') === 'Cybertruck video') preloadCybertruck.observe(video);
    else preloadNearby.observe(video);
  });

  const retryVisibleVideos = () => eligibleVideos.forEach(attemptPlayback);
  document.addEventListener('pointerdown', retryVisibleVideos, { passive: true });
  document.addEventListener('keydown', retryVisibleVideos);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') retryVisibleVideos();
    else eligibleVideos.forEach((video) => video.pause());
  });
})();

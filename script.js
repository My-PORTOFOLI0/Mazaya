const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const revealEls = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');
const menuToggle = document.querySelector('.menu-toggle');
const navContainer = document.querySelector('.nav-links');
const cursorGlow = document.querySelector('.cursor-glow');
const backgroundMusic = document.getElementById('backgroundMusic');

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const scrollToProfileOnLoad = () => {
  if (window.location.hash) return;

  const profileSection = document.getElementById('about');
  if (!profileSection) return;

  requestAnimationFrame(() => {
    profileSection.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
};

window.addEventListener('DOMContentLoaded', scrollToProfileOnLoad);
window.addEventListener('load', scrollToProfileOnLoad);

let audioContext = null;
let masterGain = null;
let lastScrollSoundAt = 0;
let backgroundMusicStarted = false;

const ensureAudioContext = () => {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.06;
  masterGain.connect(audioContext.destination);

  return audioContext;
};

const playTone = ({ frequency, duration, type, volume }) => {
  const context = ensureAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    context.resume().catch(() => {});
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type || 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume || 0.025, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(masterGain || context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
};

const playClickSound = () => {
  playTone({ frequency: 760, duration: 0.08, type: 'square', volume: 0.03 });
  playTone({ frequency: 520, duration: 0.05, type: 'sine', volume: 0.018 });
};

const playScrollSound = () => {
  const now = performance.now();
  if (now - lastScrollSoundAt < 140) return;

  lastScrollSoundAt = now;
  playTone({ frequency: 320, duration: 0.12, type: 'sine', volume: 0.012 });
};

const startBackgroundMusic = () => {
  if (!backgroundMusic || backgroundMusicStarted) return;

  backgroundMusicStarted = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.volume = 0.2;
  backgroundMusic.muted = true;
  backgroundMusic.loop = true;

  const playPromise = backgroundMusic.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => {
        backgroundMusic.muted = false;
      })
      .catch(() => {
        setTimeout(() => {
          backgroundMusic.muted = false;
          backgroundMusic.play().catch(() => {});
        }, 250);
      });
  }
};

const experiences = [
  {
    title: 'UC Fest 2024',
    role: 'Divisi LO Tenant',
    points: [
      'Menjadi penghubung antara tenant dengan panitia.',
      'Mendukung koordinasi kebutuhan acara dan tenant management.',
      'Melatih komunikasi, adaptasi, dan problem solving di lapangan.'
    ]
  },
  {
    title: 'UC Debate Competition 2025',
    role: 'Liaison Officer peserta lomba dan Timekeeper',
    points: [
      'Mengelola komunikasi peserta lomba dengan panitia.',
      'Menjaga alur waktu kompetisi agar tetap tertib.',
      'Memperkuat public speaking, ketelitian, dan respons cepat.'
    ]
  },
  {
    title: 'Innopreneur Fest 2025',
    role: 'Divisi LO Tenant',
    points: [
      'Membantu kebutuhan tenant dalam kegiatan kewirausahaan kampus.',
      'Menjaga hubungan profesional dengan peserta dan tenant.',
      'Mendukung operasional event berbasis entrepreneurship.'
    ]
  },
  {
    title: 'Festival AWE X UC Makassar 2025',
    role: 'Divisi Keamanan',
    points: [
      'Mendukung pengaturan keamanan dan kenyamanan peserta.',
      'Berkoordinasi dengan lintas divisi selama acara berlangsung.',
      'Mengasah kedisiplinan dan awareness terhadap situasi acara.'
    ]
  },
  {
    title: 'Ciputra Humanity Day 2025',
    role: 'PIC perwakilan duta untuk Divisi Perlengkapan',
    points: [
      'Menjadi penanggung jawab perwakilan duta pada kebutuhan perlengkapan.',
      'Mengatur koordinasi teknis dan kesiapan kebutuhan acara.',
      'Membangun tanggung jawab, kepemimpinan, dan kerja sistematis.'
    ]
  },
  {
    title: 'Final Project CE: Intrapreneur Competition 2025',
    role: 'Divisi Perlengkapan',
    points: [
      'Membantu kesiapan perlengkapan untuk kebutuhan kompetisi.',
      'Mendukung operasional acara dari sisi logistik.',
      'Melatih manajemen waktu dan eksekusi teknis.'
    ]
  },
  {
    title: 'UC Debate Competition 2026',
    role: 'Liaison Officer, Timekeeper, Divisi Konsumsi',
    points: [
      'Menangani beberapa peran dalam satu event secara adaptif.',
      'Mendukung alur kompetisi, peserta, dan konsumsi acara.',
      'Membuktikan kemampuan multi-tasking dan koordinasi lintas kebutuhan.'
    ]
  }
];

const onScroll = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progress.style.width = `${percentage}%`;
  header.classList.toggle('scrolled', scrollTop > 18);

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (scrollTop >= sectionTop) current = section.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealEls.forEach(el => revealObserver.observe(el));

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    let start = 0;
    const duration = 1200;
    const startedAt = performance.now();

    const tick = now => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (target - start) * ease);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: .65 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

menuToggle.addEventListener('click', () => {
  const isOpen = navContainer.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navContainer.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const detail = document.getElementById('experienceDetail');
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.exp-tab').forEach(btn => btn.classList.remove('active'));
    tab.classList.add('active');

    const data = experiences[Number(tab.dataset.exp)];
    detail.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 280, easing: 'ease-out' });

    detail.innerHTML = `
      <span class="detail-kicker">Selected Experience</span>
      <h3>${data.title}</h3>
      <p>${data.role}</p>
      <ul>${data.points.map(point => `<li>${point}</li>`).join('')}</ul>
    `;
  });
});

const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - .5) * 9;
    const rotateX = ((y / rect.height) - .5) * -9;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
  });
});

window.addEventListener('mousemove', e => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  const socialItems = document.querySelectorAll(".social-item");

  // Animasi muncul ketika section masuk ke layar
  const socialObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        socialItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("is-visible");
          }, index * 90);
        });

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
    }
  );

  const socialSection = document.querySelector(".portfolio-social");

  if (socialSection) {
    socialObserver.observe(socialSection);
  }

  // Efek ripple saat tombol diklik
  socialItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      const oldRipple = item.querySelector(".social-ripple");

      if (oldRipple) {
        oldRipple.remove();
      }

      const ripple = document.createElement("span");
      const itemPosition = item.getBoundingClientRect();

      ripple.className = "social-ripple";
      ripple.style.left = `${event.clientX - itemPosition.left}px`;
      ripple.style.top = `${event.clientY - itemPosition.top}px`;

      item.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    });
  });
});

  document.addEventListener('DOMContentLoaded', startBackgroundMusic);
  window.addEventListener('load', startBackgroundMusic);
  window.addEventListener('pageshow', startBackgroundMusic);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startBackgroundMusic();
    }
  });

  document.addEventListener('click', () => {
    playClickSound();
  }, { passive: true });

  let scrollSoundTimer = null;
  const handleScrollSound = () => {
    if (scrollSoundTimer) return;
    playScrollSound();
    scrollSoundTimer = window.setTimeout(() => {
      scrollSoundTimer = null;
    }, 160);
  };

  window.addEventListener('wheel', handleScrollSound, { passive: true });
  window.addEventListener('touchmove', handleScrollSound, { passive: true });
  window.addEventListener('scroll', handleScrollSound, { passive: true });
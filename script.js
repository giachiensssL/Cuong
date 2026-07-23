document.addEventListener('DOMContentLoaded', () => {

    // ── DOM REFS ──────────────────────────────────────────────
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainScreen    = document.getElementById('main-screen');
    const btnYes        = document.getElementById('btn-yes');
    const btnNo         = document.getElementById('btn-no');
    const trollHint     = document.getElementById('troll-hint');
    const bgMusic       = document.getElementById('bg-music');
    const btnPlayPause  = document.getElementById('btn-play-pause');
    const progressBar   = document.getElementById('progress-bar');
    const progressCont  = document.getElementById('progress-container');
    const musicTime     = document.getElementById('music-time');
    const btnWish       = document.getElementById('btn-generate-wish');
    const btnFire       = document.getElementById('btn-fireworks');
    const wishText      = document.getElementById('troll-wish');
    const modal         = document.getElementById('troll-modal');
    const modalOverlay  = document.getElementById('modal-overlay');
    const modalClose    = document.getElementById('modal-close');
    const modalBody     = document.getElementById('modal-body-content');

    // ── PETAL PARTICLES ───────────────────────────────────────
    const petalsBg = document.getElementById('petals-bg');
    const petalColors = ['#F7C5D5','#F9E0E8','#D4899A','#FBDDE8','#F2BED1','#EFD4DE'];

    const createPetals = () => {
        const count = window.innerWidth < 768 ? 14 : 28;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('petal');
            const size = 8 + Math.random() * 14;
            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${petalColors[Math.floor(Math.random() * petalColors.length)]};
                left: ${Math.random() * 100}vw;
                top: ${-20 - Math.random() * 100}px;
                animation-duration: ${8 + Math.random() * 12}s;
                animation-delay: ${Math.random() * 8}s;
                border-radius: ${Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%'};
                opacity: 0;
            `;
            petalsBg.appendChild(p);
        }
    };
    createPetals();

    // ── TROLL BUTTON "NO" ─────────────────────────────────────
    let noClickCount = 0;
    const VIEWPORT_PAD = 70;

    const runAwayBtn = () => {
        btnNo.style.position = 'fixed';
        btnNo.style.zIndex   = '9999';
        const bw = btnNo.offsetWidth;
        const bh = btnNo.offsetHeight;
        const maxX = window.innerWidth  - bw - VIEWPORT_PAD;
        const maxY = window.innerHeight - bh - VIEWPORT_PAD;
        btnNo.style.left = Math.max(VIEWPORT_PAD, Math.random() * maxX) + 'px';
        btnNo.style.top  = Math.max(VIEWPORT_PAD, Math.random() * maxY) + 'px';
        noClickCount++;
        if (noClickCount >= 3) trollHint.style.display = 'block';
    };

    btnNo.addEventListener('mouseover',  runAwayBtn);
    btnNo.addEventListener('touchstart', e => { e.preventDefault(); runAwayBtn(); });
    btnNo.addEventListener('click', () => {
        showModal(`
            <span class="modal-icon">😏</span>
            <div class="modal-tag">Nice try</div>
            <p class="modal-title">Bắt được rồi!</p>
            <p class="modal-desc">Nút "Không" sinh ra chỉ để làm cảnh thôi bạn ơi! Quay lại và nhấn nút hồng đi nhé!</p>
        `);
    });

    // ── YES BUTTON → LAUNCH MAIN SCREEN ──────────────────────
    btnYes.addEventListener('click', () => {
        // Amora-themed confetti (pink + rose gold)
        const amoraColors = ['#F7C5D5','#D4899A','#C9A96E','#FFF0F5','#8B3A52'];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: amoraColors });
        setTimeout(() => {
            confetti({ particleCount: 60, angle: 55, spread: 60, origin: { x: 0 }, colors: amoraColors });
        }, 300);
        setTimeout(() => {
            confetti({ particleCount: 60, angle: 125, spread: 60, origin: { x: 1 }, colors: amoraColors });
        }, 500);

        // Transition
        welcomeScreen.classList.remove('active');
        welcomeScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('active');

        // Play music
        bgMusic.play().catch(() => {});
        btnPlayPause.textContent = '⏸';

        // Trigger slide-in animations after brief delay (DOM needs to be visible)
        setTimeout(triggerSlideIns, 80);

        // Start balloons
        startBalloons();
    });

    // ── SLIDE-IN OBSERVER ─────────────────────────────────────
    const triggerSlideIns = () => {
        const targets = mainScreen.querySelectorAll(
            '.slide-in-left, .slide-in-right, .slide-in-up'
        );
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('animated');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(t => io.observe(t));
    };

    // ── MUSIC PLAYER ──────────────────────────────────────────
    btnPlayPause.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            btnPlayPause.textContent = '⏸';
        } else {
            bgMusic.pause();
            btnPlayPause.textContent = '▶';
        }
    });

    bgMusic.addEventListener('timeupdate', () => {
        if (!bgMusic.duration) return;
        const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
        progressBar.style.width = pct + '%';
        const m = Math.floor(bgMusic.currentTime / 60);
        const s = Math.floor(bgMusic.currentTime % 60);
        musicTime.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    });

    progressCont.addEventListener('click', e => {
        if (bgMusic.duration) {
            bgMusic.currentTime = (e.offsetX / progressCont.offsetWidth) * bgMusic.duration;
        }
    });

    // ── BALLOONS ──────────────────────────────────────────────
    const balloonCont   = document.getElementById('balloons');
    const balloonColors = ['#F7C5D5','#D4899A','#C9A96E','#FBDDE8','#8B3A52','#F2BED1','#C9A96E'];

    const makeBalloon = () => {
        const b = document.createElement('div');
        b.classList.add('balloon');
        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        const size  = 35 + Math.random() * 25;
        const dur   = 12 + Math.random() * 8;
        b.style.cssText = `
            width: ${size}px;
            height: ${size * 1.3}px;
            background: ${color};
            left: ${Math.random() * 95}vw;
            bottom: -80px;
            animation-duration: ${dur}s;
        `;
        const str = document.createElement('div');
        str.classList.add('balloon-string');
        b.appendChild(str);
        balloonCont.appendChild(b);
        setTimeout(() => b.remove(), dur * 1000);
    };

    const startBalloons = () => {
        for (let i = 0; i < 5; i++) setTimeout(makeBalloon, i * 600);
        setInterval(makeBalloon, 2500);
    };

    // ── FILM CARD CLICK ───────────────────────────────────────
    document.querySelectorAll('.film-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('wobble-anim');
            card.addEventListener('animationend', () => card.classList.remove('wobble-anim'), { once: true });
            const rect = card.getBoundingClientRect();
            confetti({
                particleCount: 25,
                spread: 45,
                origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
                colors: ['#F7C5D5','#D4899A','#C9A96E','#8B3A52']
            });
        });
    });

    // ── MODAL HELPERS ─────────────────────────────────────────
    const showModal = html => {
        modalBody.innerHTML = html;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // ── GIFT BOXES ────────────────────────────────────────────
    document.querySelectorAll('.gift-item').forEach(gift => {
        gift.addEventListener('click', () => {
            const type = gift.dataset.gift;
            const colors = ['#F7C5D5','#D4899A','#C9A96E','#FBDDE8','#8B3A52'];
            confetti({ particleCount: 60, spread: 65, origin: { y: 0.75 }, colors });

            if (type === '1') {
                showModal(`
                    <div class="modal-tag">Quà tặng #1</div>
                    <span class="modal-icon">🛵</span>
                    <p class="modal-title">Siêu Xe SH 150i!</p>
                    <div style="display:inline-block;background:var(--rose);border-radius:12px;padding:6px 18px;font-size:0.72rem;letter-spacing:2px;color:var(--deep);font-weight:700;margin-bottom:14px;">WOOD DELUXE EDITION</div>
                    <p class="modal-desc">Chúc mừng! Bạn đã trúng chiếc <strong>SH 150i phiên bản gỗ ép cao cấp</strong> — chạy hoàn toàn bằng cơm, không cần đổ xăng, thân thiện với môi trường 100%. Giao hàng toàn quốc (bạn tự đẩy về nhé)! 😂</p>
                `);
            } else if (type === '2') {
                showModal(`
                    <div class="modal-tag">Quà tặng #2</div>
                    <span class="modal-icon">💸</span>
                    <p class="modal-title">10 Tỷ Tiền Mặt!</p>
                    <div style="display:inline-block;background:var(--gold-lt);border-radius:12px;padding:6px 18px;font-size:0.72rem;letter-spacing:2px;color:#8a6020;font-weight:700;margin-bottom:14px;">HELL BANK CORP</div>
                    <p class="modal-desc">Giao dịch thành công! 10,000,000,000 VND đã được chuyển vào tài khoản của bạn tại <strong>Ngân Hàng Địa Phủ</strong>. Vui lòng chuẩn bị nhang đèn và liên hệ Diêm Vương để rút tiền mặt. Chúc mừng! 🥳</p>
                `);
            } else {
                showModal(`
                    <div class="modal-tag">Quà tặng #3 ✨</div>
                    <span class="modal-icon">💕</span>
                    <p class="modal-title">Hộp Quà Thật Lòng</p>
                    <p class="modal-desc">Cảm ơn bạn đã kiên nhẫn chịu đựng cả đống trò troll từ nãy đến giờ. Đây mới là món quà thực sự:</p>
                    <div class="modal-letter">
                        Gửi bạn thân mến,<br><br>
                        Lại thêm một tuổi mới rồi! Chúc bạn luôn tràn đầy năng lượng, xinh đẹp rạng rỡ, và luôn giữ được nụ cười tươi như hôm nay.<br><br>
                        Cảm ơn bạn vì những kỷ niệm cùng nhau — những lúc cười té ghế, những lúc nói chuyện mãi không thôi. Tình bạn của chúng ta thật đáng trân trọng.<br><br>
                        🎀 <strong>Happy Birthday, bạn ơi! Chúc bạn mọi điều tốt đẹp nhất!</strong> 🎀
                    </div>
                `);
            }
        });
    });

    // ── TROLL WISHES ─────────────────────────────────────────
    const wishes = [
        "Chúc bạn tuổi mới càng ngày càng ít tóc, bù lại tiền nhiều như rác! 💇‍♂️💸",
        "Chúc bạn mau tìm được bồ để tụi mình còn ăn ké đám cưới. Ế lâu quá rồi đó! 🥺💍",
        "Tuổi mới chúc bạn ăn hoài không béo — hoặc béo hoài không giảm được! 🎂🍕",
        "Chúc bạn kiếm thật nhiều tiền để nuôi mình. Yêu thương nhiều! 🥰💵",
        "Mừng sinh nhật! Bớt điệu đà, bớt đòi quà đi nhé! 🤫🎁",
        "Chúc bạn thăng tiến vèo vèo, tiền vô như nước sông, tiền ra nhỏ giọt như café phin. ☕",
        "Chúc bạn luôn giữ vẻ đẹp trai/xinh gái tự phong của mình, không ai tranh nổi đâu! 😂✨",
        "Chúc bạn tuổi mới bớt cằn nhằn và bớt báo mẹ bạn bè nha! 🚨",
        "Happy Birthday! Tuổi mới tích đức lấy chồng/vợ nha bạn hiền! 🙏💍"
    ];

    btnWish.addEventListener('click', () => {
        const w = wishes[Math.floor(Math.random() * wishes.length)];
        wishText.classList.add('scale-pop');
        wishText.textContent = `"${w}"`;
        wishText.addEventListener('animationend', () => wishText.classList.remove('scale-pop'), { once: true });
        confetti({ particleCount: 18, spread: 40, origin: { y: 0.8 }, colors: ['#F7C5D5','#D4899A','#C9A96E','#8B3A52'] });
    });

    // ── FIREWORKS ────────────────────────────────────────────
    btnFire.addEventListener('click', () => {
        const end = Date.now() + 3000;
        const colors = ['#F7C5D5','#D4899A','#C9A96E','#8B3A52','#FDF6F0'];
        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    });
});

import os, shutil
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

os.makedirs("images", exist_ok=True)
plt.style.use('dark_background')
plt.rcParams.update({'font.family': 'serif', 'font.size': 10, 'axes.grid': False,
                     'figure.facecolor': '#0d121f', 'axes.facecolor': '#0d121f',
                     'savefig.facecolor': '#0d121f'})
rng = np.random.default_rng(7)  # deterministic

# keep the block diagram from folder 27
if os.path.exists("27/5.png"):
    shutil.copy("27/5.png", "images/l27_adaptive_block.png")

# ---------- L27 fig 1: analog vs matched-z digital response ----------
T = 0.1
Kd = 0.004315
w = np.linspace(1e-3, np.pi, 800)
z1 = np.exp(-1j * w)
Hd = Kd * (1 + z1) ** 2 / ((1 - np.exp(-0.1) * z1) * (1 - np.exp(-0.2) * z1))
Om = w / T
Ha = 2 / ((1j * Om + 1) * (1j * Om + 2))
fig, ax = plt.subplots(figsize=(7.5, 4))
ax.plot(w / np.pi, np.abs(Ha), color='#0dd5c5', lw=2, label=r"$|H_a(j\Omega)|$, $\Omega=\omega/T$")
ax.plot(w / np.pi, np.abs(Hd), color='#8b5cf6', lw=2, ls='--', label=r"$|H(e^{j\omega})|$ matched-z")
ax.set_xlabel(r"$\omega/\pi$"); ax.set_ylabel("Magnitude")
ax.set_title("Example 27.1: analog prototype vs digital design (T = 0.1 s)")
ax.legend(); fig.tight_layout(); fig.savefig("images/l27_matchedz_response.png", dpi=170); plt.close(fig)
print("DC gain digital:", abs(Hd[0]), " at pi:", abs(Hd[-1]), " analog at pi/T:", abs(Ha[-1]))

# ---------- L27 fig 2: LMS system identification ----------
M, N = 4, 1500
h_true = np.array([0.8, -0.4, 0.2, 0.1])
x = rng.standard_normal(N + M)
d = np.convolve(x, h_true)[:N + M] + 0.05 * rng.standard_normal(N + M)
fig, ax = plt.subplots(figsize=(7.5, 4))
for mu, c in [(0.005, '#10b981'), (0.02, '#0dd5c5'), (0.08, '#8b5cf6')]:
    wv = np.zeros(M); err = []
    for n in range(M, N + M):
        xv = x[n - M + 1:n + 1][::-1]
        e = d[n] - wv @ xv
        wv = wv + 2 * mu * e * xv
        err.append(e * e)
    sm = np.convolve(err, np.ones(20) / 20, mode='same')
    ax.semilogy(sm, color=c, label=rf"$\mu={mu}$")
ax.set_xlabel("iteration n"); ax.set_ylabel(r"$e^2[n]$ (smoothed)")
ax.set_title("LMS learning curves: step-size trade-off"); ax.legend()
fig.tight_layout(); fig.savefig("images/l27_lms_curves.png", dpi=170); plt.close(fig)

# ---------- L28 fig 1: positional encoding as phasors ----------
d_model, L = 64, 100
pos = np.arange(L)[:, None]
i = np.arange(d_model // 2)[None, :]
om = 10000 ** (-2 * i / d_model)
PE = np.zeros((L, d_model)); PE[:, 0::2] = np.sin(pos * om); PE[:, 1::2] = np.cos(pos * om)
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.5, 4))
im = a1.imshow(PE, aspect='auto', cmap='twilight_shifted')
a1.set_xlabel("embedding dimension (low index = high frequency)"); a1.set_ylabel("position p")
a1.set_title("Sinusoidal positional encoding")
th = np.linspace(0, 2 * np.pi, 200)
a2.plot(np.cos(th), np.sin(th), color=(1, 1, 1, 0.2))
for k, (w_, c) in enumerate([(1.0, '#ef4444'), (0.1, '#0dd5c5'), (0.01, '#8b5cf6')]):
    for p in [0, 5, 10]:
        a2.annotate("", xy=(np.cos(p * w_), np.sin(p * w_)), xytext=(0, 0),
                    arrowprops=dict(arrowstyle="->", color=c, alpha=0.4 + 0.3 * (p > 0)))
    a2.plot([], [], color=c, label=rf"$\omega={w_}$")
a2.set_aspect('equal'); a2.legend(loc='lower left', fontsize=8)
a2.set_title("Phasors at p = 0, 5, 10 for 3 frequencies")
fig.tight_layout(); fig.savefig("images/l28_positional_phasors.png", dpi=170); plt.close(fig)

# ---------- L28 fig 2: SVD denoising ----------
r, n1, n2 = 3, 60, 80
A = rng.standard_normal((n1, r)) @ rng.standard_normal((r, n2))
A /= np.linalg.norm(A, 2)
noisy = A + 0.01 * rng.standard_normal((n1, n2))
U, S, Vt = np.linalg.svd(noisy, full_matrices=False)
den = (U[:, :r] * S[:r]) @ Vt[:r]
fig, ax = plt.subplots(1, 3, figsize=(10, 3.4))
ax[0].semilogy(S, 'o-', color='#0dd5c5', ms=3); ax[0].axvline(r - 0.5, color='#ef4444', ls='--')
ax[0].set_title("Singular values (cut at rank 3)"); ax[0].set_xlabel("k")
ax[1].imshow(noisy, cmap='magma'); ax[1].set_title(f"Noisy, err={np.linalg.norm(noisy - A):.3f}")
ax[2].imshow(den, cmap='magma'); ax[2].set_title(f"Rank-3 SVD, err={np.linalg.norm(den - A):.3f}")
for a in ax[1:]: a.axis('off')
fig.tight_layout(); fig.savefig("images/l28_svd_denoise.png", dpi=170); plt.close(fig)
print("SVD err noisy/den:", np.linalg.norm(noisy - A), np.linalg.norm(den - A))

# ---------- L28 fig 3: local averaging vs non-local (attention-like) averaging ----------
Ns, P = 400, 7
t = np.arange(Ns)
clean = np.where((t % 100) < 50, 1.0, 0.0) + 0.5 * np.sin(2 * np.pi * t / 25) * ((t % 100) >= 50)
noisy1 = clean + 0.25 * rng.standard_normal(Ns)
pad = np.pad(noisy1, P // 2, mode='edge')
patches = np.stack([pad[k:k + P] for k in range(Ns)])
h2 = 0.35
D2 = ((patches[:, None, :] - patches[None, :, :]) ** 2).mean(-1)
Wt = np.exp(-D2 / 0.05)
Wt /= Wt.sum(1, keepdims=True)  # softmax over negative distance
nonlocal_est = Wt @ noisy1
local_est = np.convolve(noisy1, np.ones(9) / 9, mode='same')
mse = lambda a: np.mean((a - clean) ** 2)
fig, ax = plt.subplots(figsize=(9, 3.6))
ax.plot(noisy1, color=(1, 1, 1, 0.25), lw=0.8, label=f"noisy (MSE {mse(noisy1):.3f})")
ax.plot(local_est, color='#ef4444', lw=1.4, label=f"local moving average (MSE {mse(local_est):.3f})")
ax.plot(nonlocal_est, color='#0dd5c5', lw=1.6, label=f"non-local / attention-style (MSE {mse(nonlocal_est):.3f})")
ax.legend(fontsize=8, loc='upper right'); ax.set_title("Self-similarity denoising: patch-similarity weights")
fig.tight_layout(); fig.savefig("images/l28_nonlocal_attention.png", dpi=170); plt.close(fig)
print("MSE noisy/local/nonlocal:", mse(noisy1), mse(local_est), mse(nonlocal_est))




"""Sound design sintetizado (sem música, sem samples de terceiros).
Pulsos eletrônicos, clicks técnicos, impactos graves suaves e transições de sinal,
sincronizados com a timeline (ver CENAS.md). Gera _base/assets/audio/sound-design.wav.
Uso (na pasta pragma-motion): python3 src/sound_design.py && python3 src/build.py"""
import numpy as np, wave
from pathlib import Path

SR = 48000
DUR = 21.5
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(2026)

def t_(d): return np.arange(int(SR * d)) / SR

def env_exp(d, a=0.003, k=6.0):
    t = t_(d); e = np.exp(-k * t / d); att = np.clip(t / a, 0, 1); return e * att

def lp(x, cutoff):  # one-pole low-pass
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y

def hp(x, cutoff): return x - lp(x, cutoff)

def place(at, sig, gain=1.0, pan=0.0):
    i = int(at * SR); j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan))
    R[i:j] += s * np.sqrt(0.5 * (1 + pan))

def blip(f=1760, d=0.09, g=0.25):  # electronic pulse
    t = t_(d); return np.sin(2 * np.pi * f * t) * env_exp(d, 0.002, 7) * g

def click(d=0.012, g=0.35, tone=4200):  # technical click
    t = t_(d); n = rng.standard_normal(len(t)); s = hp(n, 2500) * 0.6 + np.sin(2 * np.pi * tone * t) * 0.5
    return s * env_exp(d, 0.0005, 9) * g

def sub(f0=58, d=1.2, g=0.6):  # soft low impact with pitch drop
    t = t_(d); f = f0 * (1 + 0.6 * np.exp(-t * 9)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph)
    return np.tanh(s * 1.2) * env_exp(d, 0.006, 4.5) * g

def sweep(d=0.8, f0=300, f1=5000, g=0.2, rise=True):  # signal transition (filtered noise sweep)
    t = t_(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); a_prev = 0.0
    fc = f0 * (f1 / f0) ** (t / d if rise else 1 - t / d)
    for i in range(len(n)):
        a = np.exp(-2 * np.pi * fc[i] / SR); a_prev = (1 - a) * n[i] + a * a_prev; out[i] = a_prev
    out = hp(out, 120); shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * shape * g / (np.abs(out).max() + 1e-9)

def tone_line(d=0.7, f0=880, f1=1320, g=0.08):  # thin sine "signal line"
    t = t_(d); f = f0 + (f1 - f0) * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.sin(np.pi * t / d) ** 2 * g

def hum(d, g=0.05):  # control-room bed: low drone + faint harmonics
    t = t_(d); s = 0.6 * np.sin(2 * np.pi * 55 * t) + 0.25 * np.sin(2 * np.pi * 110 * t + 0.3) + 0.08 * np.sin(2 * np.pi * 165 * t)
    s *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    fade = np.minimum(np.clip(t / 1.2, 0, 1), np.clip((d - t) / 1.5, 0, 1))
    return s * fade * g

# ---- bed ----
place(0.0, hum(20.6, 0.045))

# S1 — signal (0.0–2.5)
place(0.1, tone_line(0.75, 700, 1400, 0.07), pan=-0.2)
place(0.1, sweep(0.75, 600, 7000, 0.07), pan=0.3)
place(0.55, blip(1975, 0.12, 0.22))
place(0.8, sub(52, 1.3, 0.45))
place(0.82, sweep(0.5, 2000, 300, 0.06, rise=False))
for i in range(8):
    place(0.9 + i * 0.15, click(0.01, 0.12, 5200 - i * 180), pan=(-0.4 if i % 2 else 0.4))
place(1.35, blip(1318, 0.07, 0.12)); place(1.47, blip(1568, 0.07, 0.10))

# S2 — circle opens into the site (2.5–6.0)
place(2.2, sweep(0.9, 250, 6000, 0.16))
place(2.95, sub(46, 1.6, 0.6))
place(3.1, click(0.014, 0.25)); place(3.22, click(0.014, 0.2))
place(4.75, sweep(0.45, 4000, 600, 0.06, rise=False))
place(5.0, sweep(1.0, 180, 2400, 0.09))
place(5.95, blip(1046, 0.1, 0.12))

# S3 — identity (6.0–10.0)
place(6.4, sweep(0.5, 6000, 500, 0.08, rise=False))
place(6.6, click(0.012, 0.22))
for i in range(4):
    place(6.78 + i * 0.14, click(0.016, 0.22, 3600 + i * 300), pan=[-0.5, 0.5, 0.4, -0.2][i])
    place(6.8 + i * 0.14, sub(70, 0.35, 0.12))
place(7.65, tone_line(1.5, 660, 990, 0.05))
for i, t in enumerate([7.66, 8.05, 8.75, 9.1]):
    place(t, blip([1568, 1760, 1976, 2349][i], 0.11, 0.18), pan=[-0.4, 0.4, 0.4, -0.4][i])

# S4 — experience (10.0–14.5)
place(9.75, sweep(0.6, 5000, 400, 0.08, rise=False))
place(10.0, sub(55, 1.1, 0.4))
place(10.05, sweep(0.7, 400, 5000, 0.08))
place(10.45, click(0.012, 0.18))
place(12.25, sweep(0.6, 300, 9000, 0.14))
place(12.25, tone_line(0.6, 1200, 2400, 0.05))
place(12.8, click(0.012, 0.2))

# S5 — stack (14.5–17.5)
place(14.0, sweep(0.6, 3500, 300, 0.08, rise=False))
place(14.55, sub(50, 1.2, 0.42))
for i in range(4):
    t = 14.95 + i * 0.38
    place(t, blip([880, 1046, 1318, 1568][i], 0.12, 0.2), pan=[-0.5, 0.5, -0.5, 0.5][i])
    place(t + 0.01, click(0.01, 0.12))

# S6 — close (17.5–21.5)
place(17.45, sweep(0.6, 6000, 200, 0.12, rise=False))
place(18.0, tone_line(0.85, 1400, 600, 0.07))
place(18.75, sub(44, 2.4, 0.62))
place(18.77, sweep(0.9, 200, 3000, 0.06))
place(18.95, click(0.012, 0.18)); place(19.07, click(0.012, 0.15))
place(19.4, blip(1318, 0.18, 0.2)); place(19.42, blip(2637, 0.12, 0.06))

# ---- master: gentle glue, normalise to ~-3 dBFS, fade tail ----
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.abs(mix).max() * 0.7
tail = np.clip((DUR - np.arange(N) / SR) / 0.8, 0, 1)[:, None]; mix *= tail
out = Path(__file__).resolve().parent.parent / "_base/assets/audio/sound-design.wav"
pcm = (mix * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", out)

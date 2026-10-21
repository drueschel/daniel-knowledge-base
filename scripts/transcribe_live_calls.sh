#!/bin/bash
set -e

cd /Users/danielrueschel/DEV/daniel-knowledge-base/tmp_downloads/gopal

echo "=========================================="
echo "Transcribing: Live Call 30. August Teil 1 (Angst & Panik)..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "Live_Call_30_August_Teil_1_Angst_und_Panik.wav" -osrt -otxt

echo "=========================================="
echo "Transcribing: Live Call 30. August Teil 2 (Konflikte)..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "Live_Call_30_August_Teil_2_Konflikte_mit_dem_Partner.wav" -osrt -otxt

echo "=========================================="
echo "Transcribing: Live Call 04. Oktober (Angst & Panik)..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "Live_Call_04_Oktober_Angst_und_Panik.wav" -osrt -otxt

echo "All 3 Live Call transcriptions finished!"

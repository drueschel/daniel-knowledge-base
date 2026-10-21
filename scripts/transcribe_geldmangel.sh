#!/bin/bash
set -e

cd /Users/danielrueschel/DEV/daniel-knowledge-base/tmp_downloads/gopal

echo "=========================================="
echo "Transcribing: 07 Einzelsitzung Geldmangel Teil 1..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "07_Einzelsitzung_Geldmangel_Teil_1.wav" -osrt -otxt

echo "=========================================="
echo "Transcribing: 08 Einzelsitzung Geldmangel Teil 2..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "08_Einzelsitzung_Geldmangel_Teil_2.wav" -osrt -otxt

echo "=========================================="
echo "Transcribing: 09 Einzelsitzung Geldmangel Teil 3..."
echo "=========================================="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "09_Einzelsitzung_Geldmangel_Teil_3.wav" -osrt -otxt

echo "All 3 Geldmangel sessions transcribed successfully!"

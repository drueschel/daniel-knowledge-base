#!/bin/bash
set -e

cd /Users/danielrueschel/DEV/daniel-knowledge-base/tmp_downloads/gopal

echo "Transcribing Session 1..."
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "02_Einzelsitzung_Stress_Burnout_Teil_1.wav" -osrt -otxt

echo "Transcribing Session 2..."
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -f "03_Einzelsitzung_Stress_Burnout_Teil_2.wav" -osrt -otxt

echo "All transcriptions finished!"
